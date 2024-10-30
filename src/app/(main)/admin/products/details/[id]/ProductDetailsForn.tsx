'use client'
import { ProductResponseDetails } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import AttributeValueService from '@/service/AttributeValueService'
import PictureService from '@/service/PictureService'
import ProductService from '@/service/ProducrService'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { PrimeIcons } from 'primereact/api'
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
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
    const router = useRouter()

    const fileInputRef = useRef<HTMLInputElement>(null)
    const toast = useRef<Toast>(null)
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>(
        product.attributes.map((attr) => ({
            selectedAttribute: { id: attr.id, name: attr.name },
            selectedValues: attr.value
        }))
    )
    const [errors, setErrors] = useState({
        sku: '',
        name: '',
        price: '',
        quantity: '',
        productCost: '',
        attributes: ''
    })

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        field: keyof ProductResponseDetails
    ) => {
        setFormData({ ...formData, [field]: e.target.value })
    }
    const validateFields = () => {
        const newErrors = { sku: '', name: '', price: '', quantity: '', productCost: '', attributes: '' }
        let isValid = true

        if (!formData.sku.trim()) {
            newErrors.sku = 'SKU is required'
            isValid = false
        }
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required'
            isValid = false
        }
        if (!formData.price || isNaN(Number(formData.price)) || formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0'
            isValid = false
        }
        if (!formData.quantity || isNaN(Number(formData.quantity)) || formData.quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0'
            isValid = false
        }
        if (!formData.productCost || isNaN(Number(formData.productCost)) || formData.productCost <= 0) {
            newErrors.productCost = 'Product cost must be greater than 0'
            isValid = false
        }

        const missingAttributes = attributeRows.filter((row) => {
            return row.selectedAttribute && !row.selectedValues
        })
        if (missingAttributes.length > 0) {
            newErrors.attributes = 'Please select all attributes for each combination'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSave = async () => {
        const isValid = validateFields()
        if (Object.keys(isValid).length > 0) {
            return
        }
        if (!isValid) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill in all required fields',
                life: 3000
            })
            return
        }
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
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Product updated successfully!',
                life: 3000
            })
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

            if (!Array.isArray(payload)) return []

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
                                className={errors.price ? 'p-invalid' : ''}
                                currency='USD'
                            />
                            {(errors.price && <small className='p-error'>{errors.price}</small>)}
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
                                className={errors.productCost ? 'p-invalid' : ''}
                                currency='USD'
                            />
                            {(errors.productCost && <small className='p-error'>{errors.productCost}</small>)}
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
                                className={errors.quantity ? 'p-invalid' : ''}
                            />
                            {(errors.quantity && <small className='p-error'>{errors.quantity}</small>)}
                        </div>
                        <div className='flex flex-col items-center gap-4 w-full'>
                            <Tooltip target='.image' />

                            <Image
                                width={100}
                                height={100}
                                className='object-cover rounded-lg shadow-lg border border-gray-200 mb-2 image'
                                src={imageUrl}
                                data-pr-tooltip='Product Image'
                                alt='Product'
                            />
                            <Tooltip target='.upload' />
                            <label
                                data-pr-tooltip='Upload Image'
                                className='flex flex-col items-center justify-center cursor-pointer upload'
                            >
                                <input
                                    onChange={handleImageUpload}
                                    type='file'
                                    ref={fileInputRef}
                                    className='absolute inset-0 opacity-0 cursor-pointer '
                                />
                                <span className='flex items-center justify-center p-4 bg-violet-50 rounded-lg text-gray-600'>
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
                            <div key={index} className='mb-4 flex items-center justify-between'>
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
                                    className='w-[200px] mr-4'
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
                                    className='pi pi-trash bg-gray-500 text-xs ml-4'
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
