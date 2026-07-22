<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/client/api';
	import Cropper from 'svelte-easy-crop';

	interface UploadProps {
		value?: string;
		name?: string;
		previewUrlKey?: string;
		cropRequired?: boolean;
		aspectRatio?: number;
		accept?: string[];
		callback?: (res: any) => any;
	}

	let {
		value = $bindable(''),
		previewUrlKey = '',
		name = 'upload',
		cropRequired = false,
		aspectRatio = 1,
		accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
		callback
	}: UploadProps = $props();

	let image = $state<string | null>(null);
	let previewUrl = $state<string>(
		(() => (previewUrlKey ? page.data?.pageData?.data?.[previewUrlKey] : ''))()
	);
	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);

	let uploading = $state(false);
	let showCropper = $state(false);

	let selectedFile = $state<File | null>(null);
	let croppedPixels = $state<{ x: number; y: number; width: number; height: number } | null>(null);

	let fileInputEl = $state<HTMLInputElement | null>(null);

	const getCroppedImg = (
		imageSrc: string,
		pixelCrop: { x: number; y: number; width: number; height: number }
	): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.src = imageSrc;
			img.crossOrigin = 'anonymous';

			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');

				if (!ctx) {
					reject(new Error('Failed to get 2d context from canvas'));
					return;
				}

				canvas.width = pixelCrop.width;
				canvas.height = pixelCrop.height;

				ctx.drawImage(
					img,
					pixelCrop.x,
					pixelCrop.y,
					pixelCrop.width,
					pixelCrop.height,
					0,
					0,
					pixelCrop.width,
					pixelCrop.height
				);

				canvas.toBlob((blob) => {
					if (!blob) {
						reject(new Error('Canvas conversion to Blob failed'));
						return;
					}
					resolve(blob);
				}, selectedFile?.type || 'image/jpeg');
			};

			img.onerror = (err) => reject(err);
		});
	};

	const onchange = async (e: Event & { currentTarget: HTMLInputElement }) => {
		const file = e.currentTarget.files?.[0];
		if (!file) return;

		selectedFile = file;

		if (image && image.startsWith('blob:')) {
			URL.revokeObjectURL(image);
		}

		if (cropRequired) {
			image = URL.createObjectURL(file);
			showCropper = true;
		} else {
			showCropper = false;
			image = null;
			await handleUpload();
		}

		if (fileInputEl) fileInputEl.value = '';
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		try {
			uploading = true;
			let uploadPayload: Blob | File = selectedFile;

			if (cropRequired && image && croppedPixels) {
				uploadPayload = await getCroppedImg(image, croppedPixels);
			}

			const res = await api.upload(uploadPayload);
			if (res && res.key && res.previewUrl) {
				value = res.key;
				previewUrl = res.previewUrl;
				if (callback && typeof callback === 'function') {				
					callback(res)
				}
			}
			resetWorkflow();
		} catch (e) {
			console.error('Upload lifecycle error:', e);
		} finally {
			uploading = false;
		}
	};

	const resetWorkflow = () => {
		showCropper = false;
		if (image && image.startsWith('blob:')) {
			URL.revokeObjectURL(image);
		}
		image = null;
		selectedFile = null;
		croppedPixels = null;
	};

	const removeImage = () => {
		value = '';
		previewUrl = '';
		resetWorkflow();
	};
</script>

<div class="flex w-full max-w-sm flex-col gap-4">
	<input
		type="file"
		bind:this={fileInputEl}
		class="hidden"
		accept={accept.join(',')}
		disabled={uploading}
		{onchange}
	/>

	{#if uploading}
		<div
			class="bg-base-50 flex w-64 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 p-8"
		>
			<span class="loading mb-2 loading-lg loading-bars text-primary"></span>
			<p class="text-sm text-base-content/70">Uploading ...</p>
		</div>
	{:else if showCropper && image}
		<div class="flex flex-col gap-3">
			<div class="relative h-64 w-full overflow-hidden rounded-2xl bg-neutral shadow-inner">
				<Cropper
					{image}
					bind:crop
					bind:zoom
					aspect={aspectRatio}
					oncropcomplete={({ pixels }) => {
						croppedPixels = pixels;
					}}
				/>
			</div>
			<div class="flex justify-end gap-2">
				<button type="button" class="btn btn-ghost btn-sm" onclick={resetWorkflow}> Cancel </button>
				<button
					type="button"
					class="btn btn-sm btn-primary"
					disabled={!croppedPixels}
					onclick={handleUpload}
				>
					Save & Upload
				</button>
			</div>
		</div>
	{:else if value && previewUrl}
		<div
			class="group relative aspect-square w-64 overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-1 shadow-md"
		>
			<img
				src={previewUrl}
				alt={name}
				class="h-full w-full rounded-xl object-cover transition-all duration-200 group-hover:scale-105 group-hover:blur-[2px] group-hover:brightness-75"
			/>

			<div
				class="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
			>
				<button
					type="button"
					class="btn-glass btn w-32 shadow-md btn-sm btn-neutral"
					onclick={() => fileInputEl?.click()}
				>
					Change
				</button>
				<button
					type="button"
					class="btn-glass btn w-32 shadow-md btn-sm btn-error"
					onclick={removeImage}
				>
					Remove
				</button>
			</div>
		</div>
	{:else}
		<div
			class="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100/50 p-8 text-center"
		>
			<div class="mb-3 text-base-content/30">
				<img src="/upload-minimalistic-svgrepo-com.svg" alt="upload" class="h-12 w-12 opacity-40" />
			</div>
			<button type="button" class="btn btn-sm btn-primary" onclick={() => fileInputEl?.click()}>
				Choose
			</button>
		</div>
	{/if}
</div>
