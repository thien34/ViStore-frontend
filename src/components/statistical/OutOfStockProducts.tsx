import React from 'react'
import { Card } from 'primereact/card'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import Image from 'next/image'
import { formatCurrency } from '@/utils/format'
import { OutOfStockProduct } from '@/interface/statistical.interface'

const OutOfStockProducts = ({ products }: { products: OutOfStockProduct[] }) => {
    return (
        <Card title='Sản phẩm hết hàng' className='p-4'>
            <DataTable
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
                value={products}
            >
                <Column
                    header='Ảnh'
                    field='anh'
                    align={'center'}
                    bodyStyle={{ width: '80px', textAlign: 'center' }}
                    body={(rowData) => (
                        <Image
                            src={rowData.anh || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                            width={50}
                            height={50}
                            className='rounded-lg'
                            alt={rowData.name ?? 'Product Image'}
                            onError={(e) =>
                                ((e.target as HTMLImageElement).src =
                                    '/demo/images/default/—Pngtree—sneakers_3989154.png')
                            }
                        />
                    )}
                />
                <Column field='tenSanPham' header='Tên sản phẩm' />
                <Column field='soLuong' header='Số lượng' body={(rowData) => rowData.soLuong.toLocaleString()} />
                <Column field='giaTien' header='Giá tiền' body={(rowData) => `${formatCurrency(rowData.giaTien)}`} />
            </DataTable>
        </Card>
    )
}

export default OutOfStockProducts
