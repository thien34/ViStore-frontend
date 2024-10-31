import customerService from '@/service/customer.service'
import roleService from '@/service/role.service'
import CustomerForm from './_components/Form'
import addressService from '@/service/address.service'
import provinceService from '@/service/province.service'

interface PageProps {
    params: {
        id: string
    }
}

export default async function Page({ params }: PageProps) {
    const { payload: customer } = await customerService.getById(+params.id)
    const { payload: roles } = await roleService.getListName()
    const { payload: addresses } = await addressService.getAll(+params.id)
    const { payload: provinces } = await provinceService.getAll()

    return (
        <CustomerForm
            customerId={+params.id}
            roles={roles}
            initialData={customer}
            initAddresses={addresses.items}
            provinces={provinces}
        />
    )
}
