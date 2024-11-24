import { Button } from 'primereact/button'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import React, { useRef, useState } from 'react'
import { FaIdCard, FaUserPlus } from 'react-icons/fa'
import AddressComponent from '@/components/address/AddressComponent'
import provinceService from '@/service/province.service'
import { Address, AddressesResponse, Province } from '@/interface/address.interface'
import { useLocalStorage, useMountEffect, useUpdateEffect } from 'primereact/hooks'
import { IoLocationSharp } from 'react-icons/io5'
import PaymentDialog from './PaymentDialog'
import { Tooltip } from 'primereact/tooltip'
import CustomerDialog from './CustomerDialog'
import { Customer } from '@/interface/customer.interface'
import addressService from '@/service/address.service'
import CustomerAddressDialog from './CustomerAddressDialog'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Toast } from 'primereact/toast'
import CartService from '@/service/cart.service'
import { OrderRequest, PaymentMethodType, PaymentModeType, PaymentStatusType } from '@/interface/order.interface'
import { CartResponse } from '@/interface/cart.interface'
import OrderService from '@/service/order.service'

interface CustommerOrderProps {
    orderTotals: {
        subtotal: number
        shippingCost: number
        tax: number
        total: number
    }
    totalWeight: number
    fetchBill: () => void
    numberBill: number
}

export default function CustommerOrder({ orderTotals, fetchBill, numberBill }: CustommerOrderProps) {
    const [checked, setChecked] = useState<boolean>(true)
    const [provinces, setProvinces] = useState<Province[]>([])
    const [visible, setVisible] = useState<boolean>(false)
    const [amountPaid, setAmountPaid] = useState<number>(0)
    const [customerDialogVisible, setCustomerDialogVisible] = useState<boolean>(false)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [address, setAddress] = useState<AddressesResponse>({
        addressDetail: '',
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phoneNumber: ''
    })
    const [addressDetail, setAddressDetail] = useState<Address | null>(null)
    const [addressDetailGenerated, setAddressDetailGenerated] = useState<string | ''>('')
    const [customerAddressDialogVisible, setCustomerAddressDialogVisible] = useState<boolean>(false)
    const [addresses, setAddresses] = useState<AddressesResponse[]>([])
    const [selectedAddress, setSelectedAddress] = useState<AddressesResponse | null>(null)
    const toast = useRef<Toast>(null)
    const [, setOrderLocal] = useLocalStorage('orderLocal', '')
    const fetchProvinces = async () => {
        const { payload: provinces } = await provinceService.getAll()
        setProvinces(provinces)
    }
    useMountEffect(() => {
        fetchProvinces()
    })

    const handleGetAddress = async (addressRequest: Address) => {
        setAddressDetail(addressRequest)
    }

    const handlePayment = () => {
        if (!validateAddress()) return
        setVisible(true)
        const billId = localStorage.getItem('billIdCurrent')
        if (!billId) return

        CartService.getCart(billId).then(async (res: CartResponse[]) => {
            const order: OrderRequest = {
                customerId: customer?.id || 1,
                orderGuid: billId,
                addressType: checked ? 2 : -1,
                orderId: '',
                pickupInStore: false,
                orderStatusId: checked ? 0 : 8,
                paymentStatusId: PaymentStatusType.Paid,
                paymentMethodId: amountPaid === orderTotals.total ? PaymentMethodType.Cash : PaymentMethodType.Cod,
                paymentMode: PaymentModeType.IN_STORE,
                orderSubtotal: orderTotals.subtotal,
                orderSubtotalDiscount: 0,
                orderShipping: orderTotals.shippingCost,
                orderDiscount: 0,
                orderTotal: orderTotals.total,
                refundedAmount: 0,
                paidDateUtc: '',
                billCode: 'Bill' + numberBill,
                deliveryMode: checked ? 0 : 1,
                orderItems: res.map((item) => ({
                    productId: item.productResponse.id,
                    orderItemGuid: '',
                    quantity: item.quantity,
                    unitPrice: item.productResponse.price,
                    priceTotal: item.quantity * item.productResponse.price,
                    discountAmount: 0,
                    originalProductCost: item.productResponse.price,
                    attributeDescription: ''
                })),
                addressRequest: checked
                    ? {
                          customerId: customer?.id || 1,
                          firstName: address.firstName,
                          lastName: address.lastName,
                          email: address.email,
                          addressName: addressDetailGenerated,
                          provinceId: addressDetail?.provinceId || '',
                          districtId: addressDetail?.districtId || '',
                          wardId: addressDetail?.wardId || '',
                          phoneNumber: address.phoneNumber
                      }
                    : null
            }
            setOrderLocal(JSON.stringify(order))
        })
    }

    const validateAddress = () => {
        if (checked) {
            if (
                (address && !address.firstName) ||
                (address && !address.lastName) ||
                (address && !address.phoneNumber) ||
                !addressDetailGenerated
            ) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please select an address'
                })
                return false
            }
        }
        return true
    }

    const validatePayment = () => {
        if (!checked && amountPaid < orderTotals.total) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter the correct amount'
            })
            return false
        }
        return true
    }

    useUpdateEffect(() => {
        fetchAddress()
    }, [customer])

    const fetchAddress = async () => {
        if (!customer?.id) return
        const {
            payload: { items }
        } = await addressService.getAll(customer.id)
        setAddress(items[0] || null)
        if (items[0]?.id) {
            getAddress(items[0].id)
            setAddressDetailGenerated(items[0].addressDetail)
        }
    }

    const getAddress = async (id: number) => {
        const { payload } = await addressService.getById(id)
        const fullAddress: Address = {
            provinceId: payload.provinceId,
            districtId: payload.districtId,
            wardId: payload.wardId,
            province: '',
            district: '',
            address: payload.addressName
        }
        setAddress((prev) => ({
            ...prev,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phoneNumber: payload.phoneNumber
        }))
        setAddressDetail(fullAddress)
    }

    const fetchAddressesCustomer = async () => {
        if (!customer?.id) return
        const { payload: data } = await addressService.getAll(customer.id)
        const uniqueAddresses = data.items.filter(
            (value, index, self) =>
                index ===
                self.findIndex(
                    (t) =>
                        t.addressDetail === value.addressDetail &&
                        t.phoneNumber === value.phoneNumber &&
                        t.firstName === value.firstName &&
                        t.lastName === value.lastName
                )
        )
        setAddresses(uniqueAddresses)
    }

    const onOpenCustomerAddressDialog = () => {
        fetchAddressesCustomer()
        setCustomerAddressDialogVisible(true)
    }
    const handleSelectAddress = (address: AddressesResponse) => {
        setSelectedAddress(address)
        setCustomerAddressDialogVisible(false)
        if (address.id) {
            getAddress(address.id)
            setAddressDetailGenerated(address.addressDetail)
        }
    }

    const handleOrder = async () => {
        const billId = localStorage.getItem('billIdCurrent')
        if (!billId) return

        if (!validateAddress()) return
        if (!validatePayment()) return

        confirmDialog({
            message: 'Are you sure you want to proceed with this order?',
            header: 'Order Confirmation',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            accept: () => {
                CartService.getCart(billId).then(async (res: CartResponse[]) => {
                    const order: OrderRequest = {
                        customerId: customer?.id || 1,
                        orderGuid: billId,
                        addressType: checked ? 2 : -1,
                        orderId: '',
                        pickupInStore: false,
                        orderStatusId: checked ? 1 : 7,
                        paymentStatusId: PaymentStatusType.Paid,
                        paymentMethodId:
                            amountPaid === orderTotals.total ? PaymentMethodType.Cash : PaymentMethodType.Cod,
                        paymentMode: PaymentModeType.IN_STORE,
                        orderSubtotal: orderTotals.subtotal,
                        orderSubtotalDiscount: 0,
                        orderShipping: orderTotals.shippingCost,
                        orderDiscount: 0,
                        orderTotal: orderTotals.total,
                        refundedAmount: 0,
                        paidDateUtc: '',
                        billCode: 'Bill' + numberBill,
                        deliveryMode: checked ? 0 : 1,
                        orderItems: res.map((item) => ({
                            productId: item.productResponse.id,
                            orderItemGuid: '',
                            quantity: item.quantity,
                            unitPrice: item.productResponse.price,
                            priceTotal: item.quantity * item.productResponse.price,
                            discountAmount: 0,
                            originalProductCost: item.productResponse.price,
                            attributeDescription: ''
                        })),
                        addressRequest: checked
                            ? {
                                  customerId: customer?.id || 1,
                                  firstName: address.firstName,
                                  lastName: address.lastName,
                                  email: address.email,
                                  addressName: addressDetailGenerated,
                                  provinceId: addressDetail?.provinceId || '',
                                  districtId: addressDetail?.districtId || '',
                                  wardId: addressDetail?.wardId || '',
                                  phoneNumber: address.phoneNumber
                              }
                            : null
                    }

                    OrderService.createOrder(order).then(async (res) => {
                        if (res.status === 200) {
                            toast.current?.show({
                                severity: 'success',
                                summary: 'Success',
                                detail: 'Order created successfully'
                            })
                            await new Promise((resolve) => setTimeout(resolve, 1000))

                            localStorage.removeItem('billIdCurrent')
                            setCustomer(null)
                            await CartService.deleteBill(billId)
                            await fetchBill()
                        }
                    })
                })
            }
        })
    }

    const onCheckRetail = () => {
        if (customer) {
            confirmDialog({
                message: 'Are you sure you want to retail?',
                header: 'Confirmation',
                icon: 'pi pi-exclamation-triangle',
                defaultFocus: 'accept',
                accept: () => {
                    setCustomer(null)
                    setAddress({
                        firstName: '',
                        lastName: '',
                        phoneNumber: '',
                        note: '',
                        email: '',
                        company: '',
                        addressDetail: ''
                    })
                    setAddressDetail(null)
                    setAddressDetailGenerated('')
                }
            })
        }
    }

    return (
        <div className='space-y-4 w-full'>
            <div className='card'>
                <div className='flex justify-between items-center'>
                    {checked && <h3 className='text-2xl font-bold'>Shipping Information</h3>}
                    <h3></h3>
                    <h3 className='text-2xl font-bold'>Payment Summary</h3>
                </div>
                <div className='space-y-4  mt-2 flex justify-between'>
                    <div className='w-2/3'>
                        {/* TODO: Add customer details */}
                        <ConfirmDialog />

                        <>
                            <div className='flex justify-between'>
                                <div className='flex items-center justify-between gap-4 py-3'>
                                    <label className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                        Retail
                                    </label>
                                    <InputSwitch checked={!customer ? true : false} onChange={() => onCheckRetail()} />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Tooltip target='.customer-tooltip' mouseTrack mouseTrackLeft={10} />

                                    <FaUserPlus
                                        onClick={() => setCustomerDialogVisible(true)}
                                        data-pr-tooltip='Pick Customer'
                                        className='text-primary-700 text-5xl cursor-pointer customer-tooltip '
                                    />
                                    {customer != null && (
                                        <>
                                            <Tooltip target='.location-tooltip' mouseTrack mouseTrackLeft={10} />

                                            <IoLocationSharp
                                                onClick={onOpenCustomerAddressDialog}
                                                data-pr-tooltip='Pick Location'
                                                className='text-primary-700 text-5xl cursor-pointer location-tooltip'
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr className='border-collapse mt-0 border-gray-300' />
                            <div className='flex flex-wrap justify-content-between w-full'>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='firstName' className='font-medium block'>
                                        First name
                                    </label>
                                    <InputText
                                        onChange={(e) =>
                                            setAddress(
                                                (prev) =>
                                                    prev && {
                                                        ...prev,
                                                        firstName: e.target.value
                                                    }
                                            )
                                        }
                                        value={address?.firstName || ''}
                                        id='firstName'
                                        className='w-full'
                                    />
                                </div>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='lastName' className='font-medium block'>
                                        Last name
                                    </label>
                                    <InputText
                                        onChange={(e) =>
                                            setAddress(
                                                (prev) =>
                                                    prev && {
                                                        ...prev,
                                                        lastName: e.target.value
                                                    }
                                            )
                                        }
                                        value={address?.lastName || ''}
                                        id='lastName'
                                        className='w-full'
                                    />
                                </div>
                            </div>
                            <div className='flex flex-wrap justify-content-between w-full'>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='phoneNumber' className='font-medium block'>
                                        Phone number
                                    </label>
                                    <InputText
                                        onChange={(e) =>
                                            setAddress(
                                                (prev) =>
                                                    prev && {
                                                        ...prev,
                                                        phoneNumber: e.target.value
                                                    }
                                            )
                                        }
                                        value={address?.phoneNumber || ''}
                                        id='phoneNumber'
                                        className='w-full'
                                    />
                                </div>
                                <div className='field w-full md:w-[49%]'>
                                    <label htmlFor='note' className='font-medium block'>
                                        Note
                                    </label>
                                    <InputText
                                        onChange={(e) =>
                                            setAddress(
                                                (prev) =>
                                                    prev && {
                                                        ...prev,
                                                        note: e.target.value
                                                    }
                                            )
                                        }
                                        id='note'
                                        className='w-full'
                                    />
                                </div>
                            </div>
                            <div className='flex flex-wrap justify-content-between w-full gap-2'>
                                <AddressComponent
                                    provinces={provinces || []}
                                    submitted={false}
                                    onAddressChange={handleGetAddress}
                                    addressDetail={addressDetail || undefined}
                                />
                            </div>
                            <div className='field w-full'>
                                <label htmlFor='addressName' className='font-medium block'>
                                    Address detail
                                </label>
                                <InputText
                                    onChange={(e) => setAddressDetailGenerated(e.target.value)}
                                    value={addressDetailGenerated || ''}
                                    id='addressName'
                                    className='w-full'
                                />
                            </div>
                        </>
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
                                        <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                            Coupon
                                        </dt>
                                        <dt className='text-base font-normal text-gray-500 dark:text-gray-400 w-full'>
                                            <InputText className='w-3/5 me-14' />
                                            <Button label='Apply' />
                                        </dt>
                                    </dl>

                                    <dl className='flex items-center justify-between gap-4 py-3'>
                                        <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                            Subtotal
                                        </dt>
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
                                        <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                            Discount
                                        </dt>
                                        <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                            ${orderTotals.shippingCost.toFixed(2)}
                                        </dd>
                                    </dl>
                                    <dl className='flex items-center justify-between gap-4 py-3'>
                                        <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                            Total
                                        </dt>
                                        <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                            ${orderTotals.total.toFixed(2)}
                                        </dd>
                                    </dl>
                                    <dl className='flex items-center justify-between gap-4 py-3'>
                                        <dt className='text-base font-normal flex items-center gap-2 text-gray-500 dark:text-gray-400'>
                                            Customer Payment{' '}
                                            <FaIdCard
                                                className='text-primary-700 text-5xl cursor-pointer'
                                                onClick={handlePayment}
                                            />
                                        </dt>
                                        <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                            ${amountPaid.toFixed(2)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                            <div className='space-y-3'>
                                <button
                                    type='submit'
                                    className='flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
                                    onClick={handleOrder}
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PaymentDialog
                visible={visible}
                setVisible={setVisible}
                totalAmount={orderTotals.total}
                setAmountPaid={setAmountPaid}
                amountPaid={amountPaid}
            />
            <CustomerDialog
                setCustomer={setCustomer}
                visible={customerDialogVisible}
                setVisible={setCustomerDialogVisible}
            />
            <Toast ref={toast} />
            <CustomerAddressDialog
                visible={customerAddressDialogVisible}
                setVisible={setCustomerAddressDialogVisible}
                addresses={addresses}
                setSelectedAddress={setSelectedAddress}
                selectedAddress={selectedAddress}
                onSelectAddress={handleSelectAddress}
            />
        </div>
    )
}
