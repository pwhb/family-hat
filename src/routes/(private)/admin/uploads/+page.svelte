<script lang="ts">
	import Upload from '$lib/components/admin/upload.svelte';
	import ImageFrame from '$lib/components/image_frame.svelte';
	import { toastManager } from '$lib/toast.svelte';
	type Upload = {
		url: string;
		key: string;
		previewUrl: string;
	};
	let uploads = $state<Upload[]>([]);
</script>

<div class="flex flex-col items-center justify-center gap-10">
	<Upload
		callback={(res) => {
			uploads.push(res);
		}}
	/>
	<div class="flex flex-col items-center gap-5">
		{#each uploads as upload, idx}
			<div class="flex items-center">
				<ImageFrame variant="filmstrip" src={upload.previewUrl} />

				<button
					onclick={() => {
						navigator.clipboard.writeText(upload.key);
						toastManager.show({
							type: 'success',
							message: 'Copied!'
						});
					}}
					class="btn ml-10 btn-xs btn-primary">Copy</button
				>
			</div>
		{/each}
	</div>
</div>
