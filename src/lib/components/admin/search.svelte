<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { EventHandler } from 'svelte/elements';
	const isListPage = $derived(
		page.url.pathname.split('/').length === 3 && page.url.pathname.split('/')[2] !== 'me'
	);
	let q = $state('');
	const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (e) => {
		e.preventDefault();
		const url = `${page.url.pathname}?page=1&size=10${q ? `&q=${q}` : ''}`;
		goto(url);
	};
</script>

{#if isListPage}
	<form {onsubmit}>
		<input
			type="text"
			bind:value={q}
			placeholder="Search"
			class="input-bordered input w-64 lg:w-auto"
		/>
	</form>
{/if}
