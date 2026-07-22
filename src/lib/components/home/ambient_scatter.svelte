<script lang="ts">
    import { page } from '$app/state';
    import { lang } from '$lib/store/lang.svelte';
    import { marked } from 'marked';

    const { config, pageConfig } = page.data;

    // Derived reactive HTML from markdown
    let heroHtml = $derived(marked.parse(pageConfig.heroTextMarkdown[lang.value] ?? ''));

    // Sample floating photo assets
    const floatingPhotos = [
        {
            src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
            caption: 'Summer ’24',
            pos: 'top-12 left-6 lg:left-16',
            delay: '0s',
            rotation: '-rotate-6'
        },
        {
            src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
            caption: 'Late night code',
            pos: 'top-1/4 right-4 lg:right-20',
            delay: '1.5s',
            rotation: 'rotate-12'
        },
        {
            src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
            caption: 'Coffee & Ideas',
            pos: 'bottom-16 left-10 lg:left-28',
            delay: '2.8s',
            rotation: 'rotate-3'
        },
        {
            src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            caption: 'The Launch',
            pos: 'bottom-12 right-8 lg:right-24',
            delay: '0.8s',
            rotation: '-rotate-12'
        }
    ];
</script>

<div class="hero relative min-h-[90vh] overflow-hidden bg-base-200">
    <!-- Background / Decorative Ambient Floating Photos -->
    <div class="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
        {#each floatingPhotos as photo}
            <figure
                class="absolute w-36 sm:w-44 lg:w-52 rounded-sm bg-stone-50 p-2.5 pb-4 shadow-2xl ring-1 ring-black/10 dark:bg-stone-100 dark:text-stone-900 transition-all duration-500 ease-out hover:scale-110 hover:z-20 pointer-events-auto animate-float {photo.pos} {photo.rotation}"
                style="animation-delay: {photo.delay};"
            >
                <!-- Deckle-edge / Photo Frame -->
                <div class="relative aspect-square w-full overflow-hidden bg-stone-900 shadow-inner">
                    <img
                        src={photo.src}
                        alt={photo.caption}
                        class="h-full w-full object-cover brightness-95 contrast-[1.05] sepia-[0.1]"
                        loading="lazy"
                    />
                    <div class="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent"></div>
                </div>

                <figcaption class="mt-2 text-center font-serif text-xs italic tracking-wide text-stone-700">
                    {photo.caption}
                </figcaption>
            </figure>
        {/each}
    </div>

    <!-- Central Hero Content -->
    <div class="hero-content relative z-10 text-center">
        <div class="max-w-xl rounded-3xl bg-base-100/70 p-8 backdrop-blur-md shadow-2xl border border-white/10">
            <h1 class="text-5xl font-bold tracking-tight">{config.appName[lang.value]}</h1>
            
            <!-- Rendered Markdown Content -->
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
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
        }
        50% {
            transform: translateY(-14px) rotate(1.5deg);
        }
    }

    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
</style>