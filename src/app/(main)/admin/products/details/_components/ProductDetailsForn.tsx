'use client'
import { ProductResponseDetails } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import AttributeValueService from '@/service/AttributeValueService'
import PictureService from '@/service/PictureService'
import ProductService from '@/service/ProducrService'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { PrimeIcons } from 'primereact/api'
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Tooltip } from 'primereact/tooltip'
import React, { useRef, useState } from 'react'
import Barcode from 'react-barcode'

type AttributeRow = {
    selectedAttribute: ProductAttributeName | null
    selectedValues: string | undefined
}

type Props = {
    product: ProductResponseDetails
    productAttributes: ProductAttributeName[]
}

const ProductDetailsForm: React.FC<Props> = ({ product, productAttributes }) => {
    const [formData, setFormData] = useState<ProductResponseDetails>(product)
    const [imageUrl, setImageUrl] = useState<string>(product.imageUrl)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>(
        product.attributes.map((attr) => ({
            selectedAttribute: { id: attr.id, name: attr.name },
            selectedValues: attr.value
        }))
    )

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof ProductResponseDetails
    ) => {
        setFormData({ ...formData, [field]: e.target.value })
    }

    const handleSave = async () => {
        const filteredAttributes = attributeRows
            .filter((attr) => attr.selectedAttribute !== null)
            .map((attr) => ({
                attributeId: attr.selectedAttribute!.id,
                productId: formData.id,
                value: attr.selectedValues
            }))

        const productData = {
            id: formData.id,
            name: formData.name,
            deleted: formData.deleted,
            categoryId: formData.categoryId,
            manufacturerId: formData.manufacturerId,
            sku: formData.sku,
            unitPrice: formData.price,
            quantity: formData.quantity,
            productCost: formData.productCost,
            attributes: filteredAttributes,
            gtin: formData.gtin,
            imageUrl: product.imageUrl
        }

        if (uploadedFile) {
            const imageRes = await PictureService.savePicture(uploadedFile)
            productData.imageUrl = imageRes
        }

        try {
            await ProductService.updateProduct(formData.id, productData)
            console.log('Product updated successfully.')
        } catch (error) {
            console.error('Failed to update product:', error)
        }
    }

    const addAttributeRow = () => {
        setAttributeRows([...attributeRows, { selectedAttribute: null, selectedValues: '' }])
    }

    const removeAttributeRow = (index: number) => {
        setAttributeRows((prevRows) => prevRows.filter((_, i) => i !== index))
    }

    const fetchValues = async (attribuetId: number) => {
        try {
            const { payload } = await AttributeValueService.getAttributeValues(product.id, attribuetId)

            if (!Array.isArray(payload)) {
                return []
            }

            const uniqueNames = Array.from(new Set(payload.map((value) => value.name)))

            return uniqueNames
        } catch (error) {
            return []
        }
    }

    const getAvailableAttributes = () => {
        const selectedAttributeCodes = new Set(attributeRows.map((row) => row.selectedAttribute?.id).filter(Boolean))
        return productAttributes.filter((attr) => !selectedAttributeCodes.has(attr.id))
    }
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImageUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
            setUploadedFile(file)
        }
    }

    const [items, setItems] = useState<string[]>([])

    const search = async (event: AutoCompleteCompleteEvent, attribuetId: number) => {
        const fetchedValues = await fetchValues(attribuetId)
        setItems(fetchedValues.filter((item) => item.toLowerCase().includes(event.query.toLowerCase())))
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
                            <InputText
                                tooltip='Enter the SKU for the product'
                                id='sku'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.sku}
                                onChange={(e) => handleChange(e, 'sku')}
                            />
                        </div>

                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='name' className='mb-2'>
                                Product Name
                            </label>

                            <InputText
                                id='name'
                                tooltipOptions={{ position: 'bottom' }}
                                disabled
                                value={formData.name}
                                onChange={(e) => handleChange(e, 'name')}
                            />
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='price' className='mb-2'>
                                Price
                            </label>
                            <InputNumber
                                tooltip='Enter product price'
                                id='price'
                                tooltipOptions={{ position: 'bottom' }}
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
                                tooltip='Enter the cost of the product'
                                id='productCost'
                                tooltipOptions={{ position: 'bottom' }}
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
                                tooltip='Enter the quantity of the product'
                                id='quantity'
                                tooltipOptions={{ position: 'bottom' }}
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
                        <div className='grid grid-cols-1 items-center gap-4 w-full'>
                            <Tooltip target='.image' />

                            <img
                                style={{ width: '100px' }}
                                className='object-cover rounded-lg shadow-lg border border-gray-200 mb-2 image'
                                src={imageUrl}
                                data-pr-tooltip='Product Image'
                                alt='Product'
                            />

                            <Tooltip target='.upload' />
                            <label data-pr-tooltip='Upload Image' className='block cursor-pointer upload'>
                                <input onChange={handleImageUpload} type='file' ref={fileInputRef} className='hidden' />
                                <span
                                    className='flex items-center justify-center p-4 bg-violet-50 rounded-lg text-gray-600'
                                    style={{ pointerEvents: 'none' }}
                                >
                                    <i className='pi pi-image text-5xl mb-2'></i>
                                </span>
                            </label>

                            <Tooltip target='.gtin' />
                            <span className='gtin' data-pr-tooltip='Gtin'>
                                <Barcode value={product.gtin} />
                            </span>
                        </div>
                    </div>
                </div>
                <Accordion className='mt-5' activeIndex={0}>
                    <AccordionTab header='Attributes'>
                        {attributeRows.map((row, index) => (
                            <div key={index} className='mb-4 grid grid-cols-3 items-center gap-4'>
                                <Dropdown
                                    value={attributeRows[index].selectedAttribute}
                                    options={[
                                        ...getAvailableAttributes(),
                                        ...productAttributes.filter((attr) => attr.id === row.selectedAttribute?.id)
                                    ]}
                                    onChange={(e) => {
                                        const updatedRows = [...attributeRows]
                                        updatedRows[index].selectedAttribute = e.value
                                        setAttributeRows(updatedRows)
                                    }}
                                    optionLabel='name'
                                    placeholder='Select an attribute'
                                    className='w-[200px]'
                                    style={{ minWidth: '200px', width: '200px', maxWidth: '200px' }}
                                />
                                <AutoComplete
                                    value={attributeRows[index].selectedValues || ''}
                                    onChange={(e: AutoCompleteChangeEvent) => {
                                        const updatedRows = [...attributeRows]
                                        updatedRows[index].selectedValues = e.value
                                        setAttributeRows(updatedRows)
                                    }}
                                    placeholder='Enter values'
                                    className='w-52'
                                    suggestions={items}
                                    completeMethod={(event) => {
                                        const attribuetId = row.selectedAttribute?.id
                                        if (attribuetId !== undefined) {
                                            search(event, attribuetId)
                                        }
                                    }}
                                    dropdown
                                />
                                <Button
                                    tooltip='Delete'
                                    onClick={() => removeAttributeRow(index)}
                                    className='pi pi-trash bg-gray-500 h-[3rem]'
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
