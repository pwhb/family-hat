<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/inno.jpeg';
	import Seo from '$lib/components/seo.svelte';
	import { page } from '$app/state';
	let { children } = $props();

	$effect(() => {
		if (page.data.config?.debug) {
			console.log(`🛠️ [Debug] ${page.data.key}:`, $state.snapshot(page.data));
		}
	});
</script>

<Seo />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
