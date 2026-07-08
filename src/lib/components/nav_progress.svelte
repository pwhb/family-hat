<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { navigating } from '$app/state';

	const progress = new Tween(0, {
		duration: 250,
		easing: cubicOut
	});

	let isVisible = $state(false);

	$effect(() => {
		if (navigating.to) {
			isVisible = true;
			progress.target = 0.75;
		} else {
			if (isVisible) {
				progress.target = 1.0;

				const timer = setTimeout(() => {
					isVisible = false;
					progress.target = 0;
				}, 300);

				return () => clearTimeout(timer);
			}
		}
	});
</script>

{#if isVisible}
	<div
		class="pointer-events-none fixed top-0 left-0 z-99999 h-1 bg-linear-to-r from-primary to-secondary shadow-md transition-all"
		style:width="{progress.current * 100}%"
		transition:fade={{ duration: 200 }}
	></div>
{/if}
