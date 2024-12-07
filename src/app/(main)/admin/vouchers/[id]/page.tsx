'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { ToggleButton } from 'primereact/togglebutton'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'
import { InputSwitch } from 'primereact/inputswitch'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Checkbox } from 'primereact/checkbox'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { Customer } from '@/interface/customer.interface'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { Message } from 'primereact/message'
const VoucherUpdate = () => {
    const [isPublished, setIsPublished] = useState(false)
    const [discountName, setDiscountName] = useState('')
    const [usePercentage, setUsePercentage] = useState(true)
    const [value, setValue] = useState(0)
    const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(null)
    const [minOrderAmount, setMinOrderAmount] = useState(1)
    const [fromDate, setFromDate] = useState<Date | null>(null)
    const [toDate, setToDate] = useState<Date | null>(null)
    const [isCumulative, setIsCumulative] = useState(false)
    const [usageCount, setUsageCount] = useState(0)
    const [limitationTimes, setLimitationTimes] = useState(0)
    const [perCustomerLimit, setPerCustomerLimit] = useState(1)
    const [comments, setComments] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const toast = useRef<Toast>(null)
    const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([])
    const [initialCustomers, setInitialCustomers] = useState<Customer[]>([])
    const [, setVoucherDetail] = useState(null)
    const [isExpired, setIsExpired] = useState(false)
    const params = useParams()
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter()
    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/customers')
            const customersData = Array.isArray(response.data.data.items) ? response.data.data.items : []
            console.log(customersData)
            setInitialCustomers(customersData)
        } catch (error) {
            console.error('Error fetching customers:', error)
        }
    }
    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        const currentDate = new Date()

        if (!discountName.trim()) {
            newErrors.discountName = 'Voucher name is required.'
        }
        if (limitationTimes <= 0) {
            newErrors.limitationTimes = 'Limitation times must be greater than 0.'
        }
        if (!toDate) {
            newErrors.toDate = 'End date is required.'
        } else if (toDate <= currentDate) {
            newErrors.toDate = 'End date must be greater than the current time.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdateVoucher = async () => {
        if (!validateForm()) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Failed',
                detail: 'Please correct the highlighted errors before updating.',
                life: 3000
            })
            return
        }

        const updatedVoucher = {
            name: discountName,
            startDateUtc: fromDate?.toISOString(),
            endDateUtc: toDate?.toISOString(),
            maxUsageCount: limitationTimes,
            comment: comments
        }
        try {
            await axios.put(`http://localhost:8080/api/admin/vouchers/${params.id}`, updatedVoucher)
            toast.current?.show({
                severity: 'success',
                summary: 'Voucher Updated',
                detail: 'Voucher has been successfully updated.',
                life: 3000
            })
            router.push('/admin/vouchers')
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update voucher. Please try again later.'
            toast.current?.show({
                severity: 'error',
                summary: 'Update Failed',
                detail: errorMessage,
                life: 5000
            })
        }
    }

    const fetchVoucherDetail = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/vouchers/' + params.id)
            const voucherData = response.data
            setVoucherDetail(voucherData)
            setIsPublished(voucherData.isActive ?? false)
            setDiscountName(voucherData.name ?? '')
            setUsePercentage(voucherData.usePercentage ?? true)
            setValue(voucherData.usePercentage ? voucherData.discountPercentage : voucherData.discountAmount)
            setMaxDiscountAmount(voucherData.maxDiscountAmount ?? null)
            setMinOrderAmount(voucherData.minOderAmount ?? 1)
            setFromDate(new Date(voucherData.startDateUtc))
            setToDate(new Date(voucherData.endDateUtc))
            setIsCumulative(voucherData.isCumulative ?? false)
            setLimitationTimes(voucherData.limitationTimes ?? 1)
            setUsageCount(voucherData.usageCount ?? 0)
            setPerCustomerLimit(voucherData.discountLimitationId ?? 1)
            setComments(voucherData.comment ?? '')
            setSelectedCustomers(voucherData.appliedCustomers ?? [])
            const currentDate = new Date()
            const voucherEndDate = new Date(voucherData.endDateUtc)
            setIsExpired(currentDate > voucherEndDate)
        } catch (error) {
            console.error('Error fetching voucher details:', error)
        }
    }
    const content = (
        <div className='flex align-items-center my-2'>
            <div className='ml-2'>This voucher has expired and cannot be edited.</div>
        </div>
    )

    useEffect(() => {
        fetchVoucherDetail()
        fetchCustomers()
    }, [])
    const filteredCustomers = initialCustomers.filter((customer) =>
        `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleFromDateChange = (newValue: Date | null) => {
        setFromDate(newValue)
        if (newValue) {
            const newMinToDate = new Date(newValue.getTime() + 60 * 60 * 1000)
            if (toDate && toDate < newMinToDate) {
                setToDate(newMinToDate)
                toast.current?.show({
                    severity: 'info',
                    summary: 'Notice',
                    detail: 'The end time has been adjusted to be at least 1 hour from the start time.',
                    life: 3000
                })
            }
        }
    }

    const onCustomerSelectionChange = (e: any) => {
        const newSelectedCustomers = e.value as Customer[]
        setSelectedCustomers(newSelectedCustomers)
    }

    return (
        <div className='card'>
            {isExpired && (
                <Message
                    style={{
                        border: 'solid #ff4d4f',
                        borderWidth: '0 0 0 6px',
                        color: '#ff4d4f',
                        backgroundColor: '#ffecec'
                    }}
                    className='w-full justify-content-start'
                    severity='error'
                    content={content}
                />
            )}

            <Toast ref={toast} />
            <div className='p-fluid grid mt-4'>
                <div className='col-12 md:col-6'>
                    <h3>Update Voucher</h3>
                    <p>{isPublished ? 'Published vouchers' : 'Private vouchers'}</p>
                    <ToggleButton
                        disabled
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
                            disabled={isExpired}
                            placeholder='Enter voucher name'
                        />
                        {errors.discountName && <small className='p-error'>{errors.discountName}</small>}
                    </div>
                    <div className='field'>
                        <div className='flex align-items-center gap-3'>
                            <span>Use Percentage</span>
                            <InputSwitch
                                disabled
                                id='discountTypeSwitch'
                                checked={usePercentage}
                                onChange={(e) => {
                                    const newValue = e.value
                                    setUsePercentage(newValue)
                                    if (!newValue) {
                                        setMaxDiscountAmount(null)
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className='flex'>
                        <div className='field'>
                            <label htmlFor='value'>Value</label>
                            <InputNumber
                                disabled
                                inputId='value'
                                value={value}
                                showButtons
                                mode='decimal'
                                onValueChange={(e) => setValue(e.value ?? 0)}
                                suffix={usePercentage ? '%' : '$'}
                                min={usePercentage ? 1 : 0.1}
                                max={usePercentage ? 50 : 1000000}
                                required
                                placeholder='Enter discount value'
                            />
                        </div>
                        {usePercentage && (
                            <div className='field ml-5'>
                                <label className='w-full' htmlFor='maxDiscountAmount'>
                                    Max Discount Amount
                                </label>
                                <InputNumber
                                    disabled
                                    id='maxDiscountAmount'
                                    value={maxDiscountAmount}
                                    prefix='$'
                                    onValueChange={(e) => setMaxDiscountAmount(e.value ?? 0)}
                                    min={1}
                                    max={5000}
                                    showButtons
                                />
                            </div>
                        )}
                    </div>
                    <div className='field'>
                        <label htmlFor='minOrderAmount'>Min Order Amount</label>
                        <InputNumber
                            disabled
                            id='minOrderAmount'
                            value={minOrderAmount}
                            onValueChange={(e) => setMinOrderAmount(e.value ?? 0)}
                            prefix='$'
                            min={1}
                            max={1000000}
                            showButtons
                        />
                    </div>
                    <div className='flex flex-direction-column gap-6'>
                        <div className='field'>
                            <label htmlFor='fromDate'>From Date</label>
                            <Calendar
                                disabled
                                id='fromDate'
                                value={fromDate}
                                onChange={(e) => handleFromDateChange(e.value as Date | null)}
                                showIcon
                                dateFormat='dd/mm/yy'
                                showTime
                                hourFormat='24'
                                placeholder='Select start date'
                                showButtonBar
                                required
                            />
                        </div>

                        <div className='field'>
                            <label htmlFor='toDate'>To Date</label>
                            <Calendar
                                disabled={isExpired}
                                id='toDate'
                                value={toDate}
                                onChange={(e) => setToDate(e.value as Date | null)}
                                showIcon
                                dateFormat='dd/mm/yy'
                                showTime
                                hourFormat='24'
                                placeholder='Select end date'
                                minDate={fromDate ? new Date(fromDate.getTime() + 60 * 60 * 1000) : undefined}
                                showButtonBar
                                required
                            />
                            {errors.toDate && <small className='p-error'>{errors.toDate}</small>}
                        </div>
                    </div>
                    <div className='my-4'>
                        <Checkbox
                            disabled={limitationTimes !== usageCount || isExpired}
                            id='ingredient'
                            onChange={(e) => setIsCumulative(e.checked ?? false)}
                            checked={isCumulative}
                        />
                        <label htmlFor='ingredient' className='ml-2'>
                            Cumulative with other discounts
                        </label>
                    </div>
                    <div className='flex justify-between'>
                        <div className='field flex items-center gap-4 mb-0'>
                            <label className='mb-0' htmlFor='limitationTimes'>
                                Limitation Times
                            </label>
                            <InputNumber
                                disabled={isExpired}
                                style={{ width: '80px' }}
                                id='limitationTimes'
                                value={limitationTimes}
                                onValueChange={(e) => setLimitationTimes(e.value ?? 0)}
                            />
                            {errors.limitationTimes && <small className='p-error'>{errors.limitationTimes}</small>}
                        </div>
                        <div className='field flex items-center gap-4 mb-0'>
                            <label className='mb-0' htmlFor='perCustomerLimit'>
                                Per Customer Limit
                            </label>
                            <InputNumber
                                disabled
                                style={{ width: '80px' }}
                                id='perCustomerLimit'
                                value={perCustomerLimit}
                                onValueChange={(e) => setPerCustomerLimit(e.value ?? 0)}
                            />
                        </div>
                    </div>
                    <div className='flex justify-center gap-2 items-center space-x-2 my-3'>
                        <InputTextarea
                            disabled={isExpired}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder='Comments'
                            rows={5}
                            cols={30}
                        />
                    </div>
                    <Button
                        className='mt-4'
                        label='Update Voucher'
                        icon='pi pi-check'
                        onClick={handleUpdateVoucher}
                        disabled={isExpired}
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
                    <DataTable
                        disabled
                        value={filteredCustomers || []}
                        paginator
                        rows={9}
                        dataKey='id'
                        isDataSelectable={() => false}
                        selection={selectedCustomers}
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

export default VoucherUpdate
