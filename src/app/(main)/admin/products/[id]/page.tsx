import CategoryService from '@/service/CategoryService'
import ProductAddForm from './ProductAddForm'
import ProductAttributeService from '@/service/ProductAttributeService'
import ProductService from '@/service/ProducrService'
import manufacturerService from '@/service/manufacturer.service'

interface EditProductProps {
    params: {
        id: string
    }
    searchParams: Record<string, string | string[]>
}

async function EditProduct(props: EditProductProps) {
    const { id } = props.params
    const [categoriesData, productAttributesData, product] = await Promise.all([
        CategoryService.getAllCategoryNames(),
        ProductAttributeService.getAllProductAttributeNames(),
        ProductService.getProductById(+id)
    ])

    const { payload: manufacturersData } = await manufacturerService.getListName()

    return (
        <>
            <ProductAddForm
                categories={categoriesData}
                manufacturers={manufacturersData}
                productAttributes={productAttributesData}
                product={product}
            />
        </>
    )
}

export default EditProduct
