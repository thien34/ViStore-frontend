import { BirthdayVoucherUpdate, Voucher } from '@/interface/voucher.interface'
import http from '@/libs/http'
class VoucherService {
    private basePath = '/api/admin/vouchers'

    async getAll() {
        const response = await http.get<Voucher[]>(`${this.basePath}?discountTypeId=ASSIGNED_TO_ORDER_TOTAL`)
        return response.payload
    }

    async getAllIsPublished() {
        const response = await http.get<Voucher[]>(
            `${this.basePath}?discountTypeId=ASSIGNED_TO_ORDER_TOTAL&isPublished=true&status=ACTIVE`
        )
        return response.payload
    }

    async validateCoupons(couponCodes: string[]) {
        const path = `/validate-coupons`
        const data = { couponCodes }
        const response = await http.post(path, data)
        return response.payload
    }

    async getById(id: number) {
        const response = await http.get<Voucher>(`${this.basePath}/${id}`)
        return response
    }

    async create(voucher: Omit<Voucher, 'id'>): Promise<Voucher> {
        const response = await http.post<Voucher>(`${this.basePath}`, voucher)
        return response.payload
    }

    async update(id: number, voucher: Omit<Voucher, 'id'>) {
        const response = await http.put<Voucher>(`${this.basePath}/${id}`, voucher)
        return response.payload
    }

    async getDefaultBirthdayVoucher() {
        const response = await http.get<Voucher>(`${this.basePath}/default-birthday`)
        return response.payload
    }

    async updateDefaultBirthdayVoucher(data: BirthdayVoucherUpdate) {
        const response = await http.put<Voucher>(`${this.basePath}/default-birthday-discount`, data)
        return response.payload
    }
}

const voucherService = new VoucherService()
export default voucherService
