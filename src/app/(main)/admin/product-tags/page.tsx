import productTagService from '@/service/prductTag.service'
import ListView from './_components/ListView'

const ProductTagPage = async () => {
    const { payload: data } = await productTagService.getAll()

    return (
        <>
            <ListView initialData={data.items} />
        </>
    )
}

export default ProductTagPage
