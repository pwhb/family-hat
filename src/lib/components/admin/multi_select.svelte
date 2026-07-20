<script lang="ts">
	interface Option {
		value: string;
		label: string;
		[key: string]: any;
	}

	let {
		options = [],
		selectedValues = $bindable([]),
		placeholder = 'Add',
		key = ''
	} = $props<{
		options: Option[];
		selectedValues: string[];
		placeholder?: string;
		key: string;
	}>();

	let searchQuery = $state('');
	let isDropdownOpen = $state(false);

	// 1. Filter out already selected items, then filter by search query
	let filteredOptions = $derived(
		options
			.filter((opt: any) => !selectedValues.includes(opt.value))
			.filter((opt: any) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// 2. Track selected objects to render the badges/tags easily
	let selectedObjects = $derived(options.filter((opt: any) => selectedValues.includes(opt.value)));

	function addTag(value: string) {
		if (!selectedValues.includes(value)) {
			selectedValues.push(value);
		}
		searchQuery = ''; // Clear text input on match select
	}

	function removeTag(value: string) {
		selectedValues = selectedValues.filter((v: any) => v !== value);
	}

	// Handle enter key press if there is a single exact match
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && filteredOptions.length > 0) {
			e.preventDefault();
			addTag(filteredOptions[0].value);
		}
	}
</script>

<div class="dropdown" class:dropdown-open={isDropdownOpen && filteredOptions.length > 0}>
	<div
		class="input-bordered input flex h-auto min-h-12 cursor-text flex-wrap items-center gap-1.5 px-3 py-1.5"
		onclick={() => document.getElementById(`${key}-combo-input`)?.focus()}
		role="presentation"
	>
		{#each selectedObjects as tag (tag.value)}
			<div class="badge gap-1 py-2.5 pr-1 pl-2.5 text-xs font-medium shadow-sm badge-primary">
				{tag.label}
				<button
					type="button"
					class="btn btn-circle h-4 min-h-0 w-4 p-0 text-primary-content/70 btn-ghost btn-xs hover:text-secondary-content"
					onclick={(e) => {
						e.stopPropagation();
						removeTag(tag.value);
					}}
				>
					✕
				</button>
			</div>
		{/each}
		<input
			id={`${key}-combo-input`}
			type="text"
			bind:value={searchQuery}
			{placeholder}
			class="h-full min-w-30 flex-1 border-none bg-transparent p-0 text-sm text-base-content outline-none focus:outline-none"
			onfocus={() => (isDropdownOpen = true)}
			onblur={() => setTimeout(() => (isDropdownOpen = false), 200)}
			onkeydown={handleKeyDown}
			autocomplete="off"
		/>
	</div>

	<ul
		class="dropdown-content menu z-100 mt-1 max-h-60 gap-0.5 overflow-y-auto rounded-lg border border-base-300 bg-base-100 p-2 shadow-2xl"
	>
		{#each filteredOptions as option (option.value)}
			<li>
				<button
					type="button"
					class="flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-base-200 active:bg-primary active:text-primary-content"
					onclick={() => addTag(option.value)}
				>
					<span class="text-sm font-medium">{option.label}</span>
					<span class="font-mono text-xs opacity-40 select-none">⏎ Add</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
