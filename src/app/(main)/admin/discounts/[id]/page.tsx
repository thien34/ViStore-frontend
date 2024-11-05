'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import ProductService from '@/service/ProducrService'
import { Image } from 'primereact/image'
import { InputNumber } from 'primereact/inputnumber'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Checkbox } from 'primereact/checkbox'
import { InputTextarea } from 'primereact/inputtextarea'
import discountService from '@/service/discount.service'
import { useParams, useRouter } from 'next/navigation'

const DiscountUpdate = () => {
    const toast = useRef<Toast>(null)
    const router = useRouter()
    const { id } = useParams()

    const [discountName, setDiscountName] = useState<string>('')
    const [value, setValue] = useState<number | null>(null)
    const [fromDate, setFromDate] = useState<Date | null>(null)
    const [toDate, setToDate] = useState<Date | null>(null)
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [fetchedProducts, setFetchedProducts] = useState<ProductResponseDetails[]>([])
    const [selectedFetchedProducts, setSelectedFetchedProducts] = useState<ProductResponseDetails[]>([])
    const [checked, setChecked] = useState<boolean>(false)
    const [selectedProducts, setSelectedProducts] = useState<ProductResponse[]>([])
    const [comments, setComments] = useState<string>('')

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
    useEffect(() => {
        const fetchDiscount = async () => {
            try {
                const response = await discountService.getById(Number(id))
                const data = response.payload

                setDiscountName(data.name || '')
                setValue(data.discountPercentage !== undefined ? data.discountPercentage : null)
                setFromDate(data.startDateUtc ? new Date(data.startDateUtc) : null)
                setToDate(data.endDateUtc ? new Date(data.endDateUtc) : null)
                setChecked(data.isActive || false)
                setComments(data.comment || '')
                const appliedProducts: ProductResponse[] = data.appliedProducts || []
                setSelectedFetchedProducts(appliedProducts)

                const parentProductIds = new Set(
                    appliedProducts.map((product: ProductResponse) => product.productParentId)
                )

                const allProducts: ProductResponse[] = await ProductService.getAllProducts()
                console.log('All Products:', allProducts)
                setProducts(allProducts)

                const selectedParentProducts = allProducts.filter((product: ProductResponse) =>
                    parentProductIds.has(product.id)
                )
                setSelectedProducts(selectedParentProducts)

                const fetchedVariations: ProductResponse[] = []
                for (const parentId of parentProductIds) {
                    try {
                        const variations: ProductResponse[] = await ProductService.getProductsByParentId(parentId)
                        fetchedVariations.push(...variations)
                    } catch (error) {
                        console.error(`Error fetching products for parentId ${parentId}:`, error)
                    }
                }
                setFetchedProducts(fetchedVariations)

                const updatedSelectedFetchedProducts = fetchedVariations.filter((variation: ProductResponse) =>
                    appliedProducts.some((applied: ProductResponse) => applied.id === variation.id)
                )
                setSelectedFetchedProducts(updatedSelectedFetchedProducts)
            } catch (error) {
                console.error('Error fetching discount:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDiscount()
    }, [id])

    const showSuccessToast = () => {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Discount updated successfully!' })
    }

    const showFailedToast = () => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update discount' })
    }

    const handleUpdateDiscount = async () => {
        if (!validateForm()) {
            showFailedToast()
            return
        }

        const discountPayload = {
            isActive: checked,
            name: discountName,
            comment: comments,
            discountTypeId: 1,
            usePercentage: true,
            discountPercentage: value,
            startDateUtc: fromDate?.toISOString(),
            endDateUtc: toDate?.toISOString(),
            selectedProductVariantIds: selectedFetchedProducts.map((product) => product.id)
        }

        try {
            setLoading(true)

            await discountService.update(Number(id), discountPayload)

            showSuccessToast()

            router.push('/admin/discounts')
        } catch (error) {
            console.error('Failed to update discount:', error)

            showFailedToast()
        } finally {
            setLoading(false)
        }
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
        }

        if (!fromDate) {
            newErrors.fromDate = 'From Date is required.'
            isValid = false
        } else if (isNaN(fromDate.getTime())) {
            newErrors.fromDate = 'Invalid From Date.'
            isValid = false
        }

        if (!toDate) {
            newErrors.toDate = 'To Date is required.'
            isValid = false
        } else if (isNaN(toDate.getTime())) {
            newErrors.toDate = 'Invalid To Date.'
            isValid = false
        }

        if (fromDate && toDate && fromDate > toDate) {
            newErrors.dateError = 'The start date cannot be after the end date.'
            isValid = false
        }

        if (selectedFetchedProducts.length === 0) {
            newErrors.productError = 'At least one product must be selected.'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const onFetchedProductsSelectionChange = (e: any) => {
        setSelectedFetchedProducts(e.value as ProductResponseDetails[])
    }

    if (loading) {
        return (
            <div className='card'>
                <ProgressSpinner
                    className='flex items-center justify-center'
                    style={{ width: '50px', height: '50px' }}
                    strokeWidth='8'
                    fill='var(--surface-ground)'
                    animationDuration='.5s'
                />
            </div>
        )
    }

    const onProductSelectionChange = async (e: any) => {
        const newSelectedProducts = e.value as ProductResponse[]
        setSelectedProducts(newSelectedProducts)

        const selectedParentIds = new Set(newSelectedProducts.map((product) => product.id))

        const fetchedVariations = []
        for (const parentId of selectedParentIds) {
            try {
                const variations = await ProductService.getProductsByParentId(parentId)
                fetchedVariations.push(...variations)
            } catch (error) {
                console.error(`Error fetching products for parentId ${parentId}:`, error)
            }
        }

        setFetchedProducts(fetchedVariations)

        const updatedSelectedFetchedProducts = fetchedVariations.filter(
            (variation) =>
                selectedFetchedProducts.some((selected) => selected.id === variation.id) ||
                selectedParentIds.has(variation.productParentId)
        )
        setSelectedFetchedProducts(updatedSelectedFetchedProducts)
    }

    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='p-fluid grid'>
                <div className='col-12 md:col-6'>
                    <h3>Update Discount</h3>

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
                            min={0}
                            max={100}
                            required
                        />
                        {errors.value && <small className='p-error'>{errors.value}</small>}
                    </div>

                    <div className='field'>
                        <label htmlFor='fromDate'>From Date</label>
                        <Calendar
                            id='fromDate'
                            value={fromDate}
                            onChange={(e) => setFromDate(e.value)}
                            showTime
                            hourFormat='12'
                            required
                        />
                        {errors.fromDate && <small className='p-error'>{errors.fromDate}</small>}
                    </div>

                    <div className='field'>
                        <label htmlFor='toDate'>To Date</label>
                        <Calendar
                            id='toDate'
                            value={toDate}
                            onChange={(e) => setToDate(e.value)}
                            showTime
                            hourFormat='12'
                            required
                        />
                        {errors.toDate && <small className='p-error'>{errors.toDate}</small>}
                        {errors.dateError && <small className='p-error'>{errors.dateError}</small>}
                    </div>

                    <div className='field-checkbox'>
                        <Checkbox onChange={(e) => setChecked(e.checked || false)} checked={checked} />
                        <label htmlFor='active'>Active</label>
                    </div>

                    <div className='field'>
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
                        label='Update Discount'
                        icon='pi pi-check'
                        onClick={handleUpdateDiscount}
                    />
                </div>

                <div className='col-12 md:col-6'>
                    <h4>Select Products</h4>
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
                            value={products}
                            paginator
                            rows={5}
                            selection={selectedProducts}
                            onSelectionChange={onProductSelectionChange}
                            selectionMode='checkbox'
                        >
                            <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                            <Column field='id' header='STT' />
                            <Column field='name' header='Product Name' />
                        </DataTable>
                    )}
                </div>

                <div className='col-12'>
                    <h4 className='text-lg font-semibold mb-4'>Product Variations</h4>
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
                            selectionMode='checkbox'
                        >
                            <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                            <Column field='name' header='Product Name' />
                            <Column field='categoryName' header='Category Name' />
                            <Column field='manufacturerName' header='Manufacturer Name' />
                            <Column field='sku' header='SKU' />
                        </DataTable>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DiscountUpdate
