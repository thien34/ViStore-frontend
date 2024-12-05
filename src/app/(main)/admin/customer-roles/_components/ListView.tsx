'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { classNames } from 'primereact/utils'
import { Role } from '@/interface/role.interface'
import roleService from '@/service/role.service'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import RequiredIcon from '@/components/icon/RequiredIcon'

interface RoleProps {
    initialData: Role[]
}

const emptyRole: Role = {
    name: '',
    active: true
}

const ListView = ({ initialData }: RoleProps) => {
    const [roles, setRoles] = useState<Role[]>(initialData)
    const [role, setRole] = useState<Role>(emptyRole)
    const [selectedRoles, setSelectedRoles] = useState<Role>()
    const [submitted, setSubmitted] = useState(false)
    const [roleDialog, setRoleDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Role[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setRole(emptyRole)
        setSubmitted(false)
        setRoleDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setRoleDialog(false)
    }

    const editRole = (role: Role) => {
        setRole({ ...role })
        setRoleDialog(true)
    }

    const fetchRoles = async () => {
        const { payload: data } = await roleService.getAll()
        setRoles(data.items)
    }

    const saveRole = async () => {
        setSubmitted(true)
        if (role.name.trim()) {
            if (!role.id) {
                await roleService.create(role)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Vai trò đã được tạo.',
                    life: 3000
                })
            } else {
                await roleService.update(role.id, role)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Vai trò đã được cập nhật.',
                    life: 3000
                })
            }
            setRoleDialog(false)
            await fetchRoles()
        }
    }

    const leftToolbarTemplate = () => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button label='Thêm Mới' icon='pi pi-plus' severity='success' onClick={openNew} />
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
                    chooseLabel='Nhập File'
                    className='mr-2 inline-block'
                />
                <Button label='Xuất File' icon='pi pi-upload' severity='help' onClick={exportCSV} />
            </>
        )
    }

    const actionBodyTemplate = (rowData: Role) => {
        return (
            <>
                <Button icon='pi pi-pencil' rounded outlined className='mr-2' onClick={() => editRole(rowData)} />
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
            <h5 className='m-0'>Quản Lý Vai Trò</h5>
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

    const roleDialogFooter = (
        <>
            <Button label='Hủy' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Lưu' icon='pi pi-check' onClick={saveRole} />
        </>
    )

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={roles}
                    selection={selectedRoles}
                    onSelectionChange={(e) => setSelectedRoles(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} vai trò'
                    globalFilter={globalFilter}
                    emptyMessage='Không tìm thấy vai trò nào.'
                    header={header}
                >
                    <Column
                        selectionMode='multiple'
                        headerStyle={{
                            width: '4rem'
                        }}
                    ></Column>
                    <Column
                        field='name'
                        header='Tên Vai Trò'
                        sortable
                        headerStyle={{
                            minWidth: '4rem'
                        }}
                    />
                    <Column field='active' header='Đang Hoạt Động' />
                    <Column
                        header='Thao Tác'
                        body={actionBodyTemplate}
                        style={{
                            maxWidth: '30px'
                        }}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={roleDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Chi Tiết Vai Trò'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={roleDialogFooter}
                onHide={hideDialog}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Tên Vai Trò <RequiredIcon />
                    </label>
                    <InputText
                        id='name'
                        value={role.name}
                        placeholder='Nhập tên vai trò'
                        onChange={(e) => setRole({ ...role, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !role.name })}
                    />
                    {submitted && !role.name && <small className='p-error'>Tên vai trò là bắt buộc.</small>}
                </div>
                <div className='field flex items-center gap-3'>
                    <label htmlFor='active' className='font-bold'>
                        Đang Hoạt Động
                    </label>
                    <InputSwitch
                        id='active'
                        checked={role.active}
                        onChange={(e: InputSwitchChangeEvent) => setRole({ ...role, active: e.target.value })}
                    />
                </div>
            </Dialog>
        </>
    )
}

export default ListView
