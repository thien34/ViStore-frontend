import { useState } from 'react'
import CustomerForm from '../../customers/add/_components/Form'
import { Dialog } from 'primereact/dialog'
import roleService from '@/service/role.service'
import { RoleName } from '@/interface/role.interface'
import { useMountEffect } from 'primereact/hooks'

type Props = {
    visible: boolean
    setVisible: (visible: boolean) => void
    onClose: () => void
}

export default function DialogAddCustomer({ visible, onClose }: Props) {
    const [roles, setRoles] = useState<RoleName[]>([])
    const fetchRoles = async () => {
        const { payload: roles } = await roleService.getListName()
        setRoles(roles)
    }
    useMountEffect(() => {
        fetchRoles()
    })

    return (
        <Dialog
            style={{ width: '70vw', marginLeft: '15vw' }}
            modal
            header='Thêm Khách Hàng'
            visible={visible}
            onHide={onClose}
        >
            <CustomerForm roles={roles} isRedirect={true} onClose={onClose} />
        </Dialog>
    )
}
