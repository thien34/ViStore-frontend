import { Category, CategoryName, CategoryPagingResponse } from '@/interface/category.interface'
import http from '@/libs/http'

class CategoryService {
    private basePath = '/api/admin/categories'

    async getAll() {
        const response = await http.get<CategoryPagingResponse>(this.basePath)
        return response
    }

    async getListName() {
        const response = await http.get<CategoryName[]>(`${this.basePath}/list-name`)
        return response
    }

    async getById(id: number): Promise<Category> {
        const response = await http.get<Category>(`${this.basePath}/${id}`)
        return response.payload
    }

    async create(category: Omit<Category, 'id'>): Promise<Category> {
        const response = await http.post<Category>(`${this.basePath}`, category)
        return response.payload
    }

    async update(id: number, category: Omit<Category, 'id'>): Promise<Category> {
        const response = await http.put<Category>(`${this.basePath}/${id}`, category)
        return response.payload
    }

    async delete(id: number): Promise<void> {
        await http.delete<void>(`${this.basePath}/${id}`)
    }
}

const categoryService = new CategoryService()
export default categoryService
