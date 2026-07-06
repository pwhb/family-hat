<script lang="ts">
	import BackButton from '$lib/components/back_button.svelte';
	import Nav from '$lib/components/nav.svelte';
	let { children } = $props();
</script>

<Nav />

<BackButton />
{@render children()}
