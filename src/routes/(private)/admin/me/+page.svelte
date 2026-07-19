<script>
	import { page } from '$app/state';
	import { formatDateTime } from '$lib/client/common';
	const { user, rbac } = page.data;
</script>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="card border border-base-300 bg-base-100 shadow-sm">
		<div class="card-body gap-6">
			<div
				class="flex flex-col gap-4 border-b border-base-200 pb-6 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-center gap-4">
					<div class="avatar avatar-placeholder">
						<div class="w-16 rounded-full bg-neutral text-neutral-content">
							<span class="text-xl">{user.name.slice(0, 2)}</span>
						</div>
					</div>
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<h1 class="text-xl font-bold text-base-content">{user.name}</h1>
							{#if user.isActive}
								<span class="badge gap-1 badge-sm font-semibold text-success-content badge-success">
									<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
									Active
								</span>
							{:else}
								<span class="badge badge-ghost badge-sm font-semibold">Inactive</span>
							{/if}
						</div>
						<p class="text-sm text-base-content/60">@{user.username}</p>
					</div>
				</div>

				<div class="flex flex-wrap gap-1.5 sm:justify-end">
					{#each rbac.roles as role}
						<span class="badge badge-md font-semibold tracking-wide shadow-sm badge-primary">
							{role}
						</span>
					{/each}
				</div>
			</div>

			<div>
				<h2 class="mb-4 text-xs font-bold tracking-wider text-base-content/40 uppercase">
					Account Information
				</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div
						class="flex flex-col rounded-lg border border-base-200 bg-base-200/20 p-3.5 shadow-inner"
					>
						<span class="text-xs font-semibold text-base-content/50 capitalize">Code</span>
						<span class="mt-1 font-mono text-sm font-bold tracking-wider text-base-content/90"
							>{user.code}</span
						>
					</div>

					<div
						class="flex flex-col rounded-lg border border-base-200 bg-base-200/20 p-3.5 shadow-inner"
					>
						<span class="text-xs font-semibold text-base-content/50 capitalize"
							>Application Scope</span
						>
						<span class="mt-1 text-sm font-semibold text-base-content/90">{user.appId}</span>
					</div>

					<div
						class="flex flex-col rounded-lg border border-base-200 bg-base-200/20 p-3.5 shadow-inner"
					>
						<span class="text-xs font-semibold text-base-content/50 capitalize">Created At</span>
						<span class="mt-1 text-sm font-medium text-base-content/90"
							>{formatDateTime(user.createdAt)}</span
						>
					</div>

					<div
						class="flex flex-col rounded-lg border border-base-200 bg-base-200/20 p-3.5 shadow-inner"
					>
						<span class="text-xs font-semibold text-base-content/50 capitalize">Updated At</span>
						<span class="mt-1 text-sm font-medium text-base-content/90"
							>{formatDateTime(user.updatedAt)}</span
						>
					</div>
				</div>
			</div>

			<div
				class="mt-2 flex items-center justify-between border-t border-base-200/60 pt-4 text-[11px] font-medium tracking-wide text-base-content/40"
			>
				<span>User ID: <span class="font-mono font-bold select-all">{user._id}</span></span>
			</div>
		</div>
	</div>
</div>
