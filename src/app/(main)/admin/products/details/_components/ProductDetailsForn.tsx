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
import { Toast } from 'primereact/toast'
import { Tooltip } from 'primereact/tooltip'
import { useEffect, useRef, useState } from 'react'
import { Promotion } from '@/interface/discount.interface'
import { Message } from 'primereact/message'
import QRCode from 'react-qr-code'
import Image from 'next/image'

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
    const [discount, setDiscount] = useState(null)
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

        if (filteredAttributes.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please add at least one attribute',
                life: 3000
            })
            return
        }

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
    useEffect(() => {
        const fetchDiscounts = async (productId: number) => {
            try {
                const response = await fetch(`http://localhost:8080/api/admin/discounts/by-product/${productId}`)
                const data = await response.json()

                const activeDiscounts = data.data.filter((discount: Promotion) => discount.status === 'ACTIVE')
                if (activeDiscounts.length > 0) {
                    const sortedDiscounts = activeDiscounts.sort(
                        (a: Promotion, b: Promotion) => (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0)
                    )
                    setDiscount(sortedDiscounts[0]) // Set the highest discount
                }
            } catch (error) {
                console.error('Error fetching discounts: ', error)
            }
        }

        if (product.id) {
            fetchDiscounts(product.id)
        }
    }, [product])

    const fetchValues = async (attribuetId: number) => {
        try {
            const { payload } = await AttributeValueService.getAttributeValues(product.id, attribuetId)

            if (!Array.isArray(payload)) return []

            const uniqueNames = Array.from(new Set(payload.map((value) => value.name)))

            return uniqueNames
        } catch (error) {
            console.error('Error fetching attribute values:', error)
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
            <Toast ref={toast} />
            <h4>Edit Product Details</h4>
            <div className='flex flex-column gap-4'>
                {discount && (
                    <div className='mb-3'>
                        <Message
                            style={{
                                border: 'solid #f39c12',
                                borderWidth: '0 0 0 6px',
                                color: '#f39c12'
                            }}
                            className='border-warning w-full justify-content-start'
                            severity='warn'
                            content={
                                <div className='flex align-items-center'>
                                    <i
                                        className='pi pi-exclamation-triangle'
                                        style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}
                                    ></i>
                                    <div>
                                        Warning: This product is currently on discount and cannot be edited price until
                                        the discount ends.
                                    </div>
                                </div>
                            }
                        />
                    </div>
                )}
                <div className='p-grid p-fluid'>
                    <div className='flex flex-row gap-4'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='sku'>
                                SKU <i className='pi pi-exclamation-circle p-error' style={{ fontSize: '1rem' }}></i>
                            </label>
                            <InputText
                                tooltip='Enter the SKU for the product'
                                id='sku'
                                tooltipOptions={{ position: 'bottom' }}
                                className={errors.sku ? 'p-invalid' : ''}
                                value={formData.sku}
                                onChange={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setErrors({ ...errors, sku: 'SKU is required' })
                                    } else {
                                        setErrors({ ...errors, sku: '' })
                                    }
                                    handleChange(e, 'sku')
                                }}
                            />
                            {errors.sku && <small className='p-error'>{errors.sku}</small>}
                        </div>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='name'>
                                Product Name{' '}
                                <i className='pi pi-exclamation-circle p-error' style={{ fontSize: '1rem' }}></i>
                            </label>

                            <InputText
                                id='name'
                                tooltipOptions={{ position: 'bottom' }}
                                disabled
                                value={formData.name}
                                onChange={(e) => {
                                    if (e.target.value.trim() === '') {
                                        setErrors({ ...errors, name: 'Product name is required' })
                                    } else {
                                        setErrors({ ...errors, name: '' })
                                    }
                                    handleChange(e, 'name')
                                }}
                                className={errors.name ? 'p-invalid' : ''}
                            />
                            {errors.name && <small className='p-error'>{errors.name}</small>}
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='price'>
                                Price <i className='pi pi-exclamation-circle p-error' style={{ fontSize: '1rem' }}></i>
                            </label>
                            <InputNumber
                                tooltip='Enter product price'
                                id='price'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.price}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 0) {
                                        setErrors({ ...errors, price: 'Price must be greater than 0' })
                                    } else {
                                        setErrors({ ...errors, price: '' })
                                    }
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'price' as keyof ProductResponseDetails
                                    )
                                }}
                                mode='currency'
                                disabled={!!discount}
                                className={discount ? 'p-disabled' : ''}
                                currency='USD'
                            />
                            {errors.price && <small className='p-error'>{errors.price}</small>}
                        </div>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='productCost' className='mb-2'>
                                Product Cost{' '}
                                <i className='pi pi-exclamation-circle p-error' style={{ fontSize: '1rem' }}></i>
                            </label>
                            <InputNumber
                                tooltip='Enter the cost of the product'
                                id='productCost'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.productCost}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 0) {
                                        setErrors({ ...errors, productCost: 'Product cost must be greater than 0' })
                                    } else {
                                        setErrors({ ...errors, productCost: '' })
                                    }
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
                            {errors.productCost && <small className='p-error'>{errors.productCost}</small>}
                        </div>
                    </div>
                    <div className='flex flex-row gap-4 mt-2'>
                        <div className='flex flex-column gap-2 w-full'>
                            <label htmlFor='quantity'>
                                Quantity{' '}
                                <i className='pi pi-exclamation-circle p-error' style={{ fontSize: '1rem' }}></i>
                            </label>
                            <InputNumber
                                tooltip='Enter the quantity of the product'
                                id='quantity'
                                tooltipOptions={{ position: 'bottom' }}
                                value={formData.quantity}
                                onValueChange={(e) => {
                                    if (e.value && e.value <= 0) {
                                        setErrors({ ...errors, quantity: 'Quantity must be greater than 0' })
                                    } else {
                                        setErrors({ ...errors, quantity: '' })
                                    }
                                    handleChange(
                                        {
                                            target: { value: e.value ? e.value.toString() : '' }
                                        } as React.ChangeEvent<HTMLInputElement>,
                                        'quantity' as keyof ProductResponseDetails
                                    )
                                }}
                                className={errors.quantity ? 'p-invalid' : ''}
                            />
                            {errors.quantity && <small className='p-error'>{errors.quantity}</small>}
                        </div>
                        <div className='grid grid-cols-1 p-2 items-center gap-6 w-full'>
                            <Tooltip target='.image' />

                            <Image
                                width={100}
                                height={100}
                                className='object-cover rounded-lg shadow-lg border border-gray-200 mb-2 image ms-20'
                                src={imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
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
                            <span className='gtin' data-pr-tooltip='QR Code'>
                                <QRCode
                                    size={200}
                                    style={{ height: 'auto', width: '120px' }}
                                    value={product.gtin}
                                    className='p-2'
                                    viewBox={`0 0 256 256`}
                                />
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
