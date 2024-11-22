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
    maxDiscountAmount: number //số tiền được giảm tối đa khi sử dụng mã giảm giá này
    minOderAmount: number //số tiền tối thiểu mà mã giảm giá này được áp dụng
    isPublished: boolean
    perCustomerLimit: number
}

export interface Vouchers {
    items: Voucher[]
}

export interface VouchersPagingResponse {
    data: Vouchers
}
