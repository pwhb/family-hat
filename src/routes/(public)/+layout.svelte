<script lang="ts">
	import './layout.css';
	import Nav from '$lib/components/nav.svelte';
	let { children } = $props();
</script>

<Nav />
{@render children()}
