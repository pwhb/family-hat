<script lang="ts">
	interface Props {
		src: string;
		alt?: string;
		caption?: string;
		date?: string;
		rotation?: 'left' | 'right' | 'none';
		variant?: 'polaroid' | 'filmstrip';
	}

	let {
		src,
		alt = 'Memory',
		caption = '',
		date = '',
		rotation = 'left',
		variant = 'polaroid'
	}: Props = $props();

	const rotationClasses = {
		left: '-rotate-2 hover:rotate-0',
		right: 'rotate-2 hover:rotate-0',
		none: 'rotate-0'
	};
</script>

{#if variant === 'polaroid'}
	<figure
		class="group relative inline-block w-64 rounded-sm bg-stone-50 p-3 pb-5 shadow-xl ring-1 ring-black/5 transition-transform duration-300 ease-out hover:z-10 hover:scale-105 dark:bg-stone-100 dark:text-stone-900 {rotationClasses[
			rotation
		]}"
	>
		<div class="relative aspect-square w-full overflow-hidden bg-stone-900 shadow-inner">
			<img
				{src}
				{alt}
				class="h-full w-full object-cover brightness-95 contrast-[1.05] sepia-[0.15] transition-all duration-300 group-hover:brightness-100 group-hover:sepia-0"
				loading="lazy"
			/>

			<div
				class="pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent"
			></div>
		</div>

		{#if caption || date}
			<figcaption class="mt-3 flex items-baseline justify-between px-1">
				<span class="font-serif text-sm tracking-wide text-stone-700 italic">
					{caption}
				</span>
				{#if date}
					<span class="font-mono text-[10px] text-stone-400">
						{date}
					</span>
				{/if}
			</figcaption>
		{/if}
	</figure>
{:else if variant === 'filmstrip'}
	<div
		class="group relative inline-block transition-transform duration-300 hover:scale-105 {rotationClasses[
			rotation
		]}"
	>
		<div
			class="flex flex-col items-center rounded-sm bg-stone-950 p-2 text-stone-100 shadow-2xl ring-1 ring-white/10"
		>
			<div class="flex w-full justify-between px-2 py-1">
				{#each Array(5) as _}
					<div class="h-3 w-2 rounded-[1px] bg-stone-900 shadow-inner ring-1 ring-stone-800"></div>
				{/each}
			</div>

			<div class="relative my-1 aspect-4/3 w-64 overflow-hidden bg-black">
				<img
					{src}
					{alt}
					class="h-full w-full object-cover brightness-90 contrast-110 saturate-[0.85] transition-all duration-300 group-hover:brightness-100 group-hover:saturate-100"
					loading="lazy"
				/>
				<div class="pointer-events-none absolute inset-0 ring-1 ring-black/40 ring-inset"></div>
			</div>

			<div
				class="flex w-full items-center justify-between px-2 py-1 font-mono text-[9px] text-amber-500/70"
			>
				<span>KODAK 400</span>
				{#each Array(3) as _}
					<div class="h-3 w-2 rounded-[1px] bg-stone-900 shadow-inner ring-1 ring-stone-800"></div>
				{/each}
				<span>#24A</span>
			</div>
		</div>
	</div>
{/if}
