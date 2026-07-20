<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toastManager } from '$lib/toast.svelte';
	let loading = $state(false);
	let message = $state('');
</script>

<div class=" flex min-h-screen items-center justify-center">
	<div class="card w-full max-w-sm shrink-0 bg-base-300 shadow-2xl">
		<form
			class="card-body"
			action="/admin?/login"
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'failure') message = (result as any).data.message;
					if (result.type === 'redirect') goto(result.location);
				};
			}}
		>
			<fieldset class="fieldset">
				<label class="label" for="username">Username</label>
				<input type="text" name="username" class="input" placeholder="Username" />
				<label class="label" for="password">Password</label>
				<input type="password" name="password" class="input" placeholder="Password" />
				{#if message}
					<span class="mt-1 text-[10px] font-medium text-error">{message}</span>
				{/if}
				<button class="btn mt-4 btn-primary" type="submit" disabled={loading}>Login</button>
			</fieldset>
		</form>
	</div>
</div>
