<script lang="ts">
	import { page } from '$app/state';
	import { updateLocalStorage } from '$lib/common';
	import { langStore } from '$lib/store/lang';
	const { config } = page.data;
</script>

<div class="navbar bg-base-200 px-4 shadow-sm">
	<div class="flex-1">
		<a class="btn text-xl btn-ghost" href="/">{config.appName[$langStore]}</a>
	</div>
	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn avatar btn-circle btn-neutral">
				<div class="w-10 rounded-full">
					<img
						alt={config.langOptions.find((v: any) => v.value === $langStore).value}
						src={config.langOptions.find((v: any) => v.value === $langStore).icon}
					/>
				</div>
			</div>
			<ul tabindex="-1" class="dropdown-content menu z-1 mt-3 rounded-box bg-base-100 p-2 shadow">
				{#each config.langOptions as opts}
					<li>
						{#if $langStore === opts.value}
							<button
								class="font-bold"
								onclick={() => updateLocalStorage('lang', langStore, opts.value)}
								>{opts.label[$langStore]}
							</button>
						{:else}
							<button onclick={() => updateLocalStorage('lang', langStore, opts.value)}
								>{opts.label[$langStore]}
							</button>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
