<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { lang } from '$lib/store/lang.svelte';

	const { config, pageConfig } = page.data;
	function getNextLanguage(currentLang: string): string {
		const options = config.langOptions;
		const index = options.findIndex((v: any) => v.value === currentLang);
		const nextIndex = index === -1 ? 0 : (index + 1) % options.length;
		return options[nextIndex].value;
	}
</script>

{#if pageConfig && pageConfig.showNav}
	<div class="navbar bg-base-200 px-4 shadow-sm">
		<div class="flex-1">
			<a class="btn text-xl btn-ghost" href="/">{config.appName[lang.value]}</a>
		</div>
		<div class="flex-none">
			{#if browser}
				<button
					onclick={() => (lang.value = getNextLanguage(lang.value))}
					class="btn avatar btn-circle"
				>
					<div class="w-10 rounded-full">
						<img
							alt={config.langOptions.find((v: any) => v.value === lang.value).value}
							src={config.langOptions.find((v: any) => v.value === lang.value).icon}
						/>
					</div>
				</button>
			{/if}
		</div>
	</div>
{/if}
