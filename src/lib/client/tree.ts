export interface FlatNode {
	[key: string]: any;
}

export interface TreeNode {
	value: string;
	label: string;
	isCheckbox?: boolean;
	children: TreeNode[];
	[key: string]: any;
}

export interface TreeConfig {
	// Both now accept serializable database strings or dot-notation paths
	groupBy?: string[]; // e.g., ["entity", "scope"] or ["meta.category"]
	labels?: string[]; // e.g., ["{{entity}} Group", "Scope: {{scope}}", "{{action}}"]
}

// Safely extracts deep paths like 'parent.name' from a node object
function getNestedValue(obj: any, path: string): any {
	return path.split('.').reduce((current, key) => {
		if (current === null || current === undefined) return undefined;
		return current[key];
	}, obj);
}

// Your template engine to construct final UI labels dynamically
export function fillTemplate(template: string, source: Record<string, any>): string {
	if (!template || !source) return template;
	return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
		const cleanPath = path.trim();
		const value = getNestedValue(source, cleanPath);
		return value !== undefined ? String(value) : match;
	});
}

export function buildTree(flatData: FlatNode[], config?: TreeConfig): TreeNode[] {
	// BACKWARD COMPATIBILITY: If no groupBy strategy is found, run standard parent-child linking
	console.log('WUTTYI', flatData, config);

	if (!config || !config.groupBy) {
		const map = new Map<string, TreeNode>();
		const roots: TreeNode[] = [];

		for (const item of flatData) {
			const value = String(item.value || item._id);
			map.set(value, { ...item, value, label: item.label || value, children: [] });
		}

		for (const item of flatData) {
			const value = String(item.value || item._id);
			const mappedNode = { ...map.get(value)!, isCheckbox: true };
			const parentId = item.parent;

			if (parentId && map.has(parentId)) {
				map.get(parentId)!.children.push(mappedNode);
			} else {
				roots.push(mappedNode);
			}
		}
		console.log('roots', roots);

		return roots;
	}

	// NEW FUNCTIONALITY: Static Path Grouping & Templated Labels
	const roots: TreeNode[] = [];

	for (const item of flatData) {
		let currentLevelChildren = roots;

		// Traverse down the hierarchy array strings
		config.groupBy.forEach((path, index) => {
			const rawGroupValue = getNestedValue(item, path);
			const groupValue = rawGroupValue !== undefined ? String(rawGroupValue) : 'unknown';

			let existingGroupNode = currentLevelChildren.find(
				(node) => node.value === groupValue && !node.isCheckbox
			);

			if (!existingGroupNode) {
				// If a template pattern exists for this tier level, parse it. Fall back to raw key string.
				const template = config.labels?.[index];
				const finalLabel = template ? fillTemplate(template, item) : groupValue;

				existingGroupNode = {
					value: groupValue,
					label: finalLabel,
					isCheckbox: false, // Organizational structure tier
					children: []
				};
				currentLevelChildren.push(existingGroupNode);
			}
			currentLevelChildren = existingGroupNode.children;
		});

		// Parse leaf level templates if they exist in the tail index position of the label array
		const leafTemplateIndex = config.groupBy.length;
		const leafTemplate = config.labels?.[leafTemplateIndex];

		const value = String(item._id || item.value);
		const finalLeafLabel = leafTemplate ? fillTemplate(leafTemplate, item) : item.label || value;

		// Append the actual checkable element
		currentLevelChildren.push({
			...item,
			value,
			label: finalLeafLabel,
			isCheckbox: true, // Actual permission action node
			children: []
		});
	}

	return roots;
}
