<script lang="ts">
	interface MemberCardProps {
		name: string;
		title: string;
		familyName: string;
		avatarUrl?: string;
		isCenter?: boolean;
	}

	let { name, title, familyName, avatarUrl = '', isCenter = false }: MemberCardProps = $props();
</script>

<div
	class="card relative w-80 overflow-hidden rounded-[2rem] rounded-tr-[0.5rem] rounded-bl-[0.5rem] border border-base-300 bg-base-100 shadow-xl"
>
	<div class="absolute top-0 left-0 h-3 w-full bg-gradient-to-r from-primary to-secondary"></div>

	<div class="card-body items-center pt-8 pb-6 text-center">
		<div class="placeholder avatar mb-2">
			<div
				class="h-24 w-24 rounded-[1.5rem] rounded-tl-[0.25rem] rounded-br-[0.25rem] bg-neutral text-neutral-content shadow-md"
			>
				{#if avatarUrl}
					<img src={avatarUrl} alt={name} />
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-10 w-10 opacity-40"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
						/>
					</svg>
				{/if}
			</div>
		</div>

		<div class="space-y-1">
			<h2 class="card-title justify-center text-xl font-extrabold tracking-tight text-base-content">
				{name}
				{#if isCenter}
					<span class="text-lg" title="Family Center">👑</span>
				{/if}
			</h2>
			<p class="text-sm font-semibold tracking-wide text-primary/80 uppercase">
				{title}
			</p>
		</div>

		<div class="divider my-1 opacity-60"></div>

		<div class="flex w-full items-center justify-between px-2 text-left">
			<div>
				<span class="block text-[10px] font-bold tracking-widest uppercase opacity-40">House</span>
				<span class="text-sm font-bold text-base-content/90">{familyName}</span>
			</div>

			<div class="flex flex-col items-end opacity-30 transition-opacity group-hover:opacity-50">
				<div class="flex h-6 items-center gap-[2px]">
					<div class="h-full w-[2px] bg-base-content"></div>
					<div class="h-5 w-[1px] bg-base-content"></div>
					<div class="h-full w-[3px] bg-base-content"></div>
					<div class="h-4 w-[1px] bg-base-content"></div>
					<div class="h-full w-[2px] bg-base-content"></div>
					<div class="h-5 w-[4px] bg-base-content"></div>
				</div>
				<span class="mt-1 font-mono text-[8px] tracking-tighter"
					>FH-#{name.substring(0, 2).toUpperCase()}</span
				>
			</div>
		</div>
	</div>
</div>
