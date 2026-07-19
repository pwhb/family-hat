<script>
	import { page } from '$app/state';
	import { formatDateTime, getDeepValue } from '$lib/client/common';
</script>

<div class="mx-4 overflow-x-auto md:mx-10">
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
		{#if page.data.pageData}
			<tbody>
				{#each page.data.pageData.data as row, idx}
					<tr>
						<th>{(page.data.pageData.page - 1) * page.data.pageData.size + idx + 1}</th>
						{#each page.data.pageConfig.row as rowConf}
							{#if rowConf.type === 'display'}
								{#if rowConf.datatype === 'datetime'}
									<td>{formatDateTime(getDeepValue(rowConf.key, row))}</td>
								{:else if rowConf.datatype === 'boolean'}
									<td>
										<span
											class={getDeepValue(rowConf.key, row)
												? 'badge text-white uppercase badge-success'
												: 'badge text-white uppercase badge-error'}
										>
											{getDeepValue(rowConf.key, row)}
										</span>
									</td>
								{:else}
									<td>{getDeepValue(rowConf.key, row)}</td>
								{/if}
							{:else if rowConf.type === 'actions'}
								<td>
									<a href={`${page.url.pathname}/edit/${row._id}`} class="btn btn-secondary">Edit</a
									>
								</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		{/if}
	</table>
</div>
<div class="my-10 flex items-center justify-around">
	<!-- <p>Showing {page.data.pageData.data.length} out of {page.data.pageData.count}</p> -->
	{#if page.data.pageData}
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
	{/if}
</div>
