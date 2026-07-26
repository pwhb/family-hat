<script lang="ts">
	let { children } = $props();
</script>

<!-- Main Page Wrapper: Allows natural single-scrollbar window scrolling -->
<div class="flex min-h-screen w-full items-center justify-center bg-base-300 p-3 font-serif sm:p-6">
	<!-- Main Scroll Outer Wrapper -->
	<div
		class="relative mx-auto my-auto flex min-h-[40vh] w-full max-w-4xl items-stretch justify-center"
	>
		<!-- Left Wooden Roller/Handle -->
		<div
			class="relative z-20 w-5 shrink-0 rounded-l-md bg-linear-to-r from-amber-950 via-amber-900 to-amber-950 shadow-2xl sm:w-8"
		>
			<!-- Top Wooden Cap -->
			<div
				class="absolute -top-3 -left-1 h-5 w-7 rounded-t-lg bg-amber-950 shadow-md sm:-left-1.5 sm:w-11"
			></div>
			<!-- Bottom Wooden Cap -->
			<div
				class="absolute -bottom-3 -left-1 h-5 w-7 rounded-b-lg bg-amber-950 shadow-md sm:-left-1.5 sm:w-11"
			></div>
		</div>

		<!-- Scroll Body Container -->
		<div
			class="relative z-10 flex w-full flex-col justify-between overflow-hidden rounded-sm bg-[#f4e4bc] p-6 text-amber-950 shadow-2xl sm:p-12"
		>
			<!-- Parchment Texture Background Layer (Negative margins stretch under rollers) -->
			<div
				class="pointer-events-none absolute -inset-24 bg-center opacity-40 mix-blend-multiply"
				style="background-image: url('/parchment-background.png'); background-size: 100% 100%;"
			></div>

			<!-- Inner Vignette / Burned Edge Effect -->
			<div
				class="pointer-events-none absolute inset-0 z-10 border-y-8 border-amber-900/10 shadow-[inset_0_0_40px_rgba(120,53,15,0.35)]"
			></div>

			<!-- Scroll Content Wrapper -->
			<div class="relative z-20 flex h-full min-h-[60vh] flex-col justify-between gap-6">
				{@render children?.()}
			</div>
		</div>

		<!-- Right Wooden Roller/Handle -->
		<div
			class="relative z-20 w-5 shrink-0 rounded-r-md bg-linear-to-r from-amber-950 via-amber-900 to-amber-950 shadow-2xl sm:w-8"
		>
			<!-- Top Wooden Cap -->
			<div
				class="absolute -top-3 -right-1 h-5 w-7 rounded-t-lg bg-amber-950 shadow-md sm:-right-1.5 sm:w-11"
			></div>
			<!-- Bottom Wooden Cap -->
			<div
				class="absolute -right-1 -bottom-3 h-5 w-7 rounded-b-lg bg-amber-950 shadow-md sm:-right-1.5 sm:w-11"
			></div>
		</div>
	</div>
</div>
