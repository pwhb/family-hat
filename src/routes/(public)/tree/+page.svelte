<script lang="ts">
	// Define people as reactive state using the $state rune
	let people = $state([
		{
			code: 'YAMIN',
			name: 'Yamin Nyi Nyi',
			level: 0
		},
		{
			code: 'AYE_THANT',
			name: 'Aye Thant Thant Thaw',
			level: 0,
			relationships: [{ to: 'YAMIN', is: 'Clone' }]
		},
		{
			code: 'SAI_LAO',
			name: 'Sai Lao Seng',
			level: 0,
			relationships: [{ to: 'YAMIN', is: 'Brother' }]
		},
		{
			code: 'MYO_SET',
			name: 'Myo Set Paing',
			level: 0,
			relationships: [{ to: 'SAI_LAO', is: 'Brother' }]
		},
		{
			code: 'PHYO_MINN_THU',
			name: 'Phyo Minn Thu',
			level: 1,
			relationships: [{ to: 'YAMIN', is: 'Father' }]
		},
		{
			code: 'PHYOE_TAYZAR_MIN',
			name: 'Phyoe Tayzar Min',
			level: 1,
			relationships: [{ to: 'YAMIN', is: 'Uncle' }]
		}
	]);

	// Use $derived to automatically re-compute levels whenever 'people' changes
	let levels: any[] = $derived(
		Object.entries(
			people.reduce((acc: any, person: any) => {
				acc[person.level] = acc[person.level] || [];
				acc[person.level].push(person);
				return acc;
			}, {})
		).sort((a: any, b: any) => b[0] - a[0]) // Keeps older generations (higher levels) at the top
	);

	// Helper to find a person's name by their code
	function getPersonName(code: string) {
		return people.find((p) => p.code === code)?.name || code;
	}
</script>

<div class="flex min-h-[90vh] flex-col items-center justify-center bg-gray-50 p-8">
	<!-- <h1 class="mb-12 text-2xl font-bold text-gray-800">Family Tree</h1> -->

	<div class="flex w-full max-w-4xl flex-col items-center gap-16">
		{#each levels as [level, members]}
			<div class="flex w-full flex-col items-center">
				<!-- <span class="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
					Level {level}
				</span> -->

				<div class="flex w-full items-start justify-center gap-8">
					{#each members as person}
						<div
							class="group relative min-w-37.5 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-md"
						>
							<p class="font-bold text-gray-800">{person.name}</p>

							{#if person.relationships && person.relationships.length > 0}
								<div class="mt-3 border-t border-gray-100 pt-2 text-left">
									{#each person.relationships as rel}
										<div class="text-center text-xs text-gray-600">
											<span class="font-medium text-indigo-600">{rel.is}</span> of {getPersonName(
												rel.to
											)}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
