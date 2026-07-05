<script>
	import { page } from '$app/state';
	import { langStore } from '$lib/store/lang';
	const { config, page: pageConf } = page.data;
</script>

<div class="hero min-h-[90vh] bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">{config.appName[$langStore]}</h1>
			<div class="py-6">
				{#each pageConf.heroText[$langStore] as text}
					<p>
						{text}
					</p>
				{/each}
			</div>
			<div class="flex justify-center gap-5">
				{#each pageConf.buttons as btn}
					<a href={btn.link} class={`btn text-white ${btn.class}`}>{btn.label[$langStore]}</a>
				{/each}
			</div>
		</div>
	</div>
</div>
