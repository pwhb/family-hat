<script lang="ts">
    import { page } from '$app/state';
    import { lang } from '$lib/store/lang.svelte';
    import { marked } from 'marked';

    const { config, pageConfig } = page.data;

    let heroHtml = $derived(marked.parse(pageConfig.heroTextMarkdown[lang.value] ?? ''));

    const reelPhotos = [
        { src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', caption: 'Chapter I' },
        { src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', caption: 'Late Night' },
        { src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', caption: 'Coffee' },
        { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', caption: 'The Spark' },
        { src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400', caption: 'Outdoors' },
    ];
</script>

<div class="hero relative min-h-[90vh] overflow-hidden bg-base-200 py-16">
    <!-- Scrolling Background Marquee Layer -->
    <div class="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-40 select-none">
        
        <!-- Top Reel (Moving Left) -->
        <div class="flex gap-6 animate-marquee whitespace-nowrap pt-4">
            {#each [...reelPhotos, ...reelPhotos] as photo}
                <figure class="inline-block w-36 sm:w-44 rounded-xs bg-stone-50 p-2 shadow-lg -rotate-2 dark:bg-stone-100">
                    <div class="aspect-square w-full overflow-hidden bg-stone-900">
                        <img src={photo.src} alt={photo.caption} class="h-full w-full object-cover sepia-[0.2]" />
                    </div>
                </figure>
            {/each}
        </div>

        <!-- Bottom Reel (Moving Right) -->
        <div class="flex gap-6 animate-marquee-reverse whitespace-nowrap pb-4">
            {#each [...reelPhotos, ...reelPhotos] as photo}
                <figure class="inline-block w-36 sm:w-44 rounded-xs bg-stone-50 p-2 shadow-lg rotate-3 dark:bg-stone-100">
                    <div class="aspect-square w-full overflow-hidden bg-stone-900">
                        <img src={photo.src} alt={photo.caption} class="h-full w-full object-cover sepia-[0.2]" />
                    </div>
                </figure>
            {/each}
        </div>
    </div>

    <!-- Central Hero Content -->
    <div class="hero-content relative z-10 text-center">
        <div class="max-w-xl rounded-3xl bg-base-100/80 p-8 backdrop-blur-md shadow-2xl border border-base-300">
            <h1 class="text-5xl font-bold tracking-tight">{config.appName[lang.value]}</h1>
            
            <div class="py-6 prose dark:prose-invert max-w-none text-base leading-relaxed">
                {@html heroHtml}
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
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
    }

    @keyframes marquee-reverse {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0%); }
    }

    .animate-marquee {
        animation: marquee 35s linear infinite;
    }

    .animate-marquee-reverse {
        animation: marquee-reverse 35s linear infinite;
    }
</style>