'use client'
import { Category } from '@/interface/Category'
import { ManufacturerNameResponse } from '@/interface/Manufacture'
import { ProductResponse } from '@/interface/Product'
import { Attribute } from '@/interface/ProductAttribute'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Editor } from 'primereact/editor'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import React, { useEffect, useState } from 'react'

interface ProductAddFormProps {
    categories: Category[]
    manufacturers: ManufacturerNameResponse[]
    productAttributes: Attribute[]
    product: ProductResponse
}

interface Product {
    id: string
    code: string
    name: string
    description: string
    image: string
    price: number
    category: string
    quantity: number
    inventoryStatus: string
    rating: number
}
const ProductAddForm: React.FC<ProductAddFormProps> = ({ categories, manufacturers, product }) => {
    const [name, setName] = useState<string>('')
    const [weight, setWeight] = useState<number>(0)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [selectedManufacture, setSelectedManufacture] = useState<ManufacturerNameResponse | null>(null)
    const [text, setText] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [products, setProducts] = useState<Product[]>([
        {
            id: '1000',
            code: 'f230fh0g3',
            name: 'Bamboo Watch',
            description: 'Product Description',
            image: 'bamboo-watch.jpg',
            price: 65,
            category: 'Accessories',
            quantity: 24,
            inventoryStatus: 'INSTOCK',
            rating: 5
        }
    ])

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
        // Logic lưu sản phẩm
    }

    return (
        <div className='card'>
            <div className='flex flex-column gap-4'>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='productName'>Product Name</label>
                        <InputText id='productName' value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter product name' />
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='weight'>Weight</label>
                        <InputNumber inputId='weight' value={weight} onChange={(e) => setWeight(e.value || 0)} placeholder='Enter weight' mode='decimal' showButtons min={0} suffix='g' />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='category'>Categories</label>
                        <Dropdown value={selectedCategory} onChange={(e) => setSelectedCategory(e.value)} options={categories} placeholder='Select a category' optionLabel='name' />
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='brand'>Manufactures</label>
                        <Dropdown value={selectedManufacture} onChange={(e) => setSelectedManufacture(e.value)} options={manufacturers} placeholder='Select a manufacture' optionLabel='manufacturerName' />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <Editor value={text} onTextChange={(e) => setText(e.htmlValue || '')} style={{ height: '100px', width: '100%' }} placeholder='Enter product description' />
                    </div>
                </div>

                {errorMessage && <small className='p-error'>{errorMessage}</small>}

                <DataTable value={products} tableStyle={{ minWidth: '50rem' }}>
                    <Column field='code' header='Code'></Column>
                    <Column field='name' header='Name'></Column>
                    <Column field='category' header='Category'></Column>
                    <Column field='quantity' header='Quantity'></Column>
                </DataTable>
                <div className=''>
                    <Button label='Save' onClick={handleSave} />
                </div>
            </div>
        </div>
    )
}

export default ProductAddForm
