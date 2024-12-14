export interface Voucher {
    id?: number
    name: string
    comment: string
    discountTypeId: number
    usePercentage: boolean
    discountPercentage: number
    discountAmount: number
    limitationTimes: number
    startDateUtc?: string
    endDateUtc?: string
    selectedCustomerIds: number[]
    status: string
    requiresCouponCode: boolean
    isCumulative : boolean
    couponCode: string
    discountLimitationId: number
    maxDiscountAmount: number
    minOderAmount: number
    isPublished: boolean
    perCustomerLimit: number
    usageCount: number
}

export interface Vouchers {
    items: Voucher[]
}

export interface VouchersPagingResponse {
    data: Vouchers
}

export interface BirthdayVoucherUpdate {
    usePercentage: boolean
    discountAmount: number
    discountPercentage: number
    maxDiscountAmount: number | null
    isCumulative: boolean
    limitationTimes: number
    perCustomerLimit: number
    minOrderAmount: number
}
