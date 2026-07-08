interface FlatNode {
	value: string;
	label: string;
	parent: string | null | '';
	[key: string]: any; // Allows any extra custom metadata fields
}

// Explicitly type the output node structure
export type TreeNode<T extends FlatNode> = T & {
	children: TreeNode<T>[];
};

export function buildTree<T extends FlatNode>(flatData: T[]): TreeNode<T>[] {
	const map = new Map<string, TreeNode<T>>();
	const roots: TreeNode<T>[] = [];

	// Step 1: Initialize the map with deep/structured copies of the nodes
	// This adds the children array and preserves all custom metadata fields
	for (const item of flatData) {
		map.set(item.value, { ...item, children: [] });
	}

	// Step 2: Wire up the parent-child relationships positionally
	for (const item of flatData) {
		const mappedNode = map.get(item.value)!;
		const parentId = item.parent;

		// If it has a parent and that parent exists in our map, hook it in
		if (parentId && map.has(parentId)) {
			map.get(parentId)!.children.push(mappedNode);
		} else {
			// Otherwise, it's a top-level root node
			roots.push(mappedNode);
		}
	}

	return roots;
}
