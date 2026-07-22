<script>
	import { page } from '$app/state';
	import { lang } from '$lib/store/lang.svelte';

	const { config, pageConfig } = page.data;
</script>

<div class="hero min-h-[90vh] bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">{config.appName[lang.value]}</h1>
			<div class="py-6">
				{#each pageConfig.heroText[lang.value] as text}
					<p>
						{text}
					</p>
				{/each}
			</div>
			<div class="flex justify-center gap-5">
				{#each pageConfig.buttons as btn}
					<a href={btn.link} class={`btn text-white ${btn.class}`}>{btn.label[lang.value]}</a>
				{/each}
			</div>
		</div>
	</div>
</div>
