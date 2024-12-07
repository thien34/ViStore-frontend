'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { InputSwitch } from 'primereact/inputswitch'
import { Checkbox } from 'primereact/checkbox'
import { Toast } from 'primereact/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const VoucherUpdateDefaultBirthday = () => {
    const [discountName, setDiscountName] = useState('')
    const [usePercentage, setUsePercentage] = useState(true)
    const [value, setValue] = useState(0)
    const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | null>(null)
    const [minOrderAmount, setMinOrderAmount] = useState(1)
    const [isCumulative, setIsCumulative] = useState(false)
    const [limitationTimes, setLimitationTimes] = useState(0)
    const [perCustomerLimit, setPerCustomerLimit] = useState(1)
    const toast = useRef<Toast>(null)
    const [, setVoucherDetail] = useState(null)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter()

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
            usePercentage,
            discountAmount: usePercentage ? 0 : value,
            discountPercentage: usePercentage ? value : 0,
            maxDiscountAmount,
            isCumulative,
            limitationTimes,
            perCustomerLimit,
            minOrderAmount
        }

        try {
            await axios.put('http://localhost:8080/api/admin/vouchers/default-birthday-discount', updatedVoucher)
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

    const fetchDefaultBirthdayVoucher = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/vouchers/default-birthday')
            const voucherData = response.data

            setVoucherDetail(voucherData)
            setDiscountName(voucherData.name ?? '')
            setUsePercentage(voucherData.usePercentage ?? true)
            setValue(voucherData.usePercentage ? voucherData.discountPercentage : voucherData.discountAmount)
            setMaxDiscountAmount(voucherData.maxDiscountAmount ?? null)
            setMinOrderAmount(voucherData.minOderAmount ?? 1)
            setIsCumulative(voucherData.isCumulative ?? false)
            setLimitationTimes(voucherData.limitationTimes ?? 1)
            setPerCustomerLimit(voucherData.discountLimitationId ?? 1)
        } catch (error) {
            console.error('Error fetching default birthday voucher:', error)
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!discountName.trim()) {
            newErrors.discountName = 'Voucher name is required.'
        }

        if (limitationTimes <= 0) {
            newErrors.limitationTimes = 'Limitation times must be greater than 0.'
        }
        if (limitationTimes > 100) {
            newErrors.limitationTimes = 'Limitation times should not exceed 100.'
        }

        if (minOrderAmount <= 0) {
            newErrors.minOrderAmount = 'Min order amount must be greater than 0.'
        }
        if (minOrderAmount > 1000000) {
            newErrors.minOrderAmount = 'Min order amount should not exceed 1,000,000.'
        }

        if (usePercentage) {
            if (value <= 0 || value > 50) {
                newErrors.value = 'Discount percentage must be between 1% and 50%.'
            }
            if (maxDiscountAmount && maxDiscountAmount > 5000) {
                newErrors.maxDiscountAmount =
                    'Max discount amount should not exceed 5,000 VNĐ for percentage discounts.'
            }
        } else {
            if (value <= 0) {
                newErrors.value = 'Discount amount must be greater than 0.'
            }
            if (value > 5000) {
                newErrors.value = 'Discount amount should not exceed 5,000 VNĐ.'
            }
            if (maxDiscountAmount && maxDiscountAmount > 5000) {
                newErrors.maxDiscountAmount = 'Max discount amount should not exceed 5,000 VNĐ.'
            }
        }

        if (perCustomerLimit <= 0) {
            newErrors.perCustomerLimit = 'Per customer limit must be greater than 0.'
        }
        if (perCustomerLimit > 5) {
            newErrors.perCustomerLimit = 'Per customer limit should not exceed 5.'
        }

        if (isCumulative && maxDiscountAmount && value > maxDiscountAmount) {
            newErrors.isCumulative =
                'When cumulative discounts are allowed, max discount amount should be greater than or equal to the discount value.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    useEffect(() => {
        fetchDefaultBirthdayVoucher()
    }, [])

    return (
        <div className='card p-5' style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Toast ref={toast} />
            <h2 className='text-center mb-4'>Birthday Default</h2>
            <div className='p-fluid grid mt-4'>
                <div className='col-12'>
                    <div className='field'>
                        <label htmlFor='voucherName'>Voucher Name</label>
                        <InputText
                            type='text'
                            disabled
                            id='voucherName'
                            value={discountName}
                            onChange={(e) => setDiscountName(e.target.value)}
                            required
                            placeholder='Enter voucher name'
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
                                    id='maxDiscountAmount'
                                    value={maxDiscountAmount}
                                    prefix='$'
                                    onValueChange={(e) => setMaxDiscountAmount(e.value ?? 0)}
                                    min={1}
                                    max={5000}
                                    showButtons
                                />
                                {errors.maxDiscountAmount && (
                                    <small className='p-error'>{errors.maxDiscountAmount}</small>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='field'>
                        <label htmlFor='minOderAmount'>Min Order Amount</label>
                        <InputNumber
                            id='minOderAmount'
                            value={minOrderAmount}
                            onValueChange={(e) => setMinOrderAmount(e.value ?? 0)}
                            prefix='$'
                            min={1}
                            max={1000000}
                            showButtons
                        />
                        {errors.minOrderAmount && <small className='p-error'>{errors.minOrderAmount}</small>}
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
                        <div className='field flex items-center gap-4 mb-0'>
                            <label className='mb-0' htmlFor='limitationTimes'>
                                Limitation Times
                            </label>
                            <InputNumber
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
                                style={{ width: '80px' }}
                                id='perCustomerLimit'
                                value={perCustomerLimit}
                                onValueChange={(e) => setPerCustomerLimit(e.value ?? 0)}
                            />
                            {errors.perCustomerLimit && <small className='p-error'>{errors.perCustomerLimit}</small>}
                        </div>
                    </div>
                    <Button className='mt-4' label='Update Voucher' icon='pi pi-check' onClick={handleUpdateVoucher} />
                </div>
            </div>
        </div>
    )
}

export default VoucherUpdateDefaultBirthday
