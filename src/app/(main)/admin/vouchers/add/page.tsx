import customerService from '@/service/customer.service'
import VoucherForm from './_components/ListView'

const VoucherAddPage = async () => {
    const { payload: customers } = await customerService.getAll()

    return (
        <>
            <VoucherForm initialCustomers={customers.items} />
        </>
    )
}

export default VoucherAddPage
