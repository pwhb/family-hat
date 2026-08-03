<script lang="ts">
	import { page } from '$app/state';
	import type { LocalizedText } from '$lib/client/common';
	import { lang } from '$lib/store/lang.svelte';
	import { getActivePathContext } from '$lib/store/tree.svelte';

	interface MemberProps {
		_id: string;
		name: LocalizedText;
		aliases: {
			[key: string]: LocalizedText;
		};
		gender?: string;
		status?: string;
		avatarUrl?: string;
		previewUrl?: string;
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
	const pathCtx = getActivePathContext();
	const getCustomClass = () => {
		switch (type) {
			case 'full':
				return {
					container:
						'card relative w-80 overflow-hidden rounded-4xl rounded-tr-lg rounded-bl-lg border border-base-300 bg-base-100 shadow-xl',
					name: 'card-title justify-center text-xl font-extrabold tracking-tight text-base-content',
					title: 'text-sm font-semibold tracking-wide text-primary/80 uppercase mb-2',
					onPath: `text-sm font-semibold tracking-wide uppercase underline decoration-6 underline-offset-8`
				};
			default:
				return {
					container:
						'card relative w-42 h-58 overflow-hidden rounded-4xl rounded-tr-lg rounded-bl-lg border border-base-300 bg-base-100 shadow-xl',
					name: 'card-title justify-center text-sm font-extrabold tracking-tight text-base-content',
					title: 'text-xs font-semibold tracking-wide text-primary/80 uppercase',
					onPath: `text-[0.625rem] font-bold tracking-wide uppercase`
				};
		}
	};
	const getBadgeClass = (status: string) => {
		switch (status) {
			case 'AWAY':
				return 'badge badge-error text-base-100 text-[0.625rem]';
			case 'HOME':
				return 'badge badge-success text-base-100 text-[0.625rem]';
			case 'HOME':
				return 'badge badge-warning text-base-100 text-[0.625rem]';
		}
	};
	const { config } = page.data;
</script>

{#if member && family}
	<div class={getCustomClass().container}>
		<div
			class={`absolute top-0 left-0 h-3 w-full bg-linear-to-r ${family.customCss ? family.customCss : 'from-primary to-secondary'}`}
		></div>
		<div class="card-body items-center pt-8 pb-6 text-center">
			<div class="placeholder avatar mb-2">
				{#if member.previewUrl}
					<div
						class="h-24 w-24 rounded-3xl rounded-tl-sm rounded-br-sm bg-gray-200 text-neutral-content shadow-md"
					>
						<img src={member.previewUrl} alt={member.name[lang.value]} />
					</div>
				{:else}
					<div
						class="h-24 w-24 rounded-3xl rounded-tl-sm rounded-br-sm bg-gray-200 p-2 text-neutral-content shadow-md"
					>
						<img
							src={config.avatarPlaceholder[
								member.gender ? member.gender.toLowerCase() : 'neutral'
							]}
							alt={member.name[lang.value]}
						/>
					</div>
				{/if}
			</div>

			<div class="space-y-1">
				{#if type === 'full'}
					<p class={getCustomClass().title}>{member.aliases.title[lang.value]}</p>
				{/if}
				<h2
					class={`${focus && focus === member._id ? 'text-accent underline' : ''} ${getCustomClass().name}`}
				>
					{member.name[lang.value]}
					{#if family.center === member._id}
						<span class="text-lg" title="Family Center">👑</span>
					{/if}
				</h2>

				{#if pathCtx && pathCtx.activePath && pathCtx.activePath.sourceID === member._id}
					<p class={getCustomClass().onPath} style={`color: ${pathCtx.activePath.color};`}>
						{pathCtx.activePath.sourceLabel[lang.value]}
					</p>
				{:else if pathCtx && pathCtx.activePath && pathCtx.activePath.targetID === member._id}
					<p class={getCustomClass().onPath} style={`color: ${pathCtx.activePath.color};`}>
						{pathCtx.activePath.targetLabel[lang.value]}
					</p>
				{/if}
			</div>

			{#if type === 'full'}
				<div class="divider my-1 opacity-60"></div>

				<div class="flex w-full items-center justify-between px-2 text-left">
					<div>
						<span class="block text-[10px] font-bold tracking-widest uppercase opacity-40"
							>{config.lang['HOUSE'][lang.value]}</span
						>
						<span class="text-sm font-bold text-base-content/90">{family.fullName[lang.value]}</span
						>
					</div>

					<div>
						<span class="block text-[10px] font-bold tracking-widest uppercase opacity-40"
							>{config.lang['STATUS'][lang.value]}</span
						>
						<span class={getBadgeClass(member.status || 'AWAY')}>
							{member.status && config.statusMap[member.status][lang.value]}
						</span>
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
