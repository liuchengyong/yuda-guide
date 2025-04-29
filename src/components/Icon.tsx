'use client'

import React from 'react'
import * as Icons from '@ant-design/icons'

interface IconProps {
  value?: string
}

const Icon: React.FC<IconProps> = ({ value }) => {
  if (!value) {
    return <>-</>
  }
  if (Object.keys(Icons).includes(value)) {
    const Icon = Icons[value as keyof typeof Icons] as React.FC
    return <Icon />
  }
  return <>{value}</>
}

export default Icon
