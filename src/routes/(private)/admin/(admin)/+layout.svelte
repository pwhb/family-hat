<script>
	import Breadcrumbs from '$lib/components/admin/breadcrumbs.svelte';
	import Sidebar from '$lib/components/admin/sidebar.svelte';
	import Toast from '$lib/components/toast.svelte';
	let { children } = $props();
</script>

<div class="drawer lg:drawer-open">
	<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<!-- Navbar -->
		<nav class="navbar w-full bg-base-300">
			<label for="my-drawer-4" aria-label="open sidebar" class="btn btn-square btn-ghost">
				<!-- Sidebar toggle icon -->
				<img src="/menu-alt-2-svgrepo-com.svg" alt="menus" />
			</label>
			<div class="px-4">Family Admin</div>
		</nav>
		<!-- Page content here -->
		<Breadcrumbs />
		<Toast />
		{@render children()}
	</div>

	<Sidebar />
</div>
