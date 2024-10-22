import ProductAddForm from './ProductForm'
import ProductAttributeService from '@/service/ProductAttributeService'
import categoryService from '@/service/category.service'
import manufacturerService from '@/service/manufacturer.service'

export default async function ProductCreatePage() {
    const [productAttributesData] = await Promise.all([ProductAttributeService.getAllProductAttributeNames()])

    const { payload: nodes } = await categoryService.getListName()
    const treeNodes = categoryService.convertToTreeNode(nodes)

    const { payload: manufacturersData } = await manufacturerService.getListName()

    return (
        <div>
            <ProductAddForm
                categories={treeNodes}
                manufacturers={manufacturersData}
                productAttributes={productAttributesData}
            />
        </div>
    )
}
