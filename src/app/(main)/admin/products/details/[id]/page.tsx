import ProductService from '@/service/ProducrService'

import productAttributeService from '@/service/productAttribute.service'
import ProductDetailsForm from '../_components/ProductDetailsForn'

interface EditProductProps {
    params: {
        id: string
    }
    searchParams: Record<string, string | string[]>
}

export default async function ProductDetails(props: EditProductProps) {
    const { id } = props.params
    const data = await ProductService.getProductDetails(+id)
    const { payload: productAttributesData } = await productAttributeService.getListName()
    return (
        <>
            <ProductDetailsForm product={data} productAttributes={productAttributesData} />
        </>
    )
}
