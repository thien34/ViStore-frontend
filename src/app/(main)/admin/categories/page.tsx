import ListView from './_components/ListView'
import categoryService from '@/service/category.service'

const CategoryPage = async () => {
    const { payload: data } = await categoryService.getAll()
    const { payload: nodes } = await categoryService.getListName()

    const treeNodes = categoryService.convertToTreeNode(nodes)

    return (
        <>
            <ListView initialData={data.items} initialNodes={treeNodes} />
        </>
    )
}

export default CategoryPage
