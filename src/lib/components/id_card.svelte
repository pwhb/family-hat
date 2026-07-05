<script lang="ts">
	import { page } from '$app/state';
	import type { LocalizedText } from '$lib/client/common';
	import { langStore } from '$lib/store/lang';

	interface MemberProps {
		_id: string;
		name: LocalizedText;
		title: LocalizedText;
		gender?: string;
		avatarUrl?: string;
	}
	interface FamilyProps {
		name: LocalizedText;
		fullName: LocalizedText;
		center: string;
		customCss?: string;
	}
	interface MemberCardProps {
		member: MemberProps;
		family: FamilyProps;
		type?: string;
		focus?: string;
	}

	let { member, family, type, focus }: MemberCardProps = $props();
	const getCustomClass = () => {
		switch (type) {
			case 'full':
				return {
					container:
						'card relative w-80 overflow-hidden rounded-4xl rounded-tr-lg rounded-bl-lg border border-base-300 bg-base-100 shadow-xl',
					name: 'card-title justify-center text-xl font-extrabold tracking-tight text-base-content',
					title: 'text-sm font-semibold tracking-wide text-primary/80 uppercase'
				};
			default:
				return {
					container:
						'card relative w-42 h-56 overflow-hidden rounded-4xl rounded-tr-lg rounded-bl-lg border border-base-300 bg-base-100 shadow-xl',
					name: 'card-title justify-center text-sm font-extrabold tracking-tight text-base-content',
					title: 'text-xs font-semibold tracking-wide text-primary/80 uppercase'
				};
		}
	};
</script>

{#if member && family}
	<div class={getCustomClass().container}>
		<div
			class={`absolute top-0 left-0 h-3 w-full bg-linear-to-r ${family.customCss ? family.customCss : 'from-primary to-secondary'}`}
		></div>

		<div class="card-body items-center pt-8 pb-6 text-center">
			<div class="placeholder avatar mb-2">
				{#if member.avatarUrl}
					<div
						class="h-24 w-24 rounded-3xl rounded-tl-sm rounded-br-sm bg-gray-200 text-neutral-content shadow-md"
					>
						<img
							src={`${page.data.config.s3BaseUrl}/${member.avatarUrl}`}
							alt={member.name[$langStore]}
						/>
					</div>
				{:else}
					<div
						class="h-24 w-24 rounded-3xl rounded-tl-sm rounded-br-sm bg-gray-200 p-2 text-neutral-content shadow-md"
					>
						<img
							src={page.data.config.avatarPlaceholder[
								member.gender ? member.gender.toLowerCase() : 'neutral'
							]}
							alt={member.name[$langStore]}
						/>
					</div>
				{/if}
			</div>

			<div class="space-y-1">
				<h2
					class={`${focus && focus === member._id ? 'text-accent underline' : ''} ${getCustomClass().name}`}
				>
					{member.name[$langStore]}
					{#if family.center === member._id}
						<span class="text-lg" title="Family Center">👑</span>
					{/if}
				</h2>
				<p class={getCustomClass().title}>
					{member.title[$langStore]}
				</p>
			</div>

			{#if type === 'full'}
				<div class="divider my-1 opacity-60"></div>

				<div class="flex w-full items-center justify-between px-2 text-left">
					<div>
						<span class="block text-[10px] font-bold tracking-widest uppercase opacity-40"
							>House</span
						>
						<span class="text-sm font-bold text-base-content/90">{family.fullName[$langStore]}</span
						>
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
							>FH-#{member.name.en.substring(0, 2).toUpperCase()}</span
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
