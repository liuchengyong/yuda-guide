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
    parentId: string | null
    sort: number
    id: string
  },
  K extends { children?: K[] },
>(datas: T[], parentId: string | null, callback: (item: T) => K): K[] {
  return datas
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sort - b.sort)
    .map((item) => {
      let list = buildTree(datas, item.id, callback)
      return {
        ...callback(item),
        children: list.length > 0 ? list : undefined,
      } as K
    })
}
