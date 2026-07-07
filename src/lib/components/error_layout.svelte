<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	interface ErrorLayoutProps {
		title: string;
		description: string;
		status?: number;
		diagnosticPath?: string;
		icon: Snippet; // Svelte 5 snippet for the icon zone
		actions: Snippet; // Svelte 5 snippet for the button actions zone
	}

	let {
		title,
		description,
		status = 404,
		diagnosticPath = page.url.pathname,
		icon,
		actions
	}: ErrorLayoutProps = $props();
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="card max-w-md border border-base-300 bg-base-100 p-8 shadow-xl">
			<!-- Custom Icon Inject Zone -->
			<div class="mb-4 flex justify-center">
				{@render icon()}
			</div>

			<!-- Content -->
			<h1 class="mb-2 text-3xl font-bold text-base-content">{title}</h1>
			<p class="mb-6 text-sm text-base-content/70">{description}</p>

			<!-- Shared Structural Diagnostic Dropdown -->
			<div class="collapse-arrow collapse mb-6 rounded-xl bg-base-200 text-left">
				<input type="checkbox" class="peer" />
				<div
					class="collapse-title text-xs font-semibold text-base-content/60 peer-checked:text-base-content"
				>
					Diagnostic Information
				</div>
				<div
					class="collapse-content mx-4 mb-4 overflow-x-auto rounded-lg bg-neutral p-3 font-mono text-xs whitespace-pre text-neutral-content"
				>
					<p>Target Resource: {diagnosticPath}</p>
					<p>Status Code: {status}</p>
					<p>Timestamp: {new Date().toISOString()}</p>
				</div>
			</div>

			<!-- Custom Actions Inject Zone -->
			<div class="flex flex-col justify-center gap-2 sm:flex-row">
				{@render actions()}
			</div>
		</div>
	</div>
</div>
