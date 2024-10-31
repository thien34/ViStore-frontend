import http from '@/libs/http'

class PictureService {
    private static basePath = '/api/admin/picture'
    static async savePicture(image: File): Promise<string> {
        const formData = new FormData()
        formData.append('image', image)

        const response = await http.postFromData<string>(`${this.basePath}/upload-image`, formData)

        return response.payload
    }
}

export default PictureService
