<script>
	import { page } from '$app/state';
	import { formatDateTime, getDeepValue } from '$lib/client/common';
</script>

<div class="overflow-x-auto">
	<table class="table">
		<!-- head -->
		<thead>
			<tr>
				<th></th>
				{#each page.data.pageConfig.head as item}
					<th>{item}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each page.data.pageData.data as row, idx}
				<tr>
					<th>{(page.data.pageData.page - 1) * page.data.pageData.size + idx + 1}</th>
					{#each page.data.pageConfig.row as rowConf}
						{#if rowConf.type === 'display'}
							{#if rowConf.datatype === 'datetime'}
								<td>{formatDateTime(getDeepValue(row, rowConf.key))}</td>
							{:else if rowConf.datatype === 'boolean'}
								<td>
									<span
										class={getDeepValue(row, rowConf.key)
											? 'badge text-white uppercase badge-success'
											: 'badge text-white uppercase badge-error'}
									>
										{getDeepValue(row, rowConf.key)}
									</span>
								</td>
							{:else}
								<td>{getDeepValue(row, rowConf.key)}</td>
							{/if}
						{:else if rowConf.type === 'actions'}
							<td>
								<a href={`${page.url.pathname}/edit/${row._id}`} class="btn btn-secondary">Edit</a>
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<div class="my-4 flex items-center justify-around">
	<!-- <p>Showing {page.data.pageData.data.length} out of {page.data.pageData.count}</p> -->
	<div class="join">
		{#if page.data.pageData.page !== 1}
			<a
				class="btn join-item"
				href={`${page.url.pathname}?page=${page.data.pageData.page - 1}&size=${page.data.pageData.size}`}
				>Back</a
			>
		{/if}
		<span class="btn join-item">
			Page {page.data.pageData.page} of {Math.ceil(
				page.data.pageData.count / page.data.pageData.size
			)}</span
		>
		{#if page.data.pageData.page !== Math.ceil(page.data.pageData.count / page.data.pageData.size)}
			<a
				class="btn join-item"
				href={`${page.url.pathname}?page=${page.data.pageData.page + 1}&size=${page.data.pageData.size}`}
				>Next</a
			>
		{/if}
	</div>
</div>
