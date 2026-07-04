<script>
	import { toastManager } from '$lib/toast.svelte';
</script>

{#if toastManager.list.length}
	{#each toastManager.list as toast}
		<div class={toast.customClass ? toast.customClass : 'toast toast-end toast-top'}>
			<div class={toast.type ? `alert alert-${toast.type}` : 'alert alert-info'}>
				<span>{toast.message}</span>
			</div>
		</div>
	{/each}
{/if}
