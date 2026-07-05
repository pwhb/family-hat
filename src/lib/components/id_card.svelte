<script lang="ts">
	import type { LocalizedText } from '$lib/client/common';
	import { langStore } from '$lib/store/lang';
	interface MemberCardProps {
		name: LocalizedText;
		title: LocalizedText;
		familyName: LocalizedText;
		avatarUrl?: string;
		isCenter?: boolean;
	}

	let { name, title, familyName, avatarUrl = '', isCenter = false }: MemberCardProps = $props();
</script>

<div
	class="card relative w-80 overflow-hidden rounded-4xl rounded-tr-lg rounded-bl-lg border border-base-300 bg-base-100 shadow-xl"
>
	<div class="absolute top-0 left-0 h-3 w-full bg-linear-to-r from-primary to-secondary"></div>

	<div class="card-body items-center pt-8 pb-6 text-center">
		<div class="placeholder avatar mb-2">
			<div
				class="h-24 w-24 rounded-3xl rounded-tl-sm rounded-br-sm bg-neutral text-neutral-content shadow-md"
			>
				{#if avatarUrl}
					<img src={avatarUrl} alt={name[$langStore]} />
				{/if}
			</div>
		</div>

		<div class="space-y-1">
			<h2 class="card-title justify-center text-xl font-extrabold tracking-tight text-base-content">
				{name[$langStore]}
				{#if isCenter}
					<span class="text-lg" title="Family Center">👑</span>
				{/if}
			</h2>
			<p class="text-sm font-semibold tracking-wide text-primary/80 uppercase">
				{title[$langStore]}
			</p>
		</div>

		<div class="divider my-1 opacity-60"></div>

		<div class="flex w-full items-center justify-between px-2 text-left">
			<div>
				<span class="block text-[10px] font-bold tracking-widest uppercase opacity-40">House</span>
				<span class="text-sm font-bold text-base-content/90">{familyName[$langStore]}</span>
			</div>

			<div class="flex flex-col items-end opacity-30 transition-opacity group-hover:opacity-50">
				<div class="flex h-6 items-center gap-0.5">
					<div class="h-full w-0.5 bg-base-content"></div>
					<div class="h-5 w-px bg-base-content"></div>
					<div class="h-full w-0.75 bg-base-content"></div>
					<div class="h-4 w-px bg-base-content"></div>
					<div class="h-full w-0.5 bg-base-content"></div>
					<div class="h-5 w-1 bg-base-content"></div>
				</div>
				<span class="mt-1 font-mono text-[8px] tracking-tighter"
					>FH-#{name.en.substring(0, 2).toUpperCase()}</span
				>
			</div>
		</div>
	</div>
</div>
