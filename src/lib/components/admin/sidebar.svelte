<script lang="ts">
	import { page } from '$app/state';
	const { user, adminConf } = page.data;
</script>

<div class="drawer-side is-drawer-close:overflow-visible">
	<label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
	<div
		class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:hidden is-drawer-open:w-64"
	>
		<ul class="menu w-full grow">
			<li>
				<a href="/admin/me" class="is-drawer-close:hidden">
					<span class="is-drawer-close:hidden">Logged In As: {user.name}</span>
				</a>
			</li>
			{#each adminConf.sidebarMenus as menu}
				<li>
					<a href={menu.url} class="is-drawer-close:hidden">
						<span class="is-drawer-close:hidden">{menu.label}</span>
					</a>
				</li>
			{/each}

			<li>
				<form action="/admin?/logout" method="POST">
					<button class="is-drawer-close:hidden" type="submit">
						<span class="text-error is-drawer-close:hidden">Logout</span>
					</button>
				</form>
			</li>
		</ul>
	</div>
</div>
