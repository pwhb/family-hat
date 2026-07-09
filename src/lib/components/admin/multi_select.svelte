<script lang="ts">
    interface Option {
        value: string;
        label: string;
        [key: string]: any;
    }

    let {
        options = [],
        selectedValues = $bindable([]),
        placeholder = "Add"
    } = $props<{
        options: Option[];
        selectedValues: string[];
        placeholder?: string;
    }>();

    let searchQuery = $state("");
    let isDropdownOpen = $state(false);

    // 1. Filter out already selected items, then filter by search query
    let filteredOptions = $derived(
        options
            .filter((opt:any) => !selectedValues.includes(opt.value))
            .filter((opt:any) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // 2. Track selected objects to render the badges/tags easily
    let selectedObjects = $derived(
        options.filter((opt:any) => selectedValues.includes(opt.value))
    );

    function addTag(value: string) {
        if (!selectedValues.includes(value)) {
            selectedValues.push(value);
        }
        searchQuery = ""; // Clear text input on match select
    }

    function removeTag(value: string) {
        selectedValues = selectedValues.filter((v:any) => v !== value);
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
        class="input input-bordered flex flex-wrap gap-1.5 items-center h-auto min-h-12 py-1.5 px-3 cursor-text"
        onclick={() => document.getElementById('combo-input')?.focus()}
        role="presentation"
    >
        {#each selectedObjects as tag (tag.value)}
            <div class="badge badge-primary gap-1 py-2.5 pl-2.5 pr-1 font-medium text-xs shadow-sm">
                {tag.label}
                <button 
                    type="button" 
                    class="btn btn-ghost btn-xs btn-circle text-primary-content/70 hover:text-secondary-content p-0 min-h-0 h-4 w-4"
                    onclick={(e) => { e.stopPropagation(); removeTag(tag.value); }}
                >
                    ✕
                </button>
            </div>
        {/each}
        <input
            id="combo-input"
            type="text"
            bind:value={searchQuery}
            {placeholder}
            class="flex-1 min-w-30 bg-transparent outline-none border-none focus:outline-none p-0 h-full text-sm text-base-content"
            onfocus={() => isDropdownOpen = true}
            onblur={() => setTimeout(() => isDropdownOpen = false, 200)} 
            onkeydown={handleKeyDown}
            autocomplete="off"
        />
    </div>
    
    <ul class="dropdown-content menu p-2 shadow-2xl bg-base-100 border border-base-300 rounded-lg max-h-60 overflow-y-auto z-100 mt-1 gap-0.5">
        {#each filteredOptions as option (option.value)}
            <li>
                <button
                    type="button"
                    class="flex items-center justify-between py-2 px-3 hover:bg-base-200 active:bg-primary active:text-primary-content text-left rounded-md transition-colors"
                    onclick={() => addTag(option.value)}
                >
                    <span class="font-medium text-sm">{option.label}</span>
                    <span class="text-xs opacity-40 font-mono select-none">⏎ Add</span>
                </button>
            </li>
        {/each}
    </ul>
</div>