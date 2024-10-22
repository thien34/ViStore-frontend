import manufacturerService from '@/service/manufacturer.service'
import ListView from './_components/ListView'

const ManufacturerPage = async () => {
    const { payload: data } = await manufacturerService.getAll()

    return (
        <>
            <ListView initialData={data.items} />
        </>
    )
}

export default ManufacturerPage
