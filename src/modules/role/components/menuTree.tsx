'use client'

import { Tree, TreeDataNode, TreeProps } from 'antd'
import { Key, useMemo } from 'react'

interface MenuTreeProps {
  treeData: TreeDataNode[]
  value?: Key[]
  onChange?: (value: Key[]) => void
}

function traverseTree(
  tree: TreeDataNode[],
  callback: (node: TreeDataNode) => void,
) {
  tree.forEach((item) => {
    callback(item)
    if (item.children && item.children.length > 0) {
      traverseTree(item.children, callback)
    }
  })
}

const MenuTree: React.FC<MenuTreeProps> = (props) => {
  const { value = [], onChange, treeData } = props

  const onCheck: TreeProps['onCheck'] = (checkedKeys, info) => {
    if (Array.isArray(checkedKeys)) {
      onChange && onChange(checkedKeys.concat(info.halfCheckedKeys || []))
    }
  }

  const checkedKeys: Key[] = useMemo(() => {
    let result: Key[] = []
    if (value.length > 0 && treeData.length > 0) {
      traverseTree(treeData, (node: TreeDataNode) => {
        if (value.includes(node.key) && node.isLeaf) {
          result.push(node.key)
        }
      })
    }
    return result
  }, [treeData, value])

  return (
    <Tree
      checkable
      checkedKeys={checkedKeys}
      onCheck={onCheck}
      treeData={treeData}
    ></Tree>
  )
}

export default MenuTree
