<script lang="ts">
	import { page } from '$app/state';
	import { fillTemplate } from '$lib/client/common';

	const currentUrl = $derived(page.url.href);
	const seo = $derived(() => {
		const defaultSEO = page.data.config?.seo || {
			title: 'Inno Family',
			description: 'Family Tree Web App.',
			ogImage: '',
			keywords: 'family tree, genealogy, ancestry, lineage tracking, interactive platform'
		};
		const rawSeo = page.data.pageConfig?.seo || defaultSEO;
		return {
			title: rawSeo.titleTemplate
				? fillTemplate(rawSeo.titleTemplate, page.data)
				: rawSeo.title || defaultSEO.title,

			description: rawSeo.descriptionTemplate
				? fillTemplate(rawSeo.descriptionTemplate, page.data)
				: rawSeo.description || defaultSEO.description,

			ogImage: rawSeo.ogImageTemplate
				? fillTemplate(rawSeo.ogImageTemplate, page.data)
				: rawSeo.ogImage || defaultSEO.ogImage,
			keywords: rawSeo.keywords || defaultSEO.keywords
		};
	});
</script>

<svelte:head>
	<title>{seo().title}</title>
	<meta name="description" content={seo().description} />
	<meta name="keywords" content={seo().keywords} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={seo().title} />
	<meta property="og:description" content={seo().description} />
	<meta property="og:image" content={seo().ogImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={currentUrl} />
	<meta name="twitter:title" content={seo().title} />
	<meta name="twitter:description" content={seo().description} />
	<meta name="twitter:image" content={seo().ogImage} />
</svelte:head>
