import customerService from '@/service/customer.service'
import ListView from './_components/ListView'

const CustomerPage = async () => {
    const { payload: data } = await customerService.getAll()

    return (
        <>
            <ListView initialData={data.items} />
        </>
    )
}

export default CustomerPage
