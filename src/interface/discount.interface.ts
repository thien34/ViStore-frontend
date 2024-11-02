interface Promotion {
    isActive: boolean;
    name: string;
    comment: string;
    discountTypeId: number;
    usePercentage: boolean;
    discountPercentage?: number | null;
    startDateUtc?: string;
    endDateUtc?: string;
    selectedProductVariantIds: number[];
}

export interface Promotions {
    items: Promotion[];
}

export interface PromotionsPagingResponse {
    payload: Promotions;
}
