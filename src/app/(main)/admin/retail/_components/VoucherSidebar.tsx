import { Sidebar } from 'primereact/sidebar'
import { Image } from 'primereact/image'
import { FaClipboard, FaClone } from 'react-icons/fa'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Voucher } from '@/interface/voucher.interface'
import voucherService from '@/service/voucher.service'
import { useMountEffect } from 'primereact/hooks'
import { Customer } from '@/interface/customer.interface'

interface VoucherSidebarProps {
    visibleRight: boolean
    setVisibleRight: (visibleRight: boolean) => void
    customer: Customer | null
    handleApplyVoucher: () => void
}

const VoucherSidebar = ({ visibleRight, setVisibleRight, handleApplyVoucher }: VoucherSidebarProps) => {
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
    const [copiedVoucherCode, setCopiedVoucherCode] = useState<string>('')
    const [isOpen, setIsOpen] = useState(false)
    const [isCopied, setIsCopied] = useState<boolean>(false)
    const [vouchers, setVouchers] = useState<Voucher[]>([])

    const fetchVouchers = async () => {
        const vouchersData = await voucherService.getAllIsPublished()
        const filteredVouchers = vouchersData.filter((voucher: Voucher) => voucher.usageCount > 0)
        setVouchers(filteredVouchers)
    }

    useMountEffect(() => {
        fetchVouchers()
    })

    const handleClose = () => {
        setSelectedVoucher(null)
        setIsOpen(false)
    }

    const handleOpen = (voucher: Voucher) => {
        setSelectedVoucher(voucher)
        setIsOpen(true)
    }

    const handleCopyVoucher = (couponCode: string) => {
        navigator.clipboard.writeText(couponCode).then(() => {
            setIsCopied(true)
            setCopiedVoucherCode(couponCode)
            setTimeout(() => {
                setIsCopied(false)
            }, 2000)
        })
    }

    const formatDate = (dateString: string | undefined): string => {
        return dayjs(dateString).format('DD/MM/YYYY HH:mm')
    }

    return (
        <>
            <Sidebar
                visible={visibleRight}
                position='right'
                onHide={() => setVisibleRight(false)}
                style={{ width: '400px' }}
            >
                <h2 className='text-xl font-semibold mb-4'>List Voucher</h2>
                <div className='space-y-4 p-4'>
                    {vouchers.map((voucher) => (
                        <div key={voucher.id} className='bg-white p-4 rounded-lg shadow-lg border border-gray-200'>
                            <h3 className='text-lg font-medium text-gray-800'>{voucher.name}</h3>
                            <p className='text-sm text-gray-600'>
                                Discount code: <span className='font-bold text-black'>{voucher.couponCode}</span>
                            </p>
                            <p className='text-sm text-gray-600'>
                                Reduce:{' '}
                                {voucher.discountAmount !== null
                                    ? `$${voucher.discountAmount}`
                                    : `${voucher.discountPercentage}%`}
                            </p>
                            <p className='text-sm text-gray-600'>Applicable to orders from ${voucher.minOderAmount}</p>
                            {voucher.maxDiscountAmount && (
                                <p className='text-sm text-gray-600'>Maximum reduction: ${voucher.maxDiscountAmount}</p>
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
                                    disabled={isCopied && copiedVoucherCode === voucher.couponCode}
                                >
                                    {voucher.couponCode ? (
                                        <>
                                            {isCopied && copiedVoucherCode === voucher.couponCode ? (
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
                                                    <div className='flex-grow'>
                                                        <p className='font-semibold text-lg'>{selectedVoucher.name}</p>
                                                        <p className='text-sm'>
                                                            Minimum Application ${selectedVoucher.minOderAmount}.00
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className='flex gap-4 items-center'>
                                                    <p className='text-xs mt-2 flex items-center gap-2'>
                                                        <span className='bg-white text-orange-500 px-2 py-1 rounded-full'>
                                                            {(() => {
                                                                const now = new Date()
                                                                const startDate = selectedVoucher.startDateUtc
                                                                    ? new Date(selectedVoucher.startDateUtc)
                                                                    : null
                                                                const endDate = selectedVoucher.endDateUtc
                                                                    ? new Date(selectedVoucher.endDateUtc)
                                                                    : null
                                                                if (startDate && now < startDate) {
                                                                    const timeUntilStart = Math.ceil(
                                                                        (startDate.getTime() - now.getTime()) /
                                                                            (1000 * 60 * 60 * 24)
                                                                    )
                                                                    return `Take effect later ${timeUntilStart} days`
                                                                } else if (
                                                                    startDate &&
                                                                    endDate &&
                                                                    now >= startDate &&
                                                                    now <= endDate
                                                                ) {
                                                                    const timeUntilEnd = Math.ceil(
                                                                        (endDate.getTime() - now.getTime()) /
                                                                            (1000 * 60 * 60 * 24)
                                                                    )
                                                                    return `Valid for ${timeUntilEnd} days`
                                                                } else {
                                                                    return 'Expired'
                                                                }
                                                            })()}
                                                        </span>
                                                        <span className='bg-white text-orange-500 px-2 py-1 rounded-full'>
                                                            {selectedVoucher.isCumulative
                                                                ? 'Cumulative'
                                                                : 'Non-cumulative'}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='p-4'>
                                                <div className='mb-4'>
                                                    <p className='font-semibold text-gray-700'>Code expiration date</p>
                                                    <p className='text-sm text-gray-600'>
                                                        {formatDate(selectedVoucher.startDateUtc)} -{' '}
                                                        {formatDate(selectedVoucher.endDateUtc)}
                                                    </p>
                                                </div>
                                                <div className='mb-4'>
                                                    <p className='font-semibold text-gray-700'>Endow</p>
                                                    <p className='text-sm text-gray-600'>
                                                        Limited number of uses. Hurry up or miss out! Discount{' '}
                                                        {selectedVoucher.discountPercentage ? (
                                                            <>
                                                                {selectedVoucher.discountPercentage} %
                                                                {selectedVoucher.maxDiscountAmount && (
                                                                    <>
                                                                        {' '}
                                                                        - Maximum reduction $
                                                                        {selectedVoucher.maxDiscountAmount}
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            `$${selectedVoucher.discountAmount}`
                                                        )}{' '}
                                                        Minimum Application ${selectedVoucher.minOderAmount}.
                                                    </p>
                                                </div>
                                                <div className='mb-4'>
                                                    <p className='font-semibold text-gray-700'>
                                                        Applicable to products
                                                    </p>
                                                    <p className='text-sm text-gray-600'>
                                                        Only applicable on App for certain products and certain users
                                                        participating in certain promotions.
                                                    </p>
                                                    <ul className='list-disc pl-5 text-sm text-gray-600'>
                                                        <li>
                                                            Among the selected products, there are some products that
                                                            are not allowed to run promotions according to the
                                                            provisions of the law.
                                                        </li>
                                                        {selectedVoucher.isPublished ? (
                                                            <li>This product applies to all eligible orders.</li>
                                                        ) : (
                                                            <li>This is a members exclusive product.</li>
                                                        )}
                                                    </ul>
                                                </div>

                                                <div className='mb-4'>
                                                    <p className='font-semibold text-gray-700'>Pay</p>
                                                    <p className='text-sm text-gray-600'>All forms of payment</p>
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
        </>
    )
}

export default VoucherSidebar
