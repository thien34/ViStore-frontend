import CategoryService from '@/service/CategoryService'
import ProductService from '@/service/ProducrService'
import manufacturerService from '@/service/manufacturer.service'
import productAttributeService from '@/service/productAttribute.service'
import ProductAddForm from './_components/ProductAddForm'

interface EditProductProps {
    params: {
        id: string
    }
    searchParams: Record<string, string | string[]>
}

async function EditProduct(props: EditProductProps) {
    const { id } = props.params
    const [categoriesData, product, products] = await Promise.all([
        CategoryService.getAllCategoryNames(),
        ProductService.getProductById(+id),
        ProductService.getProductsByParentId(+id)
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
                products={products}
            />
        </>
    )
}

export default EditProduct
