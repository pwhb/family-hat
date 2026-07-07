<script lang="ts">
	import { page } from '$app/state';
	import ErrorLayout from '$lib/components/error_layout.svelte';
</script>

<ErrorLayout
	title="Page Not Found"
	description="The destination you are trying to reach doesn't exist, has been removed, or has moved to an entirely new URL address."
	status={page.status || 404}
>
	{#snippet icon()}
		<div class="flex flex-col items-center justify-center">
			<span class="relative text-6xl font-extrabold tracking-widest text-primary/20 select-none"
				>404</span
			>
			<div class="-mt-5 rounded-full bg-base-100 p-1 text-primary">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-12"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
					/>
				</svg>
			</div>
		</div>
	{/snippet}

	{#snippet actions()}
		<button type="button" class="btn btn-outline btn-sm" onclick={() => window.history.back()}>
			Go Back
		</button>
		<a href="/" class="btn btn-sm btn-primary">Return Home</a>
	{/snippet}
</ErrorLayout>
