'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { useRef, useState } from 'react'
import { Customer } from '@/interface/customer.interface'
import { useRouter } from 'next/navigation'

interface CustomerProps {
    initialData: Customer[]
}

const ListView = ({ initialData }: CustomerProps) => {
    const [selectedCustomers, setSelectedCustomers] = useState<Customer>()
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Customer[]>>(null)
    const router = useRouter()

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const leftToolbarTemplate = () => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    label='New'
                    icon='pi pi-plus'
                    severity='success'
                    onClick={() => router.push('/admin/customers/add')}
                />
                <Button
                    label='Delete'
                    icon='pi pi-trash'
                    severity='danger'
                    // onClick={confirmDeleteSelected}
                    disabled={!selectedCustomers || !Array.isArray(selectedCustomers) || !selectedCustomers.length}
                />
            </div>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <>
                <FileUpload
                    mode='basic'
                    accept='image/*'
                    maxFileSize={1000000}
                    chooseLabel='Import'
                    className='mr-2 inline-block'
                />
                <Button label='Export' icon='pi pi-upload' severity='help' onClick={exportCSV} />
            </>
        )
    }

    const actionBodyTemplate = (rowData: Customer) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => router.push(`/admin/customers/${rowData.id}`)}
                />
                <Button
                    icon='pi pi-trash'
                    rounded
                    outlined
                    severity='danger'
                    // onClick={() => confirmDeleteProduct(rowData)}
                />
            </>
        )
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Manage Customers</h5>
            <span className='block mt-2 md:mt-0 p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText
                    type='search'
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder='Search...'
                />
            </span>
        </div>
    )

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={initialData}
                    selection={selectedCustomers}
                    onSelectionChange={(e) => setSelectedCustomers(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} customers'
                    globalFilter={globalFilter}
                    emptyMessage='No customers found.'
                    header={header}
                >
                    <Column
                        selectionMode='multiple'
                        headerStyle={{
                            width: '4rem'
                        }}
                    ></Column>
                    <Column field='email' header='Email' sortable />
                    <Column
                        field='name'
                        header='Name'
                        body={(rowData: Customer) => `${rowData.firstName} ${rowData.lastName}`}
                        sortable
                    />
                    <Column field='customerRoles' header='Customer roles' sortable />
                    <Column field='active' header='Active' sortable />
                    <Column body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
        </>
    )
}

export default ListView
