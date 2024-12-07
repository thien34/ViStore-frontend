import ProductAddForm from './_components/ProductForm'
import categoryService from '@/service/category.service'
import manufacturerService from '@/service/manufacturer.service'

export default async function ProductCreatePage() {
    const { payload: nodes } = await categoryService.getListName()
    const treeNodes = categoryService.convertToTreeNode(nodes)

    const { payload: manufacturersData } = await manufacturerService.getListName()

    return (
        <div>
            <ProductAddForm categories={treeNodes} manufacturers={manufacturersData} />
        </div>
    )
}
