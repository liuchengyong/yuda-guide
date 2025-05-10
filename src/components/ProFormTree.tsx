// components/TreeSelectorFormItem.tsx
import React from 'react'
import { Tree, TreeDataNode, TreeProps } from 'antd'
import { ProFormItem, ProFormItemProps } from '@ant-design/pro-components'

interface ProFormTreeProps extends ProFormItemProps {
  name: string
  label: string

  treeData: TreeDataNode[]
  treeProps: TreeProps
}

const ProFormTree: React.FC<ProFormTreeProps> = ({
  name,
  label,
  treeData,
  treeProps,
}) => {
  return (
    <ProFormItem name={name} label={label} rules={rules}>
      <Tree
        {...treeProps}
        treeData={treeData}
        checkable={multiple}
        multiple={multiple}
        onCheck={(checkedKeys) => {
          // 手动同步选中的值
          fieldProps?.onChange?.(checkedKeys)
        }}
        {...fieldProps}
      />
    </ProFormItem>
  )
}

export default ProFormTree
