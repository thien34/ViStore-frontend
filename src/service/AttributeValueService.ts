import { AttributeValue } from '@/interface/attributeValue.interface.';
import http from '@/libs/http';

class AttributeValueService {
    private static basePath = '/api/admin/attribute-values';

    static async getAttributeValues(productId: number, attributeId?: number) {
        const queryParams = new URLSearchParams();
        queryParams.append('productId', productId.toString());
        if (attributeId !== undefined) {
            queryParams.append('attributeId', attributeId.toString());
        }

        const response = await http.get<AttributeValue[]>(`${this.basePath}/?${queryParams.toString()}`);

        return response;
    }
}

export default AttributeValueService;
