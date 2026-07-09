<script lang="ts">
	import { untrack } from 'svelte';
	import { JSONEditor, Mode, type Content, type OnChange } from 'svelte-jsoneditor';

	interface Props {
		value?: string | object | unknown[] | null;
		json?: boolean;
		mode?: Mode;
		mainMenuBar?: boolean;
		navigationBar?: boolean;
		statusBar?: boolean;
	}

	let {
		value = $bindable(''),
		json = false,
		mode,
		mainMenuBar,
		navigationBar,
		statusBar
	}: Props = $props();

	function parseToNative(val: any): any {
		if (typeof val === 'string') {
			try {
				let parsed = JSON.parse(val);
				while (typeof parsed === 'string') {
					parsed = JSON.parse(parsed);
				}
				return parsed;
			} catch {
				return val;
			}
		}
		return val;
	}

	// Helper to format incoming values safely to the editor content structure
	function toEditorContent(val: any, isJsonMode: boolean): Content {
		const nativeData = parseToNative(val);
		if (isJsonMode) {
			return { json: typeof nativeData === 'object' && nativeData !== null ? nativeData : {} };
		} else {
			return {
				text: typeof nativeData === 'object' ? JSON.stringify(nativeData) : String(nativeData ?? '')
			};
		}
	}

	// Initialize editor state
	let content: Content = $state(untrack(() => toEditorContent(value, json)));

	$effect(() => {
		const currentExternal = value;
		const currentJsonProp = json;

		untrack(() => {
			let externalSig = '';
			try {
				const nativeData = parseToNative(currentExternal);
				externalSig = JSON.stringify(nativeData);
			} catch {
				externalSig = String(currentExternal);
			}

			let internalSig = '';
			let isInternalInvalid = false;

			if ('json' in content) {
				internalSig = JSON.stringify(content.json);
			} else if ('text' in content) {
				try {
					internalSig = JSON.stringify(JSON.parse(content.text));
				} catch {
					isInternalInvalid = true; // Text mode has structural syntax errors
				}
			}

			if (isInternalInvalid) return;

			if (externalSig !== internalSig) {
				content = toEditorContent(currentExternal, currentJsonProp);
			}
		});
	});

	const handleChange: OnChange = (updatedContent, previousContent, { contentErrors }) => {
		content = updatedContent;

		if (contentErrors && Object.keys(contentErrors).length > 0) {
			return;
		}

		try {
			// 1. Extract the raw input out of whichever layout mode the user is typing in
			let extracted: any;
			if ('json' in updatedContent) {
				extracted = updatedContent.json;
			} else if ('text' in updatedContent) {
				extracted = JSON.parse(updatedContent.text);
			}

			// 2. Enforce structural format mutations upstream based on requirements
			if (json) {
				// FORCE: Must be an object, never a string representation
				const dynamicObject = parseToNative(extracted);
				value = typeof dynamicObject === 'object' && dynamicObject !== null ? dynamicObject : {};
			} else {
				// FORCE: Strictly a flattened, minified JSON string layout
				const dynamicObject = parseToNative(extracted);
				value = JSON.stringify(dynamicObject);
			}
		} catch (e) {
			// Absorb incomplete text parsing states during rapid typing strokes
		}
	};
</script>

<div>
	<JSONEditor {content} onChange={handleChange} {mode} {navigationBar} {mainMenuBar} {statusBar} />
</div>
