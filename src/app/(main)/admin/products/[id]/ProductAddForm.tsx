/* eslint-disable jsx-a11y/alt-text */
'use client'
import { Category } from '@/interface/category.interface'
import { ManufacturerName } from '@/interface/manufacturer.interface'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Editor } from 'primereact/editor'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import React, { useEffect, useRef, useState } from 'react'

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

    const router = useRouter()
    useEffect(() => {
        if (product) {
            setName(product.name)
            setWeight(product.weight || 0)
            setSelectedCategory(categories.find((c) => c.id === product.categoryId) || null)
            setSelectedManufacture(manufacturers.find((m) => m.id === product.manufacturerId) || null)
            setText(product.description || '')
        }
    }, [product, categories, manufacturers])

    const handleSave = async () => {
        if (!name || !selectedCategory || !selectedManufacture) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill all required fields: Name, Category, and Manufacturer.',
                life: 3000
            })
            return
        }
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
                            onChange={(e) => setWeight(e.value || 0)}
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

                <DataTable
                    value={products}
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
                            <img
                                src={
                                    rowData.imageUrl ||
                                    'https://bizweb.dktcdn.net/thumb/1024x1024/100/415/445/products/370031-black-1.jpg'
                                }
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                        )}
                    />
                    <Column
                        header='Action'
                        body={(rowData) => (
                            <Button onClick={() => router.push(`/admin/products/details/${rowData.id}`)}>Edit</Button>
                        )}
                    ></Column>
                </DataTable>

                <Button label='Save' onClick={handleSave} />
            </div>
        </div>
    )
}

export default ProductAddForm
