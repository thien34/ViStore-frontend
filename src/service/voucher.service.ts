import { Voucher } from '@/interface/voucher.interface'
import http from '@/libs/http'
import axios from 'axios';
class VoucherService {
    private basePath = 'http://localhost:8080/api/admin/vouchers'
    private path = '/api/admin/vouchers'

    async getAll() {
        const response = await axios.get<{ data: Voucher[] }>(this.basePath + `?discountTypeId=ASSIGNED_TO_ORDER_TOTAL`);
        return response.data.data;
    }
    async getById(id: number) {
        const response = await http.get<Voucher>(`${this.basePath}/${id}`)
        return response
    }

    async create(voucher: Omit<Voucher, 'id'>): Promise<Voucher> {
        const response = await http.post<Voucher>(`${this.path}`, voucher)
        return response.payload
    }

    async update(id: number, voucher: Omit<Voucher, 'id'>) {
        const response = await http.put<Voucher>(`${this.basePath}/${id}`, voucher)
        return response.payload
    }
    async validateCoupons(couponCodes: string[], subTotal: number, email: string) {
        const path = `/validate-coupons?subTotal=${subTotal}&email=${email}`;
        const data = { couponCodes };
        const response = await http.post(path, data);
        return response.payload;
    }
}

const voucherService = new VoucherService()
export default voucherService
