'use client'

import React, { useEffect, useState } from 'react'
import { Select, Spin } from 'antd'
import * as Icons from '@ant-design/icons'

type IconName = keyof typeof Icons

interface IconPickerProps {
  value?: string
  onChange?: (val: string) => void
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [iconOptions, setIconOptions] = useState<
    { label: React.ReactNode; value: string }[]
  >([])

  useEffect(() => {
    // 仅提取 Outlined 图标（常用）
    const names = Object.keys(Icons).filter((key) => key.endsWith('Outlined'))

    const options = names.map((name) => {
      const IconComponent = Icons[name as IconName] as React.FC
      return {
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconComponent /> {name}
          </span>
        ),
        value: name,
      }
    })

    setIconOptions(options)
  }, [])

  if (iconOptions.length === 0) return <Spin />

  return (
    <Select
      showSearch
      placeholder="请选择图标"
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
      optionLabelProp="label"
      filterOption={(input, option) =>
        (option?.value as string).toLowerCase().includes(input.toLowerCase())
      }
      options={iconOptions}
    />
  )
}

export default IconPicker
