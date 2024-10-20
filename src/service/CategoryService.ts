import { Category, CategoryNameResponse } from '@/interface/Category'

class CategoryService {
    static async getAllCategoryNames(): Promise<Category[]> {
        try {
            const response = await fetch('http://localhost:8080/api/admin/categories/list-name', { cache: 'no-store' })
            if (!response.ok) {
                throw new Error('Failed to fetch categories names')
            }
            const result = await response.json()
            return flattenCategories(result.data)
        } catch (error) {
            console.error('Error fetching category names:', error)
            return []
        }
    }
}

const flattenCategories = (categories: CategoryNameResponse[], parentId: number | null = null): Category[] => {
    const flatList: Category[] = []

    const addCategories = (cats: CategoryNameResponse[], parent: number | null) => {
        for (const cat of cats) {
            const { id, name, children } = cat
            flatList.push({ id, name, parentCategoryId: parent !== null ? parent : null })
            if (children && children.length > 0) {
                addCategories(children, id)
            }
        }
    }

    addCategories(categories, parentId)
    return flatList
}

export default CategoryService
