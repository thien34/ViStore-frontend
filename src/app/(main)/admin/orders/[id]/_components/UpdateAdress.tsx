import { Dialog } from 'primereact/dialog'
import React from 'react'

type Props = {
    visible: boolean
    setVisible: (visible: boolean) => void
}

export default function UpdateAdress({ visible, setVisible }: Props) {
    return (
        <Dialog
            header='Update Address'
            visible={visible}
            style={{ width: '50vw' }}
            onHide={() => {
                if (!visible) return
                setVisible(false)
            }}
        ></Dialog>
    )
}
