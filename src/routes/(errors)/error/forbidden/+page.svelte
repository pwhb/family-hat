<script lang="ts">
	import { page } from '$app/state';
	import ErrorLayout from '$lib/components/error_layout.svelte';
	let fromPath = $derived(page.url.searchParams.get('from') || 'Unknown Path');
</script>

<ErrorLayout
	title="Forbidden"
	description="Sorry, you don't have access to this view."
	status={403}
	diagnosticPath={fromPath}
>
	{#snippet icon()}
		<div class="text-warning">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-16 animate-pulse"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
				/>
			</svg>
		</div>
	{/snippet}

	{#snippet actions()}
		<button type="button" class="btn btn-outline btn-sm" onclick={() => window.history.back()}>
			Go Back
		</button>
		<a href="/" class="btn btn-sm btn-primary">Go Home</a>
	{/snippet}
</ErrorLayout>
