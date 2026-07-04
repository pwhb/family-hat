<script lang="ts">
	import { page } from '$app/state';
	import { buildEditableObj, fillTemplate, getOptions } from '$lib/util/client';
	let obj = $state(buildEditableObj(page.data.pageConfig.fields, page.data.pageData.data));
	const submitConf = page.data.pageConfig.submit;
	const onsubmit = async () => {
		const res = await fetch(fillTemplate(submitConf.url, page.data.pageData.data), {
			method: submitConf.method,
			headers: {
				...submitConf.headers
			},
			body: JSON.stringify(obj)
		});
		const resJSON = await res.json();
	};
</script>

{#if page.data.pageConfig}
	<form {onsubmit}>
		<fieldset class="fieldset rounded-box border border-base-300 bg-base-200 p-4">
			<legend class="fieldset-legend">Edit</legend>
			{#each page.data.pageConfig.fields as field}
				{#if field.inputtype === 'text'}
					<legend class="fieldset-legend">{field.name}</legend>
					{#if field.lang && field.lang.length}
						<div class="flex gap-5">
							{#each field.lang as lang}
								<input
									bind:value={obj[field.key][lang]}
									type="text"
									class="input"
									placeholder={field.placeholder || `${field.name} (${lang})`}
								/>
							{/each}
						</div>
					{:else}
						<input
							bind:value={obj[field.key]}
							type="text"
							class="input"
							placeholder={field.placeholder || `${field.name}`}
						/>
					{/if}
				{:else if field.inputtype === 'checkbox'}
					<fieldset class="fieldset w-64 p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<label class="label">
							<input type="checkbox" bind:checked={obj[field.key]} class="toggle" />
						</label>
					</fieldset>
				{:else if field.inputtype === 'select'}
					<fieldset class="fieldset">
						<legend class="fieldset-legend">{field.name}</legend>
						{#await getOptions(field.options) then options}
							<select class="select" bind:value={obj[field.key]}>
								{#each options as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
						{/await}
					</fieldset>
				{/if}
			{/each}
			<button type="submit" class="btn btn-primary">Save</button>
		</fieldset>
	</form>
{:else}
	<p>Please configure page config first. [{page.data.key}]</p>
{/if}
