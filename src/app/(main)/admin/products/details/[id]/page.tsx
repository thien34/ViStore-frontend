import ProductService from '@/service/ProducrService'
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
    return (
        <>
            <ProductDetailsForm product={data} />
        </>
    )
}
