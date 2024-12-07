'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputNumber } from 'primereact/inputnumber'
import { InputTextarea } from 'primereact/inputtextarea'
import { useRouter } from 'next/navigation'
import { Customer } from '@/interface/customer.interface'
import { InputSwitch } from 'primereact/inputswitch'
import { Checkbox } from 'primereact/checkbox'
import { ToggleButton } from 'primereact/togglebutton'
import voucherService from '@/service/voucher.service'
import { InputMask, InputMaskChangeEvent } from 'primereact/inputmask'

interface DiscounProps {
    initialCustomers: Customer[]
}

const DiscountForm = ({ initialCustomers }: DiscounProps) => {
    const toast = useRef<Toast>(null)
    const [discountName, setDiscountName] = useState<string>('')
    const [value, setValue] = useState<number | null>(null)
    const [fromDate, setFromDate] = useState<Date>()
    const [toDate, setToDate] = useState<Date | undefined>(undefined)
    const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
    const [discountTypeId] = useState<number>(0)
    const [isPublished, setIsPublished] = useState<boolean>(false)
    const [comments, setComments] = useState<string>('')
    const [usePercentage, setUsePercentage] = useState<boolean>(false)
    const [minOrderAmount, setMinOrderAmount] = useState<number>(0)
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [minStartDate, setMinStartDate] = useState<Date | undefined>(new Date())
    const [minEndDate, setMinEndDate] = useState<Date | undefined>(undefined)
    const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(null)
    const [couponCode, setCouponCode] = useState<string | undefined>()
    const [limitationTimes, setLimitationTimes] = useState(null)
    const [perCustomerLimit, setPerCustomerLimit] = useState(null)
    const [isCumulative, setIsCumulative] = useState<boolean>(false)
    const [errors, setErrors] = useState<{
        discountName: string | null
        value: string | null
        fromDate: string | null
        toDate: string | null
        dateError: string | null
        productError: string | null
        maxDiscountAmount: string | null
        minOrderAmount: string | null
        couponCode: string | null
        limitationTimes: string | null
        perCustomerLimit: string | null
    }>({
        discountName: null,
        value: null,
        fromDate: null,
        toDate: null,
        dateError: null,
        productError: null,
        maxDiscountAmount: null,
        minOrderAmount: null,
        couponCode: null,
        limitationTimes: null,
        perCustomerLimit: null
    })
    const router = useRouter()
    const filteredCustomers = initialCustomers.filter((customer) =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const showSuccessToast = () => {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Discount created successfully!' })
    }
    useEffect(() => {
        const now = new Date()
        setMinStartDate(now)

        if (fromDate) {
            const minEndDateTime = new Date(fromDate.getTime() + 60 * 60 * 1000)
            setMinEndDate(minEndDateTime)
        } else {
            setMinEndDate(null)
        }
    }, [fromDate])
    const onCustomerSelectionChange = (e: any) => {
        const newSelectedCustomers = e.value as Customer[]
        setSelectedCustomers(newSelectedCustomers)
    }
    const showFailedToast = (errorMessage: string) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage || 'Failed to create discount'
        })
    }
    const discountLimitationType = 3

    const handleCreateDiscount = () => {
        if (!validateForm()) {
            showFailedToast('Form validation failed. Please correct the fields.')
            return
        }
        const formattedCouponCode = `VI${couponCode?.toUpperCase()?.replace(/^VI/, '').replace(/-/g, '')}`
        const discountPayload = {
            name: discountName,
            comment: comments,
            discountTypeId: discountTypeId,
            usePercentage: usePercentage,
            discountPercentage: usePercentage ? (value !== null ? value : undefined) : undefined,
            discountAmount: !usePercentage ? (value !== null ? value : undefined) : undefined,
            startDateUtc: fromDate?.toISOString(),
            endDateUtc: toDate?.toISOString(),
            maxDiscountAmount: maxDiscountAmount,
            minOderAmount: minOrderAmount,
            requiresCouponCode: true,
            couponCode: formattedCouponCode,
            selectedCustomerIds: selectedCustomers.map((customer) => customer.id),
            isPublished: isPublished,
            isBirthday: false,
            discountLimitationId: discountLimitationType,
            limitationTimes: limitationTimes,
            perCustomerLimit: perCustomerLimit,
            isCumulative: isCumulative
        }

        voucherService
            .create(discountPayload)
            .then(() => {
                showSuccessToast()
                setDiscountName('')
                setValue(null)
                setFromDate(null)
                setToDate(null)
                setComments('')
                setMaxDiscountAmount(null)
                setCouponCode('')
                setSelectedCustomers([])
                router.push('/admin/vouchers')
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
            maxDiscountAmount: string | null
            minOrderAmount: string | null
            couponCode: string | null
            limitationTimes: string | null
            perCustomerLimit: string | null
        } = {
            discountName: null,
            value: null,
            fromDate: null,
            toDate: null,
            dateError: null,
            productError: null,
            maxDiscountAmount: null,
            minOrderAmount: null,
            couponCode: null,
            limitationTimes: null,
            perCustomerLimit: null
        }

        if (!discountName.trim()) {
            newErrors.discountName = 'Discount name is required.'
            isValid = false
        }

        if (value === null || isNaN(value) || value <= 0) {
            newErrors.value = 'Please enter a valid positive discount value.'
            isValid = false
        } else if (value > 50 && usePercentage) {
            newErrors.value = 'You cannot set a discount higher than 50%.'
            isValid = false
        }
        if (usePercentage && (maxDiscountAmount === null || isNaN(maxDiscountAmount) || maxDiscountAmount <= 0)) {
            newErrors.maxDiscountAmount = 'Please enter a valid maximum discount amount.'
            isValid = false
        }

        if (minOrderAmount <= 0) {
            newErrors.minOrderAmount = 'Please enter a valid minimum order amount.'
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
        const validDiscountPercentage = !usePercentage && value != null ? value : 0
        if (minOrderAmount >= 0 && validDiscountPercentage > 0.69 * minOrderAmount) {
            newErrors.value = 'Voucher value cannot exceed 69% of the minimum order amount.'
            isValid = false
        }
        const limitationTimeValid = limitationTimes != null ? limitationTimes : 0
        if (limitationTimeValid <= 0 || limitationTimeValid > 1000000) {
            newErrors.limitationTimes = 'Limitation times must be between 1 and 1000000.'
            isValid = false
        }
        const perCustomerLimitValid = perCustomerLimit !== null ? perCustomerLimit : 0
        if (discountLimitationType === 3 && (perCustomerLimitValid <= 0 || perCustomerLimitValid > 5)) {
            newErrors.perCustomerLimit = 'Per customer limit must be between 1 and 5.'
            isValid = false
        }

        if (!isPublished && selectedCustomers.length === 0) {
            newErrors.productError = 'At least one customer must be selected.'
            isValid = false
        }
        const validValue = value !== null ? value : 0
        const validMinOrderAmount = minOrderAmount !== null ? minOrderAmount : 0

        if (validValue > validMinOrderAmount) {
            newErrors.value = 'Voucher value cannot exceed the minimum order amount.'
            isValid = false
        }
        setErrors(newErrors)
        return isValid
    }

    return (
        <div className='card'>
            <Toast ref={toast} />
            <div className='p-fluid grid'>
                <div className='col-12 md:col-6'>
                    <h3>Create Voucher</h3>
                    <p>{isPublished ? 'Published vouchers' : 'Private vouchers'}</p>
                    <ToggleButton
                        onLabel='Public'
                        offLabel='Private'
                        onIcon='pi pi-lock-open'
                        offIcon='pi pi-lock'
                        checked={isPublished}
                        onChange={(e) => {
                            const newIsPublished = e.value
                            setIsPublished(newIsPublished)
                            if (newIsPublished) {
                                setSelectedCustomers([])
                            }
                        }}
                        className='w-9rem mt-1 mb-5'
                    />

                    <div className='field'>
                        <label htmlFor='voucherName'>Voucher Name</label>
                        <InputText
                            id='voucherName'
                            value={discountName}
                            onChange={(e) => setDiscountName(e.target.value)}
                            required
                            placeholder='Enter voucher name'
                            tooltip='Enter discount name'
                            tooltipOptions={{ position: 'top' }}
                        />
                        {errors.discountName && <small className='p-error'>{errors.discountName}</small>}
                    </div>
                    <div className='field'>
                        <div className='flex align-items-center gap-3'>
                            <span>Use Percentage</span>
                            <InputSwitch
                                id='discountTypeSwitch'
                                checked={usePercentage}
                                onChange={(e) => {
                                    const newValue = e.value
                                    setUsePercentage(newValue)
                                    if (!newValue) {
                                        setMaxDiscountAmount(null)
                                    }
                                }}
                                tooltip='Switch between Percentage or Fixed discount type'
                                tooltipOptions={{ position: 'top' }}
                            />
                        </div>
                    </div>
                    <div className='flex'>
                        <div className='field'>
                            <label htmlFor='value'>Value</label>
                            <InputNumber
                                inputId='value'
                                value={value}
                                showButtons
                                mode='decimal'
                                onValueChange={(e) => setValue(e.value !== undefined ? e.value : null)}
                                suffix={usePercentage ? '%' : '$'}
                                min={usePercentage ? 1 : 0.1}
                                max={usePercentage ? 50 : 1000000}
                                required
                                placeholder='Enter discount value'
                                tooltip='Enter discount value'
                                tooltipOptions={{ position: 'top' }}
                            />
                            {errors.value && <small className='p-error'>{errors.value}</small>}
                        </div>
                        {usePercentage && (
                            <div className='field ml-5'>
                                <label className='w-full' htmlFor='maxDiscountAmount'>
                                    Max Discount Amount
                                </label>
                                <InputNumber
                                    id='maxDiscountAmount'
                                    value={maxDiscountAmount}
                                    prefix='$'
                                    onValueChange={(e) => setMaxDiscountAmount(e.value ?? 0)}
                                    min={1}
                                    max={5000}
                                    showButtons
                                    className={errors.maxDiscountAmount ? 'p-invalid' : ''}
                                />
                                {errors.maxDiscountAmount && (
                                    <small className='p-error'>{errors.maxDiscountAmount}</small>
                                )}
                            </div>
                        )}
                    </div>
                    <div className='field'>
                        <label htmlFor='minOrderAmount'>Min Order Amount</label>
                        <InputNumber
                            id='minOrderAmount'
                            value={minOrderAmount}
                            onValueChange={(e) => setMinOrderAmount(e.value ?? 0)}
                            prefix='$'
                            min={1}
                            max={1000000}
                            showButtons
                            className={errors.minOrderAmount ? 'p-invalid' : ''}
                        />
                        {errors.minOrderAmount && <small className='p-error'>{errors.minOrderAmount}</small>}
                    </div>
                    <div className='flex flex-direction-column gap-6'>
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
                                minDate={minStartDate}
                                showTime
                                hourFormat='12'
                                touchUI
                                dateFormat='dd/mm/yy'
                                placeholder='Select start date'
                                tooltip='Select start date'
                                tooltipOptions={{ position: 'top' }}
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
                                minDate={minEndDate}
                                dateFormat='dd/mm/yy'
                                placeholder='Select end date'
                                tooltip='Select end date'
                                tooltipOptions={{ position: 'top' }}
                                showButtonBar
                                required
                                hourFormat='12'
                            />
                            {errors.toDate && <small className='p-error'>{errors.toDate}</small>}
                            {errors.dateError && <small className='p-error'>{errors.dateError}</small>}
                        </div>
                    </div>

                    <div className='field'>
                        <label htmlFor='couponCode'>Coupon Code</label>
                        <InputMask
                            className='uppercase'
                            value={couponCode}
                            onChange={(e: InputMaskChangeEvent) => setCouponCode(e.target.value)}
                            mask='VI-*******'
                            placeholder='VI-'
                        />
                        {errors.couponCode && <small className='p-error'>{errors.couponCode}</small>}
                    </div>
                    <div className='my-4'>
                        <Checkbox
                            id='ingredient'
                            onChange={(e) => setIsCumulative(e.checked ?? false)}
                            checked={isCumulative}
                        />
                        <label htmlFor='ingredient' className='ml-2'>
                            Cumulative with other discounts
                        </label>
                    </div>
                    <div className='flex justify-between'>
                        <div>
                            <div className='field flex items-center gap-4 mb-0'>
                                <label className='mb-0' htmlFor='limitationTimes'>
                                    Limitation Times
                                </label>
                                <InputNumber
                                    style={{ width: '80px' }}
                                    id='limitationTimes'
                                    value={limitationTimes}
                                    onValueChange={(e) => setLimitationTimes(e.value)}
                                    className={errors.limitationTimes ? 'p-invalid' : ''}
                                />
                            </div>
                            {errors.limitationTimes && <small className='p-error'>{errors.limitationTimes}</small>}
                        </div>
                        <div>
                            <div className='field flex items-center gap-4 mb-0'>
                                <label className='mb-0' htmlFor='perCustomerLimit'>
                                    Per Customer Limit
                                </label>
                                <InputNumber
                                    style={{ width: '80px' }}
                                    id='perCustomerLimit'
                                    value={perCustomerLimit}
                                    onValueChange={(e) => setPerCustomerLimit(e.value)}
                                    className={errors.perCustomerLimit ? 'p-invalid' : ''}
                                />
                            </div>
                            {errors.perCustomerLimit && <small className='p-error'>{errors.perCustomerLimit}</small>}
                        </div>
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
                    <h4>Select Customers</h4>
                    <div className='field'>
                        <InputText
                            id='productSearch'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Search by name'
                        />
                    </div>
                    {errors.productError && <small className='p-error'>{errors.productError}</small>}
                    <DataTable
                        value={filteredCustomers}
                        paginator
                        rows={9}
                        dataKey='id'
                        selection={selectedCustomers}
                        isDataSelectable={() => !isPublished}
                        onSelectionChange={onCustomerSelectionChange}
                        selectionMode='checkbox'
                    >
                        <Column selectionMode='multiple' headerStyle={{ width: '3em' }} />
                        <Column header='STT' body={(_, { rowIndex }) => rowIndex + 1} sortable />
                        <Column
                            header='Customer Name'
                            body={(rowData) => `${rowData.lastName} ${rowData.firstName}`}
                            sortable
                        />
                        <Column field='email' header='Email' sortable />
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default DiscountForm
