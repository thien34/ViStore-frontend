import ListView from './_components/ListView'
import { CategoryName } from '@/interface/category.interface'
import categoryService from '@/service/category.service'
import { TreeNode } from 'primereact/treenode'

const CategoryPage = async () => {
    const { payload: data } = await categoryService.getAll()
    const { payload: nodes } = await categoryService.getListName()

    const convertToTreeNode = (categories: CategoryName[]): TreeNode[] => {
        return categories.map((category) => ({
            key: category.id.toString(),
            label: category.name,
            children: convertToTreeNode(category.children ? category.children : [])
        }))
    }

    return (
        <>
            <ListView data={data.items} nodes={convertToTreeNode(nodes)} />
        </>
    )
}

export default CategoryPage
