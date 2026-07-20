<script lang="ts">
	import { enhance } from '$app/forms';
	import { toastManager } from '$lib/toast.svelte';
	let isExpanded = $state(false);
	let loading = $state(false);
	let password = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	const passwordsMatch = $derived(
		newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword
	);

	function resetForm() {
		password = '';
		newPassword = '';
		confirmPassword = '';
	}

	function toggleExpand() {
		isExpanded = !isExpanded;
		if (!isExpanded) {
			resetForm();
		}
	}
</script>

<div class="border-t border-base-200 pt-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xs font-bold tracking-wider text-base-content/40 uppercase">
				Security & Password
			</h2>
		</div>
		<button
			type="button"
			class="btn gap-1.5 font-semibold text-base-content/70 btn-ghost btn-xs hover:text-base-content"
			onclick={toggleExpand}
		>
			{#if isExpanded}
				<span>Cancel</span>
			{:else}
				<span>Change Password</span>
			{/if}
		</button>
	</div>

	{#if isExpanded}
		<div class="mt-4 rounded-xl border border-base-200 bg-base-200/30 p-4 transition-all">
			<form
				method="POST"
				action="/admin?/changePassword"
				use:enhance={() => {
					loading = true;
					return async ({ result }) => {
						toastManager.show({
							message: (result as any).data.message,
							type: result.type === 'success' ? 'success' : 'error'
						});
						loading = false;
						if (result.type === 'success') toggleExpand();
					};
				}}
				class="grid grid-cols-1 gap-4 sm:grid-cols-3"
			>
				<div class="form-control">
					<label class="label pb-1" for="password">
						<span class="label-text text-xs font-semibold text-base-content/70"
							>Current Password</span
						>
					</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						bind:value={password}
						placeholder="••••••••"
						class="input input-sm w-full bg-base-100"
					/>
				</div>

				<div class="form-control">
					<label class="label pb-1" for="newPassword">
						<span class="label-text text-xs font-semibold text-base-content/70">New Password</span>
					</label>
					<input
						id="newPassword"
						name="newPassword"
						type="password"
						required
						bind:value={newPassword}
						placeholder="••••••••"
						class="input input-sm w-full bg-base-100"
					/>
				</div>

				<div class="form-control">
					<label class="label pb-1" for="confirmPassword">
						<span class="label-text text-xs font-semibold text-base-content/70"
							>Confirm New Password</span
						>
					</label>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						bind:value={confirmPassword}
						placeholder="••••••••"
						class="input input-sm w-full bg-base-100"
					/>
					{#if confirmPassword.length > 0 && !passwordsMatch}
						<span class="mt-1 text-[10px] font-medium text-error">Passwords do not match</span>
					{/if}
				</div>

				<div class="flex justify-end gap-2 border-t border-base-200/60 pt-2 sm:col-span-3">
					<button
						type="submit"
						class="btn btn-sm btn-primary"
						disabled={loading || !password || !newPassword || !passwordsMatch}
					>
						Update Password
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
