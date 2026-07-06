<script>
	import { page } from '$app/state';
	function handleBack() {
		// Safe SvelteKit router back navigation
		history.back();
	}
</script>

{#if page.url.pathname !== '/'}
	<div class="fixed top-20 left-6 z-50">
		<button
			onclick={handleBack}
			class="btn btn-circle border border-primary-content/20 bg-base-100 btn-link shadow-xl transition-transform hover:scale-120"
			aria-label="Go back"
		>
			<img src="/back-interface-ui-ux-svgrepo-com.svg" class="p-1" alt="back" />
		</button>
	</div>
{/if}
