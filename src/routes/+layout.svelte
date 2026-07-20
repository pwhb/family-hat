<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/inno.jpeg';
	import Seo from '$lib/components/seo.svelte';
	import { page } from '$app/state';
	import NavProgress from '$lib/components/nav_progress.svelte';
	import Toast from '$lib/components/toast.svelte';
	let { children } = $props();

	$effect(() => {
		if (page.data.config?.debug) {
			console.log(`🛠️ [Debug]:`, $state.snapshot(page.data));
		}
	});
</script>

<Seo />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<NavProgress />
<Toast />
{@render children()}
