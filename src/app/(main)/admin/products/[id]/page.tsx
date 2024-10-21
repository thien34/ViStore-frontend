import CategoryService from '@/service/CategoryService'
import ManufacturerService from '@/service/ManufacturerService'
import ProductAddForm from './ProductAddForm'
import ProductAttributeService from '@/service/ProductAttributeService'
import ProductService from '@/service/ProducrService'

interface EditProductProps {
    params: {
        id: string
    }
    searchParams: Record<string, string | string[]>
}

async function EditProduct(props: EditProductProps) {
    const { id } = props.params
    const [categoriesData, manufacturersData, productAttributesData, product] = await Promise.all([
        CategoryService.getAllCategoryNames(),
        ManufacturerService.getAllManufacturerNames(),
        ProductAttributeService.getAllProductAttributeNames(),
        ProductService.getProductById(+id)
    ])

    console.log(product)

    return (
        <>
            <ProductAddForm categories={categoriesData} manufacturers={manufacturersData} productAttributes={productAttributesData} product={product} />
        </>
    )
}

export default EditProduct
