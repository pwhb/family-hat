<script lang="ts">
	import { page } from '$app/state';
	import { toastManager } from '$lib/toast.svelte';
	import {
		buildEditableObj,
		fillTemplate,
		formatDateTime,
		getDeepValue,
		getEntityName,
		getOptions
	} from '$lib/client/common';
	import Upload from './upload.svelte';
	import JsonEditor from './json_editor.svelte';
	import { tabManager } from '$lib/store/tabs.svelte';
	import TreeCheckboxGroup from './tree_checkbox_group.svelte';
	import { buildTree } from '$lib/client/tree';
	import MultiSelect from './multi_select.svelte';
	import { onMount, untrack } from 'svelte';

	const [_, admin, slug] = page.url.pathname.split('/');
	const mode = page.url.pathname.split('/')[3];
	const data = mode === 'edit' ? page.data.pageData.data : {};

	let obj = $state<Record<string, any>>(
		tabManager.currentTabDraft || buildEditableObj(page.data.pageConfig?.fields, data)
	);

	$effect(() => {
		const path = page.url.pathname;
		untrack(() => {
			obj = tabManager.currentTabDraft || buildEditableObj(page.data.pageConfig?.fields, data);
		});
	});

	$effect.pre(() => {
		const currentData = $state.snapshot(obj);

		if (Object.keys(currentData).length > 0) {
			untrack(() => {
				tabManager.updateCurrentDraft(currentData);
			});
		}
	});

	const onsubmit = async (e: Event) => {
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
				const targetUrl = `/${admin}/${slug}?page=1&size=10`;
				const formTab = tabManager.list.find((t) => t.pathname === page.url.pathname);
				if (formTab) {
					tabManager.closeTab(formTab.id, targetUrl);
				}
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

	let optionsCache = $state<Record<string, any[]>>({});

	onMount(() => {
		for (const field of page.data.pageConfig.fields) {
			if (['select', 'tree-selector', 'multi-select'].includes(field.inputtype) && field.options) {
				optionsCache[field.key] = [];

				getOptions(field.options)
					.then((resolvedOptions) => {
						optionsCache[field.key] = resolvedOptions || [];
					})
					.catch((err) => {
						console.error(`Failed to load options for ${field.key}:`, err);
					});
			}
		}
	});
</script>

<form {onsubmit} class="m-4 mt-0 fieldset rounded-box border border-base-300 bg-base-200 p-4">
	<legend class="fieldset-legend text-xl capitalize">{mode} {getEntityName(slug)}</legend>
	{#each page.data.pageConfig.fields as field}
		<fieldset class="fieldset p-4">
			<legend class="fieldset-legend">{field.name}</legend>
			{#if field.inputtype === 'text'}
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
			{:else if field.inputtype === 'password'}
				<input
					bind:value={obj[field.key]}
					type="password"
					class="input"
					placeholder={field.placeholder || `${field.name}`}
				/>
			{:else if field.inputtype === 'number'}
				<input
					bind:value={obj[field.key]}
					type="number"
					class="input"
					placeholder={field.placeholder || `${field.name}`}
				/>
			{:else if field.inputtype === 'textarea'}
				<textarea class="textarea w-full" placeholder={field.name} bind:value={obj[field.key]}
				></textarea>
			{:else if field.inputtype === 'checkbox'}
				<input type="checkbox" bind:checked={obj[field.key]} class="toggle" />
			{:else if field.inputtype === 'select'}
				{#if optionsCache[field.key] && optionsCache[field.key].length}
					<select class="select" bind:value={obj[field.key]}>
						{#each optionsCache[field.key] as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				{/if}
			{:else if field.inputtype === 'tree-selector'}
				{#if optionsCache[field.key] && optionsCache[field.key].length}
					<TreeCheckboxGroup
						bind:checkedValues={obj[field.key]}
						nodes={buildTree(optionsCache[field.key], field.options.config)}
					/>
				{/if}
			{:else if field.inputtype === 'multi-select'}
				<MultiSelect bind:selectedValues={obj[field.key]} options={optionsCache[field.key]} />
			{:else if field.inputtype === 'upload'}
				<Upload
					bind:value={obj[field.key]}
					name={field.name}
					cropRequired={field.cropRequired}
					aspectRatio={field.aspectRatio}
					accept={field.accept}
				/>
			{:else if field.inputtype === 'config'}
				{#if obj['type'] === 'json'}
					<!-- <JsonEditor 	 bind:value={obj[field.key]} /> -->
				{:else}
					<textarea class="textarea w-full" placeholder={field.name} bind:value={obj[field.key]}
					></textarea>
				{/if}
			{:else if field.inputtype === 'json'}
				<JsonEditor
					bind:value={obj[field.key]}
					json={field.json}
					mode={field.mode}
					statusBar={field.statusBar}
					mainMenuBar={field.mainMenuBar}
					navigationBar={field.navigationBar}
				/>
			{/if}
		</fieldset>
	{/each}
	{#if mode === 'edit'}
		<div class="mb-10 grid grid-cols-2 gap-4">
			{#each page.data.pageConfig.viewonlyFields as field}
				<div>
					<legend class="fieldset-legend">{field.name}</legend>
					{#if field.datatype === 'datetime'}
						<p>
							{formatDateTime(getDeepValue(field.key, data))}
						</p>
					{:else}
						<p>{getDeepValue(field.key, data)}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
	<button type="submit" class="btn btn-primary">Save</button>
</form>
