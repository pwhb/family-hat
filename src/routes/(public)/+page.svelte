<script>
	import { page } from '$app/state';
	import AmbientScatter from '$lib/components/home/ambient_scatter.svelte';
	import InfiniteReel from '$lib/components/home/infinite_reel.svelte';
	import LegacyHeroView from '$lib/components/home/legacy_hero_view.svelte';
</script>

{#if page.data.pageConfig.view === 'AmbientScatter'}
	<AmbientScatter />
{:else if page.data.pageConfig.view === 'InfiniteReel'}
	<InfiniteReel />
{:else}
	<LegacyHeroView />
{/if}
