'use client'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { ProductResponse } from '@/interface/Product'
import { Button } from 'primereact/button'
import { useRouter } from 'next/navigation'

type Props = {
    products: ProductResponse[]
}

function ProductList({ products }: Props) {
    const router = useRouter()

    return (
        <div className='card '>
            <div className='flex justify-content-between mb-5'>
                <h2>Product List</h2>
                <Button label='Add New Product' onClick={() => router.push('/admin/products/add')} />
            </div>
            <DataTable
                value={products}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: '50rem' }}
                paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                currentPageReportTemplate='{first} to {last} of {totalRecords}'
            >
                <Column field='name' header='Product Name'></Column>
                <Column field='categoryName' header='Category'></Column>
                <Column field='manufacturerName' header='Manufacturer'></Column>

                <Column
                    header='Edit'
                    body={(rowData) => (
                        <Button label='Edit' onClick={() => router.push(`/admin/products/${rowData.id}`)} />
                    )}
                />
            </DataTable>
        </div>
    )
}

export default ProductList
