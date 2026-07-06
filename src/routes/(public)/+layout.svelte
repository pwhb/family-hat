<script lang="ts">
	import { page } from '$app/state';
	import Nav from '$lib/components/nav.svelte';
	let { children } = $props();
	function handleBack() {
		// Safe SvelteKit router back navigation
		history.back();
	}
</script>

<Nav />

{#if page.url.pathname !== '/'}
	<div class="fixed top-20 left-6 z-50">
		<button
			onclick={handleBack}
			class="btn btn-circle border border-primary-content/20 bg-gray-100 shadow-lg transition-transform hover:scale-120"
			aria-label="Go back"
		>
			<img src="/back-svgrepo-com.svg" class="p-2" alt="back" />
		</button>
	</div>
{/if}
{@render children()}
