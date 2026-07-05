<script lang="ts">
	import { page } from '$app/state';

	let { value = $bindable(), name = 'upload' } = $props();
	let uploading = $state(false);

	const onchange = async (e: Event & { currentTarget: HTMLInputElement }) => {
		try {
			const file = e.currentTarget.files?.[0];
			uploading = true;
			if (file?.type) {
				const res = await fetch('/api/uploads/avatars', {
					headers: {
						'Content-Type': file.type
					}
				});
				const resJSON = await res.json();
				if (resJSON && resJSON.url) {
					const uploadRes = await fetch(resJSON.url, {
						method: 'PUT',
						headers: {
							'Content-Type': file.type
						},
						body: file
					});
					if (uploadRes.ok) {
						value = resJSON.key;
					}
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			uploading = false;
		}
	};
</script>

<div class="grid grid-cols-2">
	<input type="file" class="file-input" disabled={uploading} {onchange} />
	{#if value && !uploading}
		<div class="rounded-2xl bg-base-100 p-2 shadow-xl">
			<img src={`${page.data.config.s3BaseUrl}/${value}`} alt={name} />
		</div>
	{/if}
</div>
