<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { langStore } from '$lib/store/lang';
	const { config, page: pageConf } = page.data;
	function getNextLanguage(currentLang: string): string {
		const options = config.langOptions;
		const index = options.findIndex((v: any) => v.value === currentLang);
		const nextIndex = index === -1 ? 0 : (index + 1) % options.length;
		return options[nextIndex].value;
	}
</script>

{#if pageConf && pageConf.showNav}
	<div class="navbar bg-base-200 px-4 shadow-sm">
		<div class="flex-1">
			<a class="btn text-xl btn-ghost" href="/">{config.appName[$langStore]}</a>
		</div>
		<div class="flex-none">
			{#if browser}
				<button
					onclick={() => langStore.set(getNextLanguage($langStore))}
					class="btn avatar btn-circle"
				>
					<div class="w-10 rounded-full">
						<img
							alt={config.langOptions.find((v: any) => v.value === $langStore).value}
							src={config.langOptions.find((v: any) => v.value === $langStore).icon}
						/>
					</div>
				</button>
			{/if}
		</div>
	</div>
{/if}
