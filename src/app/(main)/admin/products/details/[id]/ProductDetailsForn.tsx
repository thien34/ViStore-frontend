'use client'
import { ProductResponseDetails } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { PrimeIcons } from 'primereact/api'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import React, { useState } from 'react'

type AttributeRow = {
    selectedAttribute: ProductAttributeName | null
    selectedValues: string[] // Hoặc kiểu dữ liệu khác tùy thuộc vào giá trị bạn muốn lưu
}

type Props = {
    product: ProductResponseDetails
    productAttributes: ProductAttributeName[]
}

const ProductDetailsForm: React.FC<Props> = ({ product, productAttributes }) => {
    const [formData, setFormData] = useState<ProductResponseDetails>(product)
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>(
        product.attributes.map((attr) => ({
            selectedAttribute: attr,
            selectedValues: []
        }))
    )

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof ProductResponseDetails
    ) => {
        setFormData({ ...formData, [field]: e.target.value })
    }

    const handleSave = () => {
        const productData = { ...formData, attributes: attributeRows }
        console.log('Saved product:', productData)
        // Xử lý lưu thông tin sản phẩm ở đây
    }

    const addAttributeRow = () => {
        setAttributeRows([...attributeRows, { selectedAttribute: null, selectedValues: [] }])
    }

    const removeAttributeRow = (index: number) => {
        setAttributeRows((prevRows) => prevRows.filter((_, i) => i !== index))
    }
    console.log(product.attributes)
    return (
        <div className='card'>
            <h5>Edit Product Details</h5>
            <div className='flex flex-column gap-4'>
                <div className='p-grid p-fluid'>
                    <div className='flex flex-row gap-4'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='sku' className='mb-2'>
                                SKU
                            </label>
                            <InputText id='sku' value={formData.sku} onChange={(e) => handleChange(e, 'sku')} />
                        </div>

                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='name' className='mb-2'>
                                Product Name
                            </label>
                            <InputText id='name' value={formData.name} onChange={(e) => handleChange(e, 'name')} />
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='price' className='mb-2'>
                                Price
                            </label>
                            <InputNumber
                                id='price'
                                value={formData.price}
                                onValueChange={(e) => {
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'price' as keyof ProductResponseDetails
                                    )
                                }}
                                mode='currency'
                                currency='USD'
                            />
                        </div>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='productCost' className='mb-2'>
                                Product Cost
                            </label>
                            <InputNumber
                                id='productCost'
                                value={formData.productCost}
                                onValueChange={(e) => {
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'productCost' as keyof ProductResponseDetails
                                    )
                                }}
                                mode='currency'
                                currency='USD'
                            />
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='quantity' className='mb-2'>
                                Quantity
                            </label>
                            <InputNumber
                                id='quantity'
                                value={formData.quantity}
                                onValueChange={(e) =>
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'quantity' as keyof ProductResponseDetails
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
                <Accordion className='mt-5'>
                    <AccordionTab header='Attributes'>
                        {product.attributes.map((row, index) => (
                            <div key={index} className='mb-4 flex items-center'>
                                <Dropdown
                                    value={}
                                    options={productAttributes}
                                    optionLabel='name'
                                    placeholder='Select an attribute'
                                    className='w-[200px] mr-4'
                                    style={{ minWidth: '200px', width: '200px', maxWidth: '200px' }}
                                />

                                {/* <AutoComplete value={row.name} placeholder='Enter values' multiple className='w-full' /> */}
                                <Button
                                    onClick={() => removeAttributeRow(index)}
                                    className='pi pi-trash bg-gray-500 text-xs'
                                />
                            </div>
                        ))}
                        <Button onClick={addAttributeRow} className='flex items-center mb-5'>
                            <i className={PrimeIcons.PLUS}></i>
                            <span className='ml-2'>Add attribute</span>
                        </Button>
                    </AccordionTab>
                </Accordion>
                <Button label='Save' onClick={handleSave} />
            </div>
        </div>
    )
}

export default ProductDetailsForm
