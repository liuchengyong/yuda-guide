export function dfs<T extends { children?: T[] }>(
  tree: T[],
  callback: (node: T) => void,
) {
  tree.forEach((node) => {
    callback(node)
    if (node.children) {
      dfs(node.children, callback)
    }
  })
}

export function buildTree<
  T extends {
    parentId: string | number | null
    sort: number
    id: string | number
  },
  K extends { children?: K[] },
>(datas: T[], parentId: string | number | null, callback: (item: T) => K): K[] {
  return datas
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map((item) => {
      return {
        ...callback(item),
        children: buildTree(datas, item.id, callback),
      } as K
    })
}
