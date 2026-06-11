<script lang="ts">
	import './layout.css';
	import Nav from '$lib/components/nav.svelte';
	import { onMount } from 'svelte';
	import { syncLocalStorage } from '$lib/util/client';
	import { langStore } from '$lib/store/lang';
	import { userIdStore } from '$lib/store/user';

	let { children } = $props();

	onMount(() => {
		syncLocalStorage('lang', langStore);
		syncLocalStorage('uuid', userIdStore, crypto.randomUUID());
	});
</script>

<Nav />
{@render children()}
