/* eslint-disable jsx-a11y/alt-text */
'use client'
import { Category } from '@/interface/category.interface'
import { ManufacturerName } from '@/interface/manufacturer.interface'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Editor } from 'primereact/editor'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Image } from 'primereact/image'
import ProductService from '@/service/ProducrService'
interface ProductAddFormProps {
    categories: Category[]
    manufacturers: ManufacturerName[]
    productAttributes: ProductAttributeName[]
    product: ProductResponse
    products: ProductResponseDetails[]
}

const ProductAddForm: React.FC<ProductAddFormProps> = ({ categories, manufacturers, product, products }) => {
    const [name, setName] = useState<string>('')
    const [weight, setWeight] = useState<number>(0)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectedManufacture, setSelectedManufacture] = useState<ManufacturerName | null>(null)
    const [text, setText] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const toast = useRef<Toast>(null)
    const [productsData, setProductsData] = useState<ProductResponseDetails[]>(products)
    const [, setErrors] = useState({
        name: false,
        selectedCategory: false,
        selectedManufacture: false,
        weight: false
    })

    useEffect(() => {
        setErrorMessage('')
        if (product) {
            setName(product.name)
            setWeight(product.weight || 0)
            setSelectedCategory(categories.find((c) => c.id === product.categoryId) || null)
            setSelectedManufacture(manufacturers.find((m) => m.id === product.manufacturerId) || null)
            setText(product.description || '')
        }
    }, [product, categories, manufacturers])

    const handleSave = async () => {
        let hasError = false
        const newErrors = {
            name: false,
            selectedCategory: false,
            selectedManufacture: false,
            weight: false
        }

        if (!name) {
            newErrors.name = true
            hasError = true
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Name is required.',
                life: 3000
            })
        }

        if (!selectedCategory) {
            newErrors.selectedCategory = true
            hasError = true
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Category is required.',
                life: 3000
            })
        }

        if (!selectedManufacture) {
            newErrors.selectedManufacture = true
            hasError = true
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Manufacturer is required.',
                life: 3000
            })
        }

        if (!weight) {
            newErrors.weight = true
            hasError = true
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Weight is required.',
                life: 3000
            })
        }

        setErrors(newErrors)

        if (hasError) return

        await ProductService.updateProductParent(
            { name, weight, categoryId: selectedCategory?.id || 0, manufacturerId: selectedManufacture?.id || 0 },
            product.id
        ).then(() => {
            ProductService.getProductsByParentId(+product.id).then((res) => {
                setProductsData(res)
            })
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Product updated successfully',
                life: 3000
            })
        })
    }

    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='flex flex-column gap-4'>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='productName'>Product Name</label>
                        <InputText
                            tooltip='Enter the name of the product'
                            tooltipOptions={{ position: 'bottom' }}
                            id='productName'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Enter product name'
                        />
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='weight'>Weight</label>
                        <InputNumber
                            inputId='weight'
                            value={weight}
                            onValueChange={(e) => setWeight(e.value || 0)}
                            placeholder='Enter weight'
                            mode='decimal'
                            showButtons
                            min={0}
                            suffix='g'
                            tooltip='Enter the weight of the product in grams'
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='category'>Categories</label>
                        <Dropdown
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.value)}
                            options={categories}
                            placeholder='Select a category'
                            optionLabel='name'
                            tooltip='Select the category for the product'
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='brand'>Manufactures</label>
                        <Dropdown
                            value={selectedManufacture}
                            onChange={(e) => setSelectedManufacture(e.value)}
                            options={manufacturers}
                            placeholder='Select a manufacture'
                            optionLabel='manufacturerName'
                            tooltip='Select the manufacturer of the product'
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='brand'>Description</label>

                        <Editor
                            value={text}
                            onTextChange={(e) => setText(e.htmlValue || '')}
                            style={{ height: '100px', width: '100%' }}
                            placeholder='Enter product description'
                        />
                    </div>
                </div>

                {errorMessage && <small className='p-error'>{errorMessage}</small>}

                <div>
                    <Link href={`/admin/products/product-add/${product.id}`}>
                        <Button label='Add Product Details' className='float-right' />
                    </Link>
                </div>
                <DataTable
                    value={productsData}
                    tableStyle={{ minWidth: '50rem' }}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                    currentPageReportTemplate='{first} to {last} of {totalRecords}'
                >
                    <Column
                        field=''
                        header='STT'
                        body={(rowData, options: { rowIndex: number }) => options.rowIndex + 1}
                    ></Column>
                    <Column field='sku' header='SKU'></Column>
                    <Column field='name' header='Name'></Column>
                    <Column field='quantity' header='Quantity'></Column>
                    <Column field='price' header='Price'></Column>
                    <Column
                        header='Image'
                        body={(rowData) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <Image
                                src={rowData.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                                width='50'
                                height='50'
                            />
                        )}
                    />
                    <Column
                        header='Action'
                        body={(rowData) => (
                            <Link href={`/admin/products/details/${rowData.id}`}>
                                <Button>Edit</Button>
                            </Link>
                        )}
                    ></Column>
                </DataTable>

                <Button label='Save' onClick={handleSave} />
            </div>
        </div>
    )
}

export default ProductAddForm
