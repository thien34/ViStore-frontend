import { Customer } from '@/interface/customer.interface'
import customerService from '@/service/customer.service'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { useUpdateEffect } from 'primereact/hooks'
import { InputText } from 'primereact/inputtext'
import { useRef, useState } from 'react'
import DialogAddCustomer from './DialogAddCustomer'

type Props = {
    visible: boolean
    setVisible: (visible: boolean) => void
    setCustomer: (customer: Customer | null) => void
}

export default function CustomerDialog({ visible, setVisible, setCustomer }: Props) {
    const [globalFilter, setGlobalFilter] = useState('')
    const dt = useRef<DataTable<Customer[]>>(null)
    const [initialData, setInitialData] = useState<Customer[]>([])
    const [addCustomerVisible, setAddCustomerVisible] = useState(false)

    const fetchCustomers = async () => {
        const { payload: data } = await customerService.getAll()
        setInitialData(data.items.filter((item) => item.active && item.id !== 1))
    }

    useUpdateEffect(() => {
        fetchCustomers()
    }, [visible])

    const actionBodyTemplate = (rowData: Customer) => {
        return (
            <>
                <Button
                    icon='pi pi-check'
                    className='bg-blue-500 text-white'
                    rounded
                    outlined
                    onClick={() => onSelectCustomer(rowData)}
                />
            </>
        )
    }

    const onSelectCustomer = (customer: Customer) => {
        setCustomer(customer)
        setVisible(false)
    }

    const header = (
        <div className='flex flex-column  md:flex-row md:justify-end md:align-items-center'>
            <span className='block mt-2 md:mt-0 p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText
                    type='search'
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder='Tìm kiếm...'
                />
            </span>
        </div>
    )
    const onOpenAddCustomer = () => {
        setAddCustomerVisible(true)
        setVisible(false)
    }
    const onCloseAddCustomer = () => {
        fetchCustomers()
        setAddCustomerVisible(false)
        setVisible(true)
    }
    return (
        <>
            <Dialog
                modal
                draggable={false}
                header='Khách Hàng'
                visible={visible}
                style={{ width: '70vw', marginLeft: '15vw' }}
                onHide={() => {
                    if (!visible) return
                    setVisible(false)
                }}
            >
                <div className='flex justify-end items-center mb-5'>
                    <Button icon='pi pi-plus' label='Thêm Khách Hàng' onClick={onOpenAddCustomer} />
                </div>
                <DataTable
                    ref={dt}
                    value={initialData}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} khách hàng'
                    globalFilter={globalFilter}
                    emptyMessage='Không tìm thấy khách hàng nào'
                    header={header}
                >
                    <Column field='email' header='Email' sortable />
                    <Column
                        field='name'
                        header='Tên Khách Hàng'
                        body={(rowData: Customer) => `${rowData.firstName} ${rowData.lastName}`}
                        sortable
                    />
                    <Column header='Thao Tác' className='text-center' body={actionBodyTemplate}></Column>
                </DataTable>
            </Dialog>
            <DialogAddCustomer
                visible={addCustomerVisible}
                setVisible={setAddCustomerVisible}
                onClose={onCloseAddCustomer}
            />
        </>
    )
}
