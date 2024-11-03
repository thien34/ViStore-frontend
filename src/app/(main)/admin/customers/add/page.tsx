import roleService from '@/service/role.service'
import CustomerForm from './_components/Form'

const CustomerAddPage = async () => {
    const { payload: roles } = await roleService.getListName()
    return (
        <>
            <CustomerForm roles={roles} />
        </>
    )
}

export default CustomerAddPage
