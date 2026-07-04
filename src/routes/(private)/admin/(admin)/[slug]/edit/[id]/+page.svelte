<script lang="ts">
	import { page } from '$app/state';
	import { toastManager } from '$lib/toast.svelte';
	import {
		buildEditableObj,
		fillTemplate,
		formatDateTime,
		getDeepValue,
		getOptions
	} from '$lib/util/client';
	let obj = $state(buildEditableObj(page.data.pageConfig?.fields, page.data.pageData.data));
	const onsubmit = async () => {
		const submitConf = page.data.pageConfig.submit;
		const res = await fetch(fillTemplate(submitConf.url, page.data.pageData.data), {
			method: submitConf.method,
			headers: {
				...submitConf.headers
			},
			body: JSON.stringify(obj)
		});
		const resJSON = await res.json();

		toastManager.show({
			message: submitConf.successResp ? fillTemplate(submitConf.successResp, resJSON) : 'Success',
			type: 'success'
		});
	};
</script>

{#if page.data.pageConfig}
	<form {onsubmit}>
		<fieldset class="fieldset rounded-box border border-base-300 bg-base-200 p-4">
			<legend class="fieldset-legend text-xl">Edit</legend>
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
				{:else if field.inputtype === 'textarea'}
					<fieldset class="fieldset p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<textarea class="textarea w-full" placeholder={field.name} bind:value={obj[field.key]}></textarea>
						<!-- <input type="checkbox" bind:checked={obj[field.key]} class="toggle" /> -->
					</fieldset>
				{:else if field.inputtype === 'checkbox'}
					<fieldset class="fieldset w-64 p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<input type="checkbox" bind:checked={obj[field.key]} class="toggle" />
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
			<div class="mb-10 grid grid-cols-2 gap-4">
				{#each page.data.pageConfig.viewonlyFields as field}
					<div>
						<legend class="fieldset-legend">{field.name}</legend>
						{#if field.datatype === 'datetime'}
							<p>
								{formatDateTime(getDeepValue(page.data.pageData.data, field.key))}
							</p>
						{:else}
							<p>{getDeepValue(page.data.pageData.data, field.key)}</p>
						{/if}
					</div>
				{/each}
			</div>
			<button type="submit" class="btn btn-primary">Save</button>
		</fieldset>
	</form>
{:else}
	<p>Please configure page config first. [{page.data.key}]</p>
{/if}
