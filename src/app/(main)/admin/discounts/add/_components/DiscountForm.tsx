'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { DataTable, DataTableRowEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import ProductService from '@/service/ProducrService'
import { Image } from 'primereact/image'
import { InputNumber } from 'primereact/inputnumber'
import { Checkbox } from 'primereact/checkbox'
import { InputTextarea } from 'primereact/inputtextarea'
import discountService from '@/service/discount.service'

const DiscountForm = () => {
    const toast = useRef<Toast>(null)
    const [discountName, setDiscountName] = useState<string>('')
    const [value, setValue] = useState<number | null>(null)
    const [fromDate, setFromDate] = useState<Date | null>(null)
    const [toDate, setToDate] = useState<Date | null>(null)
    const [selectedProducts, setSelectedProducts] = useState<ProductResponse[]>([])
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [fetchedProducts, setFetchedProducts] = useState<ProductResponseDetails[]>([])
    const [selectedFetchedProducts, setSelectedFetchedProducts] = useState<ProductResponseDetails[]>([])
    const [checked, setChecked] = useState<boolean>(false)
    const [discountTypeId] = useState<number>(1)
    const [usePercentage] = useState<boolean>(true)
    const [comments, setComments] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [errors, setErrors] = useState<{
        discountName: string | null
        value: string | null
        fromDate: string | null
        toDate: string | null
        dateError: string | null
        productError: string | null
    }>({
        discountName: null,
        value: null,
        fromDate: null,
        toDate: null,
        dateError: null,
        productError: null
    })
    const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const showSuccessToast = () => {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Discount created successfully!' })
    }
    const showFailedToast = (errorMessage: string) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage || 'Failed to create discount',
        })
    }


    const handleCreateDiscount = () => {
        if (!validateForm()) {
            showFailedToast('Form validation failed. Please correct the fields.');
            return;
        }

        const discountPayload = {
            isActive: checked,
            name: discountName,
            comment: comments,
            discountTypeId: discountTypeId,
            usePercentage: true,
            discountPercentage: usePercentage ? (value !== null ? value : undefined) : undefined,
            startDateUtc: fromDate?.toISOString(),
            endDateUtc: toDate?.toISOString(),
            selectedProductVariantIds: selectedFetchedProducts.map((product) => product.id)
        }

        discountService
            .createDiscount(discountPayload)
            .then(() => {
                showSuccessToast()
                setDiscountName('')
                setValue(null)
                setFromDate(null)
                setToDate(null)
                setSelectedProducts([])
                setSelectedFetchedProducts([])
                setChecked(false)
                setComments('')
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    const backendMessage = error.response.data.message
                    if (backendMessage && backendMessage.includes('Discount with this name already exists')) {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            discountName: 'This discount name is already in use.'
                        }))
                    } else {
                        showFailedToast(backendMessage || 'An error occurred.')
                    }
                } else {
                    showFailedToast('An unexpected error occurred.')
                }
            })
    }


    const validateForm = () => {
        let isValid = true
        const newErrors: {
            discountName: string | null
            value: string | null
            fromDate: string | null
            toDate: string | null
            dateError: string | null
            productError: string | null
        } = {
            discountName: null,
            value: null,
            fromDate: null,
            toDate: null,
            dateError: null,
            productError: null
        }

        if (!discountName.trim()) {
            newErrors.discountName = 'Discount name is required.'
            isValid = false
        }

        if (value === null || isNaN(value) || value <= 0) {
            newErrors.value = 'Please enter a valid positive discount value.'
            isValid = false
        } else if (value > 50) {
            newErrors.value = 'You cannot set a discount higher than 50%.'
            isValid = false
        }

        if (!fromDate) {
            newErrors.fromDate = 'From date is required.'
            isValid = false
        } else if (isNaN(fromDate.getTime())) {
            newErrors.fromDate = 'Invalid from date.'
            isValid = false
        }

        if (!toDate) {
            newErrors.toDate = 'To Date is required.'
            isValid = false
        } else if (isNaN(toDate.getTime())) {
            newErrors.toDate = 'Invalid To Date.'
            isValid = false
        }

        if (fromDate && toDate) {
            const durationInMs = toDate.getTime() - fromDate.getTime()
            const durationInHours = durationInMs / (1000 * 60 * 60)
            const durationInDays = durationInMs / (1000 * 60 * 60 * 24)

            if (durationInDays > 180) {
                newErrors.dateError = 'The duration of the program must not exceed 180 days.'
                isValid = false
            } else if (fromDate > toDate) {
                newErrors.dateError = 'The start date cannot be after the end date.'
                isValid = false
            } else if (durationInHours < 1) {
                newErrors.dateError = 'The program duration must be at least 1 hour.'
                isValid = false
            }
        }

        if (selectedFetchedProducts.length === 0) {
            newErrors.productError = 'At least one product must be selected.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e: any) => {
        setChecked(e.checked || false)
    }

    const handleRowSelect = (event: DataTableRowEvent) => {
        const selectedProductId = event.data.id
        console.log('Selected Product Variant ID:', selectedProductId)
    }

    const onProductSelectionChange = async (e: any) => {
        const newSelectedProducts = e.value as ProductResponse[]
        setSelectedProducts(newSelectedProducts)

        const selectedIds = newSelectedProducts.map((product) => product.id)
        if (selectedIds.length > 0) {
            try {
                const productsByParentIds = await ProductService.getProductsByParentIds(selectedIds)
                setFetchedProducts(productsByParentIds)
            } catch (error) {
                console.error('Error fetching products by parent IDs:', error)
            }
        } else {
            setFetchedProducts([])
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            const productData = await ProductService.getAllProducts()
            setProducts(productData)
        }
        fetchProducts()
    }, [])

    const onFetchedProductsSelectionChange = (e: any) => {
        setSelectedFetchedProducts(e.value as ProductResponseDetails[])
        console.log(
            'Selected Variant IDs:',
            e.value.map((product: ProductResponseDetails) => product.id)
        )
    }

    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='p-fluid grid'>
                <div className='col-12 md:col-6'>
                    <h3>Create Discount</h3>

                    <div className='field'>
                        <label htmlFor='discountName'>Discount Name</label>
                        <InputText
                            id='discountName'
                            value={discountName}
                            onChange={(e) => setDiscountName(e.target.value)}
                            required
                        />
                        {errors.discountName && <small className='p-error'>{errors.discountName}</small>}
                    </div>

                    <div className='field'>
                        <label htmlFor='value'>Value</label>
                        <InputNumber
                            inputId='value'
                            value={value}
                            showButtons
                            mode='decimal'
                            onValueChange={(e) => setValue(e.value !== undefined ? e.value : null)}
                            suffix='%'
                            min={1}
                            max={50}
                            required
                        />
                        {errors.value && <small className='p-error'>{errors.value}</small>}
                    </div>

                    <div>
                        <div className='field'>
                            <label htmlFor='fromDate'>From Date</label>
                            <Calendar
                                id='fromDate'
                                value={fromDate}
                                showIcon
                                onChange={(e) => {
                                    const selectedDate = e.value as Date | null
                                    setFromDate(selectedDate)
                                }}
                                showTime
                                hourFormat='12'
                                touchUI
                                dateFormat='dd/mm/yy'
                                showButtonBar
                                required
                            />
                            {errors.fromDate && <small className='p-error'>{errors.fromDate}</small>}
                        </div>

                        <div className='field'>
                            <label htmlFor='toDate'>To Date</label>
                            <Calendar
                                id='toDate'
                                value={toDate}
                                onChange={(e) => {
                                    const selectedDate = e.value as Date | null
                                    setToDate(selectedDate)
                                }}
                                showTime
                                touchUI
                                showIcon
                                dateFormat='dd/mm/yy'
                                showButtonBar
                                required
                                hourFormat='12'
                            />
                            {errors.toDate && <small className='p-error'>{errors.toDate}</small>}
                            {errors.dateError && <small className='p-error'>{errors.dateError}</small>}
                        </div>
                    </div>
                    <div className='flex justify-start gap-2 items-center space-x-2'>
                        <label htmlFor='active' className='flex items-center justify-center'>
                            <p>Active</p>
                        </label>
                        <Checkbox
                            onChange={handleChange}
                            checked={checked}
                            className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                        />
                    </div>
                    <div className='flex justify-center gap-2 items-center space-x-2 my-3'>
                        <InputTextarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder='Comments'
                            rows={5}
                            cols={30}
                        />
                    </div>
                    <Button
                        className='mt-4'
                        label='Create Discount'
                        icon='pi pi-check'
                        onClick={handleCreateDiscount}
                    />
                </div>

                <div className='col-12 md:col-6'>
                    <h4>Select Products</h4>
                    <div className='field'>
                        <InputText
                            id='productSearch'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Search by name'
                        />
                    </div>
                    {products.length === 0 ? (
                        <div className='card flex justify-content-center'>
                            <Image
                                src='http://res.cloudinary.com/dccuxj8ll/image/upload/v1730563551/PRODUCTS/w2kr72d76emyc9ftgnn9.png'
                                alt='Image'
                                width='250'
                            />
                        </div>
                    ) : (
                        <DataTable
                            value={filteredProducts}
                            paginator
                            rows={9}
                            dataKey='id'
                            selection={selectedProducts}
                            onSelectionChange={onProductSelectionChange}
                            selectionMode='checkbox'
                        >
                            <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                            <Column field='id' header='STT' />
                            <Column field='name' header='Product Name' sortable />
                        </DataTable>
                    )}
                </div>
            </div>
            <div className='col-12'>
                <h4 className='text-lg font-semibold mb-4'>Product variations</h4>
                {errors.productError && <small className='p-error'>{errors.productError}</small>}
                {fetchedProducts.length === 0 ? (
                    <div className='card flex justify-content-center'>
                        <Image
                            src='http://res.cloudinary.com/dccuxj8ll/image/upload/v1730558259/PRODUCTS/x8cxrp84efnxyt0izxnv.jpg'
                            alt='Image'
                            width='300'
                        />
                    </div>
                ) : (
                    <DataTable
                        value={fetchedProducts}
                        paginator
                        rows={10}
                        selection={selectedFetchedProducts}
                        onSelectionChange={onFetchedProductsSelectionChange}
                        onRowSelect={handleRowSelect}
                        selectionMode='checkbox'
                    >
                        <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                        <Column field='name' header='Product Name' sortable/>
                        <Column
                            field='imageUrl'
                            header='Image'
                            body={(rowData) => (
                                <Image
                                    src={rowData.imageUrl}
                                    alt={rowData.name}
                                    width='100px'
                                    height='100px'
                                    className='object-cover'
                                    preview
                                />
                            )}
                        />
                        <Column sortable field='categoryName' header='Category Name' />
                        <Column sortable field='manufacturerName' header='Manufacturer Name' />
                        <Column sortable field='sku' header='SKU' />
                    </DataTable>
                )}
            </div>
        </div>
    )
}

export default DiscountForm
