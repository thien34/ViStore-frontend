import ProductAddForm from './_components/ProductForm'
import categoryService from '@/service/category.service'
import manufacturerService from '@/service/manufacturer.service'
import productAttributeService from '@/service/productAttribute.service'

export default async function ProductCreatePage() {
    const { payload: nodes } = await categoryService.getListName()
    const treeNodes = categoryService.convertToTreeNode(nodes)

    const { payload: manufacturersData } = await manufacturerService.getListName()
    const { payload: productAttributesData } = await productAttributeService.getListName()

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
