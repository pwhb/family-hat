<script lang="ts">
	import { page } from '$app/state';
	import { lang } from '$lib/store/lang.svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	const { config, pageConfig, pageData } = page.data;
	// Dynamic images array from pageConfig with safe fallback array
	const images = $derived(pageData ?? []);

	// Preset positions & rotations for desktop framing
	const desktopStyles = [
		{ desktopPos: 'md:top-10 md:left-6 lg:left-16', delay: '0s', rotation: '-rotate-6' },
		{ desktopPos: 'md:top-12 md:right-6 lg:right-16', delay: '1.5s', rotation: 'rotate-6' },
		{ desktopPos: 'md:bottom-12 md:left-12 lg:left-24', delay: '2.8s', rotation: 'rotate-3' },
		{ desktopPos: 'md:bottom-10 md:right-10 lg:right-20', delay: '0.8s', rotation: '-rotate-6' }
	];

	// Map raw dynamic images to include frame styles
	let styledImages = $derived(
		images.map((img: any, i: number) => ({
			...img,
			...desktopStyles[i % desktopStyles.length]
		}))
	);

	// Split dynamically between top and bottom pairs for mobile
	let photosTop = $derived(styledImages.slice(0, Math.ceil(styledImages.length / 2)));
	let photosBottom = $derived(styledImages.slice(Math.ceil(styledImages.length / 2)));

	const rawMarkdownMap: Record<string, string> = pageConfig.heroTextMarkdown ?? {};
	const heroHtmlMap = Object.fromEntries(
		Object.entries(rawMarkdownMap).map(([k, md]) => [
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

<div
	class="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-base-200 px-4 py-8 md:justify-center md:py-0"
>
	<!-- MOBILE TOP PHOTOS (Desktop: Floats Top Left / Right) -->
	<div class="z-0 -mb-6 flex w-full max-w-sm justify-around gap-2 md:m-0 md:contents">
		{#each photosTop as photo}
			<figure
				class="animate-float w-36 shrink-0 rounded-sm bg-stone-50 p-2 pb-3 shadow-lg ring-1 ring-black/10 transition-transform duration-300 sm:w-44 md:absolute lg:w-52 dark:bg-stone-100 dark:text-stone-900 {photo.desktopPos} {photo.rotation}"
				style="animation-delay: {photo.delay};"
			>
				<div class="relative aspect-square w-full overflow-hidden bg-stone-900 shadow-inner">
					<img
						src={photo.src || photo.url}
						alt={photo.caption?.[lang.value] || photo.alt || 'Gallery photo'}
						class="h-full w-full object-cover brightness-95 contrast-[1.05] sepia-[0.1]"
						loading="lazy"
					/>
				</div>
				{#if photo.caption}
					<figcaption
						class="mt-1.5 text-center font-serif text-[11px] text-stone-700 italic sm:text-xs"
					>
						{typeof photo.caption === 'object' ? photo.caption[lang.value] : photo.caption}
					</figcaption>
				{/if}
			</figure>
		{/each}
	</div>

	<!-- CENTRAL HERO CONTENT CARD -->
	<div class="relative z-10 my-auto w-full max-w-xl text-center">
		<div
			class="rounded-3xl border border-white/20 bg-base-100/85 p-6 shadow-2xl backdrop-blur-md sm:p-8"
		>
			<h1 class="text-3xl font-bold tracking-tight sm:text-5xl">{config.appName[lang.value]}</h1>

			<div
				class="dark:prose-invert prose max-w-none py-4 text-sm leading-relaxed sm:py-6 sm:text-base"
			>
				{#key activeLang}
					{@html heroHtmlMap[activeLang] ?? ''}
				{/key}
			</div>

			<div class="flex justify-center gap-3 sm:gap-4">
				{#each pageConfig.buttons as btn}
					<a href={btn.link} class={`btn text-white ${btn.class}`}>
						{btn.label[lang.value]}
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- MOBILE BOTTOM PHOTOS (Desktop: Floats Bottom Left / Right) -->
	<div class="z-0 -mt-6 flex w-full max-w-sm justify-around gap-2 md:m-0 md:contents">
		{#each photosBottom as photo}
			<figure
				class="animate-float w-36 shrink-0 rounded-sm bg-stone-50 p-2 pb-3 shadow-lg ring-1 ring-black/10 transition-transform duration-300 sm:w-44 md:absolute lg:w-52 dark:bg-stone-100 dark:text-stone-900 {photo.desktopPos} {photo.rotation}"
				style="animation-delay: {photo.delay};"
			>
				<div class="relative aspect-square w-full overflow-hidden bg-stone-900 shadow-inner">
					<img
						src={photo.src || photo.url}
						alt={photo.caption?.[lang.value] || photo.alt || 'Gallery photo'}
						class="h-full w-full object-cover brightness-95 contrast-[1.05] sepia-[0.1]"
						loading="lazy"
					/>
				</div>
				{#if photo.caption}
					<figcaption
						class="mt-1.5 text-center font-serif text-[11px] text-stone-700 italic sm:text-xs"
					>
						{typeof photo.caption === 'object' ? photo.caption[lang.value] : photo.caption}
					</figcaption>
				{/if}
			</figure>
		{/each}
	</div>
</div>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}
</style>
