<script>
	let { children } = $props();
</script>

<div class="m-4 mt-0 fieldset rounded-box border border-base-300 bg-base-200 p-4">
	{@render children?.()}
</div>
