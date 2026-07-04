<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toastManager } from '$lib/toast.svelte';
	import {
		buildEditableObj,
		fillTemplate,
		formatDateTime,
		getDeepValue,
		getOptions
	} from '$lib/util/client';
	const mode = page.url.pathname.split('/')[3];
	const data = mode === 'edit' ? page.data.pageData.data : {};

	let obj = $state(buildEditableObj(page.data.pageConfig?.fields, data));
	const onsubmit = async () => {
		try {
			const submitConf = page.data.pageConfig.submit;
			const res = await fetch(fillTemplate(submitConf.url, data), {
				method: submitConf.method,
				headers: {
					...submitConf.headers
				},
				body: JSON.stringify(obj)
			});
			const resJSON = await res.json();
			if (res.ok) {
				toastManager.show({
					message: submitConf.successResp
						? fillTemplate(submitConf.successResp, resJSON)
						: 'Success',
					type: 'success'
				});

				const [_, admin, slug] = page.url.pathname.split('/');
				goto(`/${admin}/${slug}?page=1&size=10`);
			} else {
				throw Error(resJSON && resJSON.message ? resJSON.message : 'Error');
			}
		} catch (error: any) {
			toastManager.show({
				message: error && error.message ? error.message : 'Error',
				type: 'error',
				ttl: 3000
			});
		}
	};
</script>

{#if page.data.pageConfig}
	<form {onsubmit}>
		<fieldset class="fieldset rounded-box border border-base-300 bg-base-200 p-4">
			<legend class="fieldset-legend text-xl">Edit</legend>
			{#each page.data.pageConfig.fields as field}
				{#if field.inputtype === 'text'}
					<fieldset class="fieldset p-4">
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
					</fieldset>
				{:else if field.inputtype === 'password'}
					<fieldset class="fieldset p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<input
							bind:value={obj[field.key]}
							type="password"
							class="input"
							placeholder={field.placeholder || `${field.name}`}
						/>
					</fieldset>
				{:else if field.inputtype === 'number'}
					<fieldset class="fieldset p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<input
							bind:value={obj[field.key]}
							type="number"
							class="input"
							placeholder={field.placeholder || `${field.name}`}
						/>
					</fieldset>
				{:else if field.inputtype === 'textarea'}
					<fieldset class="fieldset p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<textarea class="textarea w-full" placeholder={field.name} bind:value={obj[field.key]}
						></textarea>
					</fieldset>
				{:else if field.inputtype === 'checkbox'}
					<fieldset class="fieldset p-4">
						<legend class="fieldset-legend">{field.name}</legend>
						<input type="checkbox" bind:checked={obj[field.key]} class="toggle" />
					</fieldset>
				{:else if field.inputtype === 'select'}
					<fieldset class="fieldset p-4">
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
			{#if mode === 'edit'}
				<div class="mb-10 grid grid-cols-2 gap-4">
					{#each page.data.pageConfig.viewonlyFields as field}
						<div>
							<legend class="fieldset-legend">{field.name}</legend>
							{#if field.datatype === 'datetime'}
								<p>
									{formatDateTime(getDeepValue(data, field.key))}
								</p>
							{:else}
								<p>{getDeepValue(data, field.key)}</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
			<button type="submit" class="btn btn-primary">Save</button>
		</fieldset>
	</form>
{:else}
	<p>Please configure page config first. [{page.data.key}]</p>
{/if}
