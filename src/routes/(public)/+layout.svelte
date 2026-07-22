<script lang="ts">
	import { page } from '$app/state';
	import BackButton from '$lib/components/back_button.svelte';
	import Nav from '$lib/components/nav.svelte';
	import { lang } from '$lib/store/lang.svelte';
	let { children } = $props();
	const { config } = page.data;
</script>

<div class={lang.value && config.customLayoutClass ? config.customLayoutClass[lang.value] : ''}>
	<Nav />
	<BackButton />
	{@render children()}
</div>
