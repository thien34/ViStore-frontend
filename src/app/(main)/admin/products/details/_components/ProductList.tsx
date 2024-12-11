'use client'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse } from '@/interface/Product'
import { Button } from 'primereact/button'
import Link from 'next/link'
import { Image } from 'primereact/image'
import { InputText } from 'primereact/inputtext'
import { useEffect, useState } from 'react'
type Props = {
    products: ProductResponse[]
}

function ProductList({ products }: Props) {
    const [filterData, setFilterData] = useState<ProductResponse[]>(products)
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.trim().toLowerCase()
        if (query === '') {
            setFilterData(products)
        } else {
            const filtered = products.filter(
                (item) =>
                    item.categoryName?.toLowerCase().includes(query) ||
                    item.manufacturerName?.toLowerCase().includes(query) ||
                    item.name?.toLowerCase().includes(query)
            )
            setFilterData(filtered)
        }
    }

    useEffect(() => {
        setFilterData(products)
    }, [products])
    const indexBodyTemplate = (_: ProductResponse, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }
    return (
        <div className='card '>
            <div className='flex justify-content-between mb-1'>
                <h2>Danh Sách Sản Phẩm</h2>
                <Link href='/admin/products/add'>
                    <Button label='Thêm Mới' />
                </Link>
            </div>
            <div className='p-inputgroup flex-1 mb-2'>
                <span className='p-inputgroup-addon'>
                    <i className='pi pi-search'></i>
                </span>
                <InputText
                    placeholder='Tìm kiếm theo Tên sản phẩm, danh mục , nhà sản xuất'
                    className='w-full'
                    onChange={handleSearch}
                />
            </div>
            <DataTable
                value={filterData}
                paginator
                rows={5}
                removableSort
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: '50rem' }}
                paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} sản phẩm'
            >
                <Column
                    header='#'
                    body={indexBodyTemplate}
                    headerStyle={{
                        width: '4rem'
                    }}
                />
                <Column
                    header='Ảnh'
                    body={(rowData) => (
                        <Image
                            src={rowData.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                            width='70px'
                            height='70px'
                            alt={rowData.name ?? 'Product Image'}
                            onError={(e) =>
                                ((e.target as HTMLImageElement).src =
                                    '/demo/images/default/—Pngtree—sneakers_3989154.png')
                            }
                        />
                    )}
                />
                <Column field='name' header='Tên Sản Phẩm'></Column>
                <Column field='categoryName' header='Danh Mục'></Column>
                <Column field='manufacturerName' header='Nhà Sản Xuất'></Column>
                <Column sortable align='center' field='quantity' header='Số Lượng' />

                <Column
                    header='Thao Tác'
                    body={(rowData) => (
                        <Link href={`/admin/products/${rowData.id}`}>
                            <Button icon='pi pi-pencil' rounded outlined />
                        </Link>
                    )}
                />
            </DataTable>
        </div>
    )
}

export default ProductList
