export interface Promotion {
    id?: number
    isActive: boolean
    name: string
    comment: string
    discountTypeId: number
    usePercentage: boolean
    discountPercentage?: number | null
    startDateUtc?: string
    endDateUtc?: string
    selectedProductVariantIds: number[]
    status: string
}

export interface Promotions {
    items: Promotion[]
}

export interface PromotionsPagingResponse {
    payload: Promotions
}
