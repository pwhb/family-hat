<script lang="ts">
	import { page } from '$app/state';
	import { api } from '$lib/client/api';
	import Cropper from 'svelte-easy-crop';

	interface UploadProps {
		value?: string;
		name?: string;
		cropRequired?: boolean;
		aspectRatio?: number;
		accept?: string[];
	}

	let {
		value = $bindable(''),
		name = 'upload',
		cropRequired = false,
		aspectRatio = 1,
		accept = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
	}: UploadProps = $props();

	let image = $state<string | null>(null);
	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);

	let uploading = $state(false);
	let showCropper = $state(false);

	let selectedFile = $state<File | null>(null);
	let croppedPixels = $state<{ x: number; y: number; width: number; height: number } | null>(null);

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

		// Clean up previous URLs
		if (image && image.startsWith('blob:')) {
			URL.revokeObjectURL(image);
		}

		if (cropRequired) {
			// Setup cropper workspace
			image = URL.createObjectURL(file);
			showCropper = true;
		} else {
			// Skip cropper workflow entirely and trigger raw upload directly
			showCropper = false;
			image = null;
			await handleUpload();
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		try {
			uploading = true;
			let uploadPayload: Blob | File = selectedFile;

			// If cropping is active and coordinates exist, process the canvas slice
			if (cropRequired && image && croppedPixels) {
				uploadPayload = await getCroppedImg(image, croppedPixels);
			}

			// Centralized API call
			value = await api.upload(uploadPayload);

			// Post-upload UI reset
			showCropper = false;
			if (image && image.startsWith('blob:')) {
				URL.revokeObjectURL(image);
			}
			image = null;
		} catch (e) {
			console.error('Upload lifecycle error:', e);
		} finally {
			uploading = false;
		}
	};
</script>

<div class="flex flex-col gap-4">
	{#if uploading}
		<span class="loading loading-sm loading-bars"></span>
	{:else}
		<input
			type="file"
			class="file-input"
			accept={accept.join(',')}
			disabled={uploading}
			{onchange}
		/>

		{#if cropRequired && showCropper && image}
			<div class="relative h-64 w-md overflow-hidden rounded-2xl bg-neutral shadow-inner">
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
				<button
					type="button"
					class="btn btn-ghost"
					onclick={() => {
						showCropper = false;
						image = null;
					}}
					disabled={uploading}
				>
					Cancel
				</button>
				<button
					type="button"
					class="btn btn-primary"
					disabled={uploading || !croppedPixels}
					onclick={handleUpload}
				>
					{uploading ? 'Processing & Uploading...' : 'Save & Upload'}
				</button>
			</div>
		{/if}

		{#if value && !uploading && !showCropper}
			<div class="max-w-xs rounded-2xl border border-base-200 bg-base-100 p-2 shadow-xl">
				<img
					src={`${page.data.config.s3BaseUrl}/${value}`}
					alt={name}
					class="h-auto w-full rounded-xl object-cover"
				/>
			</div>
		{/if}
	{/if}
</div>
