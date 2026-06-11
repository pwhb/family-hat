<script lang="ts">
	import { page } from '$app/state';
	import { langStore } from '$lib/store/lang';

	const getLevels: any = (list: any[]) =>
		Object.entries(
			list.reduce((acc: any, person: any) => {
				acc[person.level] = acc[person.level] || [];
				acc[person.level].push(person);
				return acc;
			}, {})
		).sort((a: any, b: any) => b[0] - a[0]);

	const { data } = page.data;
	// console.log(data);
</script>

<div class="flex min-h-[90vh] flex-row items-center justify-center overflow-auto p-8">
	{#each data as item, idx}
		<div class="flex flex-col items-center justify-center">
			<h1 class="mb-12 text-2xl font-bold text-gray-800">
				{item.family.fullName[$langStore]}
			</h1>
			<div class="flex w-full max-w-4xl flex-col items-center gap-16">
				{#each getLevels(item.members) as [level, members]}
					<div class="flex w-full flex-col items-center">
						<div class="flex w-full items-start justify-center gap-8">
							{#each members as person}
								<div
									class={`group relative min-h-24 w-48 min-w-37.5 rounded-xl border border-gray-200 p-4 text-center shadow-md ${item.family.bgColor}`}
								>
									<p class="font-bold text-gray-800">{person.name[$langStore]}</p>
									{#if person.title[$langStore]}
										<br />
										<p class="text-gray-800">({person.title[$langStore]})</p>
									{/if}

									{#if person.relationships && person.relationships.length > 0}
										<div class="mt-3 border-t border-gray-100 pt-2 text-left"></div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
		{#if data.length !== idx + 1}
			<div class="divider divider-horizontal"></div>
		{/if}
	{/each}
</div>
