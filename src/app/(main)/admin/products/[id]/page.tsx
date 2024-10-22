import CategoryService from '@/service/CategoryService'
import ProductAddForm from './ProductAddForm'
import ProductService from '@/service/ProducrService'
import manufacturerService from '@/service/manufacturer.service'
import productAttributeService from '@/service/productAttribute.service'

interface EditProductProps {
    params: {
        id: string
    }
    searchParams: Record<string, string | string[]>
}

async function EditProduct(props: EditProductProps) {
    const { id } = props.params
    const [categoriesData, product] = await Promise.all([
        CategoryService.getAllCategoryNames(),
        ProductService.getProductById(+id)
    ])

    const { payload: manufacturersData } = await manufacturerService.getListName()
    const { payload: productAttributesData } = await productAttributeService.getListName()

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
