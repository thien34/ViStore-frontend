import { Button } from 'primereact/button'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import React, { useState } from 'react'
import { FaIdCard } from 'react-icons/fa'
import AddressForm from '../../customers/[id]/_components/AddressForm'
import { Dropdown } from 'primereact/dropdown'
import { AutoComplete } from 'primereact/autocomplete'

interface CustommerOrderProps {
    orderTotals: {
        subtotal: number
        shippingCost: number
        tax: number
        total: number
    }
}

export default function CustommerOrder({ orderTotals }: CustommerOrderProps) {
    const [checked, setChecked] = useState<boolean>(false)

    return (
        <div className='space-y-4 w-full'>
            <div className='flex justify-content-between'>
                <h3>Customer</h3>
                <Button label='Choose Customer' />
            </div>
            <hr className='border-1 border-gray-300' />
            <div className='space-y-4 card mt-2 flex justify-between'>
                <div className='w-2/3'>
                    {/* TODO: Add customer details */}
                    {checked && (
                        <>
                            <div className='flex justify-end'>
                                <Button label='Choose Address' />
                            </div>
                            <div className='flex flex-wrap justify-content-between w-full'>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='firstName' className='font-medium block'>
                                        First name
                                    </label>
                                    <InputText id='firstName' className='w-full' />
                                </div>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='lastName' className='font-medium block'>
                                        Last name
                                    </label>
                                    <InputText id='lastName' className='w-full' />
                                </div>
                            </div>
                            <div className='flex flex-wrap justify-content-between w-full'>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='phoneNumber' className='font-medium block'>
                                        Phone number
                                    </label>
                                    <InputText id='phoneNumber' className='w-full' />
                                </div>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='note' className='font-medium block'>
                                        Note
                                    </label>
                                    <InputText id='note' className='w-full' />
                                </div>
                            </div>
                            <div className='flex flex-wrap justify-content-between w-full gap-2'>
                                <div className='field md:w-[32%]'>
                                    <label htmlFor='province' className='font-medium block'>
                                        Province
                                    </label>
                                    <Dropdown className='w-full' optionLabel='fullName' placeholder='Choose Province' />
                                </div>
                                <div className='field md:w-[32%]'>
                                    <label htmlFor='district' className='font-medium block'>
                                        District
                                    </label>
                                    <Dropdown
                                        className='w-full'
                                        optionLabel='fullName'
                                        placeholder='Choose District'
                                        filter
                                    />
                                </div>
                                <div className='field md:w-[32%]'>
                                    <label htmlFor='ward' className='font-medium block'>
                                        Ward
                                    </label>
                                    <Dropdown
                                        className='w-full'
                                        optionLabel='fullName'
                                        placeholder='Choose Ward'
                                        filter
                                    />
                                </div>
                            </div>
                            <div className='field w-full'>
                                <label htmlFor='addressName' className='font-medium block'>
                                    Address detail
                                </label>
                                <InputText id='addressName' className='w-full' />
                            </div>
                        </>
                    )}
                </div>
                <div className='w-1/2'>
                    <div className='mt-6 w-full space-y-6 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md float-end'>
                        <div className='flow-root'>
                            <div className='-my-3 divide-y divide-gray-200 dark:divide-gray-800'>
                                <div className='flex items-center justify-between gap-4 py-3'>
                                    <label className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                        Delivery
                                    </label>
                                    <InputSwitch
                                        checked={checked}
                                        onChange={(e: InputSwitchChangeEvent) => setChecked(e.value)}
                                    />
                                </div>
                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Coupon</dt>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400 w-full'>
                                        <InputText className='w-3/5 me-14' />
                                        <Button label='Apply' />
                                    </dt>
                                </dl>

                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Subtotal</dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        ${orderTotals.subtotal.toFixed(2)}
                                    </dd>
                                </dl>
                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                        Shipping Cost
                                    </dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        ${orderTotals.shippingCost.toFixed(2)}
                                    </dd>
                                </dl>

                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Discount</dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        ${orderTotals.shippingCost.toFixed(2)}
                                    </dd>
                                </dl>
                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>Total</dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        ${orderTotals.total.toFixed(2)}
                                    </dd>
                                </dl>
                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                                        Customer Payment{' '}
                                        <FaIdCard className='text-primary-700 text-5xl cursor-pointer' />
                                    </dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        ${orderTotals.shippingCost.toFixed(2)}
                                    </dd>
                                </dl>
                                <dl className='flex items-center justify-between gap-4 py-3'>
                                    <dt className='text-base font-normal flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                                        Money Short
                                    </dt>
                                    <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                        ${orderTotals.shippingCost.toFixed(2)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <button
                                type='submit'
                                className='flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
