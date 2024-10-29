import customerService from '@/service/customer.service'
import roleService from '@/service/role.service'
import CustomerForm from './_components/Form'

interface PageProps {
    params: {
        id: string
    }
}

export default async function Page({ params }: PageProps) {
    const { payload: customer } = await customerService.getById(+params.id)
    const { payload: roles } = await roleService.getListName()

    return <CustomerForm roles={roles} initialData={customer} />
}
