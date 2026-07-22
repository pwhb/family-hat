<script lang="ts">
	import { page } from '$app/state';
	import { lang } from '$lib/store/lang.svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	const { config, pageConfig, pageData } = page.data;
	const images = $derived(pageData ?? []);

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

<div class="relative hero min-h-[90vh] overflow-hidden bg-base-200 py-12">
	<!-- Dynamic Seamless Marquee Background -->
	{#if images.length > 0}
		<div
			class="pointer-events-none absolute inset-0 flex flex-col justify-between py-4 opacity-35 select-none"
		>
			<!-- TOP REEL (Forward) -->
			<div class="flex w-full overflow-hidden">
				<div class="animate-marquee flex shrink-0 gap-6">
					{#each images as photo}
						<figure
							class="w-52 shrink-0 -rotate-1 rounded-sm bg-stone-50 p-3 pb-4 shadow-xl sm:w-64 dark:bg-stone-100"
						>
							<div class="aspect-4/3 w-full overflow-hidden bg-stone-900 shadow-inner">
								<img
									src={photo.src || photo.url}
									alt={photo.caption?.[lang.value] || photo.alt || 'Film frame'}
									class="h-full w-full object-cover sepia-[0.15]"
								/>
							</div>
							{#if photo.caption}
								<figcaption class="mt-2 text-center font-serif text-xs text-stone-700 italic">
									{typeof photo.caption === 'object' ? photo.caption[lang.value] : photo.caption}
								</figcaption>
							{/if}
						</figure>
					{/each}
				</div>
				<!-- Exact Clone Track for Seamless Seamless Loop -->
				<div class="animate-marquee aria-hidden='true' flex shrink-0 gap-6">
					{#each images as photo}
						<figure
							class="w-52 shrink-0 -rotate-1 rounded-sm bg-stone-50 p-3 pb-4 shadow-xl sm:w-64 dark:bg-stone-100"
						>
							<div class="aspect-4/3 w-full overflow-hidden bg-stone-900 shadow-inner">
								<img
									src={photo.src || photo.url}
									alt={photo.caption?.[lang.value] || photo.alt || 'Film frame'}
									class="h-full w-full object-cover sepia-[0.15]"
								/>
							</div>
							{#if photo.caption}
								<figcaption class="mt-2 text-center font-serif text-xs text-stone-700 italic">
									{typeof photo.caption === 'object' ? photo.caption[lang.value] : photo.caption}
								</figcaption>
							{/if}
						</figure>
					{/each}
				</div>
			</div>

			<!-- BOTTOM REEL (Reverse) -->
			<div class="flex w-full overflow-hidden">
				<div class="animate-marquee-reverse flex shrink-0 gap-6">
					{#each images as photo}
						<figure
							class="w-52 shrink-0 rotate-2 rounded-sm bg-stone-50 p-3 pb-4 shadow-xl sm:w-64 dark:bg-stone-100"
						>
							<div class="aspect-4/3 w-full overflow-hidden bg-stone-900 shadow-inner">
								<img
									src={photo.src || photo.url}
									alt={photo.caption?.[lang.value] || photo.alt || 'Film frame'}
									class="h-full w-full object-cover sepia-[0.15]"
								/>
							</div>
							{#if photo.caption}
								<figcaption class="mt-2 text-center font-serif text-xs text-stone-700 italic">
									{typeof photo.caption === 'object' ? photo.caption[lang.value] : photo.caption}
								</figcaption>
							{/if}
						</figure>
					{/each}
				</div>
				<!-- Exact Clone Track for Seamless Loop -->
				<div class="animate-marquee-reverse aria-hidden='true' flex shrink-0 gap-6">
					{#each images as photo}
						<figure
							class="w-52 shrink-0 rotate-2 rounded-sm bg-stone-50 p-3 pb-4 shadow-xl sm:w-64 dark:bg-stone-100"
						>
							<div class="aspect-4/3 w-full overflow-hidden bg-stone-900 shadow-inner">
								<img
									src={photo.src || photo.url}
									alt={photo.caption?.[lang.value] || photo.alt || 'Film frame'}
									class="h-full w-full object-cover sepia-[0.15]"
								/>
							</div>
							{#if photo.caption}
								<figcaption class="mt-2 text-center font-serif text-xs text-stone-700 italic">
									{typeof photo.caption === 'object' ? photo.caption[lang.value] : photo.caption}
								</figcaption>
							{/if}
						</figure>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Central Hero Content -->
	<div class="relative hero-content z-10 px-4 text-center">
		<div
			class="max-w-xl rounded-3xl border border-white/20 bg-base-100/85 p-6 shadow-2xl backdrop-blur-lg sm:p-10"
		>
			<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{config.appName[lang.value]}</h1>

			<div class="dark:prose-invert prose max-w-none py-6 text-base leading-relaxed">
				{#key activeLang}
					{@html heroHtmlMap[activeLang] ?? ''}
				{/key}
			</div>

			<div class="flex justify-center gap-4">
				{#each pageConfig.buttons as btn}
					<a href={btn.link} class={`btn text-white ${btn.class}`}>
						{btn.label[lang.value]}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes marquee {
		0% {
			transform: translateX(0%);
		}
		100% {
			transform: translateX(calc(-100% - 1.5rem));
		} /* -100% width minus the 1.5rem (gap-6) */
	}

	@keyframes marquee-reverse {
		0% {
			transform: translateX(calc(-100% - 1.5rem));
		}
		100% {
			transform: translateX(0%);
		}
	}

	.animate-marquee {
		animation: marquee 35s linear infinite;
	}

	.animate-marquee-reverse {
		animation: marquee-reverse 35s linear infinite;
	}
</style>
