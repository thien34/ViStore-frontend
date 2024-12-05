'use client'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse } from '@/interface/Product'
import { Button } from 'primereact/button'
import Link from 'next/link'
type Props = {
    products: ProductResponse[]
}

function ProductList({ products }: Props) {
    return (
        <div className='card '>
            <div className='flex justify-content-between mb-5'>
                <h2>Danh Sách Sản Phẩm</h2>
                <Link href='/admin/products/add'>
                    <Button label='Thêm Mới' />
                </Link>
            </div>
            <DataTable
                value={products}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: '50rem' }}
                paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
            >
                <Column field='name' header='Tên Sản Phẩm'></Column>
                <Column field='categoryName' header='Danh Mục'></Column>
                <Column field='manufacturerName' header='Nhà Sản Xuất'></Column>

                <Column
                    header='Thao Tác'
                    body={(rowData) => (
                        <Link href={`/admin/products/${rowData.id}`}>
                            <Button label='Chỉnh Sửa' />
                        </Link>
                    )}
                />
            </DataTable>
        </div>
    )
}

export default ProductList
