import ProductService from '@/service/ProducrService'
import ProductList from './ProductList'

export default async function ProductPage() {
    const products = await ProductService.getAllProducts()

    return (
        <>
            <ProductList products={products} />
        </>
    )
}
