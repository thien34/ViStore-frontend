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
    const paginatorLeft = <Button type='button' icon='pi pi-refresh' text />
    const paginatorRight = <Button type='button' icon='pi pi-download' text />
    const router = useRouter()

    return (
        <div className='card'>
            <DataTable
                value={products}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
                tableStyle={{ minWidth: '50rem' }}
                paginatorTemplate='RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink'
                currentPageReportTemplate='{first} to {last} of {totalRecords}'
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
            >
                <Column field='name' header='Name'></Column>
                <Column field='deleted' header='Deleted'></Column>
                <Column header='Edit' body={(rowData) => <Button label='Edit' icon='pi pi-pencil' onClick={() => router.push(`/admin/products/${rowData.id}`)} />} />
            </DataTable>
        </div>
    )
}

export default ProductList
