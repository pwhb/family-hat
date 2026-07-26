<script lang="ts">
	import { page } from '$app/state';
	import ScrollWrapper from '$lib/components/scroll_wrapper.svelte';
	import { lang } from '$lib/store/lang.svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	const { pageConfig } = page.data;
	const markdownMap: Record<string, string> = pageConfig.markdown ?? {};
	const htmlMap = Object.fromEntries(
		Object.entries(markdownMap).map(([k, md]) => [
			k,
			marked.parse(md ?? '', { async: false }) as string
		])
	);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
	let activeLang = $derived(mounted ? lang.value : 'en');
</script>

<ScrollWrapper>
	{#key activeLang}
		{@html htmlMap[activeLang] ?? ''}
	{/key}
</ScrollWrapper>
