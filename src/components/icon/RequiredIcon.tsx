import React from 'react'
import { FaAsterisk } from 'react-icons/fa'
import { IconType } from 'react-icons'

interface RequiredIconProps {
    icon?: IconType
    color?: string
    size?: number
}

const RequiredIcon = ({ icon: Icon = FaAsterisk, color = '#FF6B6B', size = 6 }: RequiredIconProps) => {
    return (
        <Icon
            color={color}
            size={size}
            style={{
                position: 'relative',
                top: '-0.4em',
                display: 'inline-block',
                verticalAlign: 'middle'
            }}
        />
    )
}

export default RequiredIcon
