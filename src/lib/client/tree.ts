import { fillTemplate, getDeepValue } from './common';

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
	groupBy?: string[];
	labels?: string[];
}

export function buildTree(flatData: FlatNode[], config?: TreeConfig): TreeNode[] {
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
		return roots;
	}

	const roots: TreeNode[] = [];

	for (const item of flatData) {
		let currentLevelChildren = roots;

		config.groupBy.forEach((path, index) => {
			const rawGroupValue = getDeepValue(path, item);
			const groupValue = rawGroupValue !== undefined ? String(rawGroupValue) : 'unknown';

			let existingGroupNode = currentLevelChildren.find(
				(node) => node.value === groupValue && !node.isCheckbox
			);

			if (!existingGroupNode) {
				const template = config.labels?.[index];
				const finalLabel = template ? fillTemplate(template, item) : groupValue;
				existingGroupNode = {
					value: groupValue,
					label: finalLabel,
					isCheckbox: false,
					children: []
				};
				currentLevelChildren.push(existingGroupNode);
			}
			currentLevelChildren = existingGroupNode.children;
		});

		const leafTemplateIndex = config.groupBy.length;
		const leafTemplate = config.labels?.[leafTemplateIndex];

		const value = String(item._id || item.value);
		const finalLeafLabel = leafTemplate ? fillTemplate(leafTemplate, item) : item.label || value;

		currentLevelChildren.push({
			...item,
			value,
			label: finalLeafLabel,
			isCheckbox: true,
			children: []
		});
	}
	return roots;
}
