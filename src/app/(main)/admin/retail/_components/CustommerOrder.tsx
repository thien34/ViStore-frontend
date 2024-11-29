import { Button } from 'primereact/button'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { useRef, useState } from 'react'
import { FaClipboard, FaClone, FaIdCard, FaUserPlus } from 'react-icons/fa'
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
import { Sidebar } from 'primereact/sidebar'
import { Voucher } from '@/interface/voucher.interface'
import voucherService from '@/service/voucher.service'
import { Image } from 'primereact/image'
import dayjs from 'dayjs'
import axios from 'axios'
import { AutoComplete } from 'primereact/autocomplete'

interface CustommerOrderProps {
    orderTotals: {
        subtotal: number
        shippingCost: number
        tax: number
        total: number
        discount: number
    }
    totalWeight: number
    fetchBill: () => void
    numberBill: number
}
interface CustomIsApplicable {
    isApplicable: boolean
}

export default function CustommerOrder({ orderTotals, fetchBill, numberBill }: CustommerOrderProps) {
    const [checked, setChecked] = useState<boolean>(true)
    const [provinces, setProvinces] = useState<Province[]>([])
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [visible, setVisible] = useState<boolean>(false)
    const [amountPaid, setAmountPaid] = useState<number>(0)
    const [customerDialogVisible, setCustomerDialogVisible] = useState<boolean>(false)
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [visibleRight, setVisibleRight] = useState<boolean>(false)
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
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const [copiedVoucherCode, setCopiedVoucherCode] = useState<string>('')
    const [, setOrderLocal] = useLocalStorage('orderLocal', '')
    const [isOpen, setIsOpen] = useState(false)
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
    const [couponCode, setCouponCode] = useState('')
    const [couponCodes, setCouponCodes] = useState<string[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [validVouchers, setValidVouchers] = useState([])
    const [totalDiscount, setTotalDiscount] = useState<number>(0)
    const handleOpen = (voucher: Voucher) => {
        setSelectedVoucher(voucher)
        setIsOpen(true)
    }
    const validateCouponCode = async () => {
        setLoading(true)
        setMessage('')
        try {
            if (!customer?.email) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'You cannot apply more than one voucher without selecting a customer.'
                })
                return
            }

            const response = await axios.post('http://localhost:8080/api/admin/vouchers/validate-coupons', {
                subTotal: orderTotals.subtotal,
                email: customer?.email,
                couponCodes: couponCodes
            })
            const { totalDiscount, voucherResponses } = response.data
            setTotalDiscount(totalDiscount || 0)
            const validVoucherList = voucherResponses.filter((voucher: CustomIsApplicable) => voucher.isApplicable)
            setValidVouchers(validVoucherList)

            if (validVoucherList.length === 0) {
                setMessage('No valid vouchers found.')
            }
        } catch (error) {
            console.error('Error validating coupon:', error)
            setMessage('Error validating coupon. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && couponCode.trim() !== '') {
            setCouponCodes((prevCoupons) => [...prevCoupons, couponCode.trim().toUpperCase()])
            setCouponCode('')
        }
    }
    const handleRemoveValidVoucher = (index: number) => {
        setValidVouchers((prevVouchers) => prevVouchers.filter((_, i) => i !== index))
    }

    const handleRemoveCouponCode = (index: number) => {
        setCouponCodes((prevCoupons) => prevCoupons.filter((_, i) => i !== index))
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
        if (value.length > 18) {
            value = value.slice(0, 18)
        }
        setCouponCode(value)
    }

    const handleClose = () => {
        setSelectedVoucher(null)
        setIsOpen(false)
    }

    const fetchProvinces = async () => {
        const { payload: provinces } = await provinceService.getAll()
        setProvinces(provinces)
    }

    const fetchVouchers = async () => {
        const vouchersData = await voucherService.getAllIsPublished()
        setVouchers(vouchersData)
    }
    useMountEffect(() => {
        fetchProvinces()
        fetchVouchers()
    })
    const handleCopyVoucher = (couponCode: string) => {
        navigator.clipboard.writeText(couponCode).then(() => {
            setIsCopied(true)
            setCopiedVoucherCode(couponCode)
            setTimeout(() => {
                setIsCopied(false)
            }, 2000)
        })
    }
    const handleApplyVoucher = () => {
        if (!customer) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Please select a customer before adding a voucher.'
            })
            return
        }
        if (validVouchers.length > 0) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'You cannot apply more than one voucher without selecting a customer.'
            })
            return
        }
    }

    const handleGetAddress = async (addressRequest: Address) => {
        setAddressDetail(addressRequest)
    }

    const handlePayment = () => {
        if (!validateAddress()) return
        if (!validateDiscount()) return
        setVisible(true)
        const billId = localStorage.getItem('billIdCurrent')
        if (!billId) return
        const validVoucherIds = validVouchers.map((voucher: Voucher) => voucher.id).filter((id) => id !== undefined)
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
                    : null,
                idVouchers: validVoucherIds
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
    const validateDiscount = () => {
        if (validVouchers.length > 0 && !customer) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'You cannot apply more than one voucher without selecting a customer.'
            })
            return
        }
        if (validVouchers.length > 2) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Combination vouchers can only combine a maximum of 2 vouchers.'
            })
            return
        }

        return true
    }
    const formatDate = (dateString: string | undefined): string => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm')
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
        if (!validateDiscount()) return
        if (!validatePayment()) return
        const validVoucherIds = validVouchers
            .map((voucher: Voucher) => voucher.id)
            .filter((id): id is number => id !== undefined)

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
                            : null,
                        idVouchers: validVoucherIds
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
                                    {customer != null && checked && (
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
                                {checked && (
                                    <AddressComponent
                                        provinces={provinces || []}
                                        submitted={false}
                                        onAddressChange={handleGetAddress}
                                        addressDetail={addressDetail || undefined}
                                    />
                                )}
                            </div>
                            {checked && (
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
                            )}
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
                                        <div className='flex items-center justify-center gap-3'>
                                            <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                                Coupon
                                            </dt>
                                            <div className='flex items-center gap-3'>
                                                <AutoComplete
                                                    id='couponCode'
                                                    className='w-4/5'
                                                    value={couponCode}
                                                    onInput={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                    suggestions={[]}
                                                    completeMethod={() => {}}
                                                    tooltip='Enter coupon codes and press Enter'
                                                    placeholder='Enter coupon codes'
                                                    tooltipOptions={{ position: 'top' }}
                                                />
                                                <Button
                                                    icon='pi pi-thumbtack'
                                                    onClick={validateCouponCode}
                                                    loading={loading}
                                                    disabled={loading || couponCodes.length === 0}
                                                />
                                            </div>
                                        </div>

                                        <Button onClick={() => setVisibleRight(true)} icon='pi pi-ticket'></Button>
                                        <Sidebar
                                            visible={visibleRight}
                                            position='right'
                                            onHide={() => setVisibleRight(false)}
                                            style={{ width: '400px' }}
                                        >
                                            <h2 className='text-xl font-semibold mb-4'>List Voucher</h2>
                                            <div className='space-y-4 p-4'>
                                                {vouchers.map((voucher) => (
                                                    <div
                                                        key={voucher.id}
                                                        className='bg-white p-4 rounded-lg shadow-lg border border-gray-200'
                                                    >
                                                        <h3 className='text-lg font-medium text-gray-800'>
                                                            {voucher.name}
                                                        </h3>
                                                        <p className='text-sm text-gray-600'>
                                                            Discount code:{' '}
                                                            <span className='font-bold text-black'>
                                                                {voucher.couponCode}
                                                            </span>
                                                        </p>
                                                        <p className='text-sm text-gray-600'>
                                                            Reduce:{' '}
                                                            {voucher.discountAmount !== null
                                                                ? `$${voucher.discountAmount}`
                                                                : `${voucher.discountPercentage}%`}
                                                        </p>
                                                        <p className='text-sm text-gray-600'>
                                                            Applicable to orders from ${voucher.minOderAmount}
                                                        </p>
                                                        {voucher.maxDiscountAmount && (
                                                            <p className='text-sm text-gray-600'>
                                                                Maximum reduction: ${voucher.maxDiscountAmount}
                                                            </p>
                                                        )}
                                                        <div className='mt-4 flex justify-between items-center'>
                                                            <button
                                                                onClick={() =>
                                                                    voucher.couponCode
                                                                        ? handleCopyVoucher(voucher.couponCode)
                                                                        : handleApplyVoucher()
                                                                }
                                                                className={`flex items-center gap-2 font-bold py-2 px-4 rounded transition duration-200 ${
                                                                    isCopied && copiedVoucherCode === voucher.couponCode
                                                                        ? 'bg-violet-900 text-[14px] text-white cursor-not-allowed opacity-70'
                                                                        : 'bg-[#4F46E5] text-[14px] text-white hover:bg-[#4F46E5]'
                                                                }`}
                                                                disabled={
                                                                    isCopied && copiedVoucherCode === voucher.couponCode
                                                                }
                                                            >
                                                                {voucher.couponCode ? (
                                                                    <>
                                                                        {isCopied &&
                                                                        copiedVoucherCode === voucher.couponCode ? (
                                                                            <FaClone className='text-white' />
                                                                        ) : (
                                                                            <FaClipboard className='text-white' />
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span>Apply</span>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpen(voucher)}
                                                                className='text-blue-600 text-sm hover:underline'
                                                            >
                                                                Condition
                                                            </button>

                                                            {isOpen && selectedVoucher && (
                                                                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30'>
                                                                    <div className='bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden'>
                                                                        <div className='bg-orange-500 text-white p-4'>
                                                                            <div className='flex items-center gap-2'>
                                                                                <div className='p-2 rounded'>
                                                                                    <Image
                                                                                        src='\demo\images\default\coupon_3624639.png'
                                                                                        alt='Image'
                                                                                        width='50'
                                                                                        preview
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <p className='font-semibold text-lg'>
                                                                                        {selectedVoucher.name}
                                                                                    </p>
                                                                                    <p className='text-sm'>
                                                                                        Minimum Application $
                                                                                        {selectedVoucher.minOderAmount}
                                                                                        .00
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <p className='text-xs mt-2 flex items-center gap-2'>
                                                                                <span className='bg-white text-orange-500 px-2 py-1 rounded-full'>
                                                                                    {(() => {
                                                                                        const now = new Date()
                                                                                        const startDate =
                                                                                            selectedVoucher.startDateUtc
                                                                                                ? new Date(
                                                                                                      selectedVoucher.startDateUtc
                                                                                                  )
                                                                                                : null
                                                                                        const endDate =
                                                                                            selectedVoucher.endDateUtc
                                                                                                ? new Date(
                                                                                                      selectedVoucher.endDateUtc
                                                                                                  )
                                                                                                : null
                                                                                        if (
                                                                                            startDate &&
                                                                                            now < startDate
                                                                                        ) {
                                                                                            const timeUntilStart =
                                                                                                Math.ceil(
                                                                                                    (startDate.getTime() -
                                                                                                        now.getTime()) /
                                                                                                        (1000 *
                                                                                                            60 *
                                                                                                            60 *
                                                                                                            24)
                                                                                                )
                                                                                            return `Take effect later ${timeUntilStart} days`
                                                                                        } else if (
                                                                                            startDate &&
                                                                                            endDate &&
                                                                                            now >= startDate &&
                                                                                            now <= endDate
                                                                                        ) {
                                                                                            const timeUntilEnd =
                                                                                                Math.ceil(
                                                                                                    (endDate.getTime() -
                                                                                                        now.getTime()) /
                                                                                                        (1000 *
                                                                                                            60 *
                                                                                                            60 *
                                                                                                            24)
                                                                                                )
                                                                                            return `Valid for ${timeUntilEnd} days`
                                                                                        } else {
                                                                                            return 'Expired'
                                                                                        }
                                                                                    })()}
                                                                                </span>
                                                                            </p>
                                                                        </div>
                                                                        <div className='p-4'>
                                                                            <div className='mb-4'>
                                                                                <p className='font-semibold text-gray-700'>
                                                                                    Code expiration date
                                                                                </p>
                                                                                <p className='text-sm text-gray-600'>
                                                                                    {formatDate(
                                                                                        selectedVoucher.startDateUtc
                                                                                    )}{' '}
                                                                                    -{' '}
                                                                                    {formatDate(
                                                                                        selectedVoucher.endDateUtc
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <div className='mb-4'>
                                                                                <p className='font-semibold text-gray-700'>
                                                                                    Endow
                                                                                </p>
                                                                                <p className='text-sm text-gray-600'>
                                                                                    Limited number of uses. Hurry up or
                                                                                    miss out! Discount{' '}
                                                                                    {selectedVoucher.discountPercentage ? (
                                                                                        <>
                                                                                            {
                                                                                                selectedVoucher.discountPercentage
                                                                                            }{' '}
                                                                                            %
                                                                                            {selectedVoucher.maxDiscountAmount && (
                                                                                                <>
                                                                                                    {' '}
                                                                                                    - Maximum reduction
                                                                                                    $
                                                                                                    {
                                                                                                        selectedVoucher.maxDiscountAmount
                                                                                                    }
                                                                                                </>
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        `$${selectedVoucher.discountAmount}`
                                                                                    )}{' '}
                                                                                    Minimum Application $
                                                                                    {selectedVoucher.minOderAmount}.
                                                                                </p>
                                                                            </div>
                                                                            <div className='mb-4'>
                                                                                <p className='font-semibold text-gray-700'>
                                                                                    Applicable to products
                                                                                </p>
                                                                                <p className='text-sm text-gray-600'>
                                                                                    Only applicable on App for certain
                                                                                    products and certain users
                                                                                    participating in certain promotions.
                                                                                </p>
                                                                                <ul className='list-disc pl-5 text-sm text-gray-600'>
                                                                                    <li>
                                                                                        Among the selected products,
                                                                                        there are some products that are
                                                                                        not allowed to run promotions
                                                                                        according to the provisions of
                                                                                        the law.
                                                                                    </li>
                                                                                    {selectedVoucher.isPublished ? (
                                                                                        <li>
                                                                                            This product applies to all
                                                                                            eligible orders.
                                                                                        </li>
                                                                                    ) : (
                                                                                        <li>
                                                                                            This is a members exclusive
                                                                                            product.
                                                                                        </li>
                                                                                    )}
                                                                                </ul>
                                                                            </div>

                                                                            <div className='mb-4'>
                                                                                <p className='font-semibold text-gray-700'>
                                                                                    Pay
                                                                                </p>
                                                                                <p className='text-sm text-gray-600'>
                                                                                    All forms of payment
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className='bg-gray-100 px-4 py-3 flex justify-end'>
                                                                            <button
                                                                                onClick={handleClose}
                                                                                className='bg-red-500 text-white font-medium px-4 py-2 rounded-md hover:bg-red-600 transition'
                                                                            >
                                                                                Close
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Sidebar>
                                    </dl>
                                    {validVouchers.length > 0 || couponCodes.length > 0 || message ? (
                                        <dl className='bg-white p-4 rounded-md shadow-sm max-w-md mx-auto mt-3 border border-gray-200'>
                                            {message && (
                                                <div className='mt-2 text-xs text-red-600 font-medium border-l-4 border-red-600 pl-2 py-1 bg-red-50 rounded-sm'>
                                                    {message}
                                                </div>
                                            )}

                                            {validVouchers.length > 0 && (
                                                <div className='mt-3'>
                                                    <h3 className='text-sm font-semibold text-green-700 mb-2'>
                                                        Valid Vouchers:
                                                    </h3>
                                                    <ul className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-green-200 rounded-md p-2'>
                                                        {validVouchers.map((voucher: Voucher, index) => (
                                                            <li
                                                                key={index}
                                                                className='flex items-center justify-between px-2 py-1 rounded-md border border-green-500 bg-green-50 hover:bg-green-100 transition-colors text-xs'
                                                            >
                                                                <span className='font-semibold text-green-700'>
                                                                    {voucher.couponCode}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRemoveValidVoucher(index)}
                                                                    className='text-red-500 hover:text-red-700 ml-1'
                                                                >
                                                                    ×
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {couponCodes.length > 0 && (
                                                <div className='mt-4'>
                                                    <h3 className='text-sm font-semibold text-blue-700 mb-2'>
                                                        Entered Coupon Codes:
                                                    </h3>
                                                    <ul className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2'>
                                                        {couponCodes.map((code, index) => (
                                                            <li
                                                                key={index}
                                                                className='flex items-center justify-between px-2 py-1 rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors text-xs'
                                                            >
                                                                <span className='font-medium text-gray-700'>
                                                                    {code}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleRemoveCouponCode(index)}
                                                                    className='text-red-500 hover:text-red-700 ml-1'
                                                                >
                                                                    ×
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {validVouchers.length === 0 && couponCodes.length === 0 && (
                                                <div className='mt-3 text-xs text-gray-500 text-center font-medium'>
                                                    No discount applied.
                                                </div>
                                            )}
                                        </dl>
                                    ) : null}

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
                                            ${totalDiscount.toFixed(2)}
                                        </dd>
                                    </dl>
                                    <dl className='flex items-center justify-between gap-4 py-3'>
                                        <dt className='text-base font-normal text-gray-500 dark:text-gray-400'>
                                            Total
                                        </dt>
                                        <dd className='text-base font-medium text-gray-900 dark:text-white'>
                                            $
                                            {(
                                                orderTotals.subtotal +
                                                orderTotals.shippingCost +
                                                orderTotals.tax -
                                                totalDiscount
                                            ).toFixed(2)}
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
