<script>
	import { page } from '$app/state';
	import { langStore } from '$lib/store/lang';
	const { config } = page.data;
</script>

<div class="hero min-h-[90vh] bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">{config.appName[$langStore]}</h1>
			<div class="py-6">
				{#each config.heroText[$langStore] as text}
					<p>
						{text}
					</p>
				{/each}
			</div>
			<p>{JSON.stringify(config.primarybuttonLink)}</p>

			<a href={config.primaryButtonLink} class="btn pt-2 btn-primary"
				>{config.primaryButtonText[$langStore]}</a
			>
			<a href={config.secondaryButtonLink} class="btn pt-2 btn-secondary"
				>{config.secondaryButtonText[$langStore]}</a
			>
		</div>
	</div>
</div>
