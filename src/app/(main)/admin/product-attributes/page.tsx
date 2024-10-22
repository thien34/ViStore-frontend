import ListView from './_components/ListView'
import productAttributeService from '@/service/productAttribute.service'

const ProductAttributePage = async () => {
    const { payload: data } = await productAttributeService.getAll()

    return (
        <>
            <ListView initialData={data.items} />
        </>
    )
}

export default ProductAttributePage
