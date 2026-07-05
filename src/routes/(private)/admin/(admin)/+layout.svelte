<script>
	import { page } from '$app/state';
	import Breadcrumbs from '$lib/components/admin/breadcrumbs.svelte';
	import Search from '$lib/components/admin/search.svelte';
	import Sidebar from '$lib/components/admin/sidebar.svelte';
	import Toast from '$lib/components/toast.svelte';
	let { children } = $props();
</script>

<div class="drawer lg:drawer-open">
	<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<!-- Navbar -->
		<nav class="navbar w-full bg-base-300">
			<div class="navbar-start">
				<label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost">
					<!-- Sidebar toggle icon -->
					<img src="/menu-alt-2-svgrepo-com.svg" alt="menus" />
				</label>
				<div class="px-4">Family Admin</div>
			</div>
			<div class="navbar-end">
				<Search />
			</div>
		</nav>
		<!-- Page content here -->
		<Breadcrumbs />
		<Toast />
		{#if page.data.pageConfig}
			{@render children()}
		{:else}
			<div class="m-10 rounded-2xl border border-dashed p-4 text-center text-error">
				<p>Please configure page config first. [{page.data.key}]</p>
			</div>
		{/if}
	</div>

	<Sidebar />
</div>
