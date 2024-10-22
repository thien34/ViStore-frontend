'use client'
import { ProductResponseDetails } from '@/interface/Product'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import React, { useState } from 'react'

type Props = {
    product: ProductResponseDetails
}

const ProductDetailsForm: React.FC<Props> = ({ product }) => {
    const [formData, setFormData] = useState<ProductResponseDetails>(product)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof ProductResponseDetails
    ) => {
        setFormData({ ...formData, [field]: e.target.value })
    }

    const handleSave = () => {
        // Xử lý lưu thông tin sản phẩm ở đây
        console.log('Saved product:', formData)
    }

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
                            <label htmlFor='price' className='mb-2'>
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
                                        'price' as keyof ProductResponseDetails
                                    )
                                }}
                                mode='currency'
                                currency='USD'
                            />
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='quantity' className='mb-'>
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
                        {/* publist */}
                        <div className='flex flex-column gap-2 w-full'></div>
                    </div>
                </div>
                {/* edit atb ở đây nhé!! */}

                {/* end */}
                <Button label='Save' onClick={handleSave} />
            </div>
        </div>
    )
}

export default ProductDetailsForm
