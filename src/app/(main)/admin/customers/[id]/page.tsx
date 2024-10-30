import customerService from '@/service/customer.service'
import roleService from '@/service/role.service'
import CustomerForm from './_components/Form'
import addressService from '@/service/address.service'

interface PageProps {
    params: {
        id: string
    }
}

export default async function Page({ params }: PageProps) {
    const { payload: customer } = await customerService.getById(+params.id)
    const { payload: roles } = await roleService.getListName()
    const { payload: addresses } = await addressService.getAll(+params.id)

    return <CustomerForm roles={roles} initialData={customer} initAddresses={addresses.items} />
}
