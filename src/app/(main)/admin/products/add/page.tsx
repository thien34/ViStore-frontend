import CategoryService from '@/service/CategoryService'
import ProductAddForm from './ProductForm'
import ManufacturerService from '@/service/ManufacturerService'
import ProductAttributeService from '@/service/ProductAttributeService'

export default async function ProductCreatePage() {
    const [categoriesData, manufacturersData, productAttributesData] = await Promise.all([CategoryService.getAllCategoryNames(), ManufacturerService.getAllManufacturerNames(), ProductAttributeService.getAllProductAttributeNames()])

    return (
        <div>
            <ProductAddForm categories={categoriesData} manufacturers={manufacturersData} productAttributes={productAttributesData} />
        </div>
    )
}
