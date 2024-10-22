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
import { Manufacturer } from '@/interface/manufacturer.interface'
import manufacturerService from '@/service/manufacturer.service'

interface ManufacturerProps {
    initialData: Manufacturer[]
}

const emptyManufacturer: Manufacturer = {
    name: '',
    description: ''
}

const ListView = ({ initialData }: ManufacturerProps) => {
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>(initialData)
    const [manufacturer, setManufacturer] = useState<Manufacturer>(emptyManufacturer)
    const [selectedCategories, setSelectedCategories] = useState<Manufacturer>()
    const [submitted, setSubmitted] = useState(false)
    const [categoryDialog, setCategoryDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Manufacturer[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setManufacturer(emptyManufacturer)
        setSubmitted(false)
        setCategoryDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setCategoryDialog(false)
    }

    const editCategory = (manufacturer: Manufacturer) => {
        setManufacturer({ ...manufacturer })
        setCategoryDialog(true)
    }

    const fetchCategories = async () => {
        const { payload: data } = await manufacturerService.getAll()
        setManufacturers(data.items)
    }

    const saveCategory = async () => {
        setSubmitted(true)
        if (manufacturer.name.trim()) {
            if (!manufacturer.id) {
                await manufacturerService.create(manufacturer)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Category Created',
                    life: 3000
                })
            } else {
                await manufacturerService.update(manufacturer.id, manufacturer)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Category Updated',
                    life: 3000
                })
            }
            setCategoryDialog(false)
            setManufacturer(emptyManufacturer)
            await fetchCategories()
        }
    }

    const leftToolbarTemplate = () => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button label='New' icon='pi pi-plus' severity='success' onClick={openNew} />
                <Button
                    label='Delete'
                    icon='pi pi-trash'
                    severity='danger'
                    // onClick={confirmDeleteSelected}
                    disabled={!selectedCategories || !Array.isArray(selectedCategories) || !selectedCategories.length}
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

    const actionBodyTemplate = (rowData: Manufacturer) => {
        return (
            <>
                <Button icon='pi pi-pencil' rounded outlined className='mr-2' onClick={() => editCategory(rowData)} />
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
            <h5 className='m-0'>Manage Manufacturers</h5>
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

    const categoryDialogFooter = (
        <>
            <Button label='Cancel' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Save' icon='pi pi-check' onClick={saveCategory} />
        </>
    )

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={manufacturers}
                    selection={selectedCategories}
                    onSelectionChange={(e) => setSelectedCategories(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} manfacturers'
                    globalFilter={globalFilter}
                    emptyMessage='No categories found.'
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
                        header='Name'
                        sortable
                        headerStyle={{
                            minWidth: '4rem'
                        }}
                    />
                    <Column field='description' header='Description' />
                    <Column
                        body={actionBodyTemplate}
                        style={{
                            maxWidth: '30px'
                        }}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={categoryDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Manfacture Details'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={categoryDialogFooter}
                onHide={hideDialog}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Name
                    </label>
                    <InputText
                        id='name'
                        value={manufacturer.name}
                        onChange={(e) => setManufacturer({ ...manufacturer, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !manufacturer.name })}
                    />
                    {submitted && !manufacturer.name && <small className='p-error'>Name is required.</small>}
                </div>
                <div className='field'>
                    <label htmlFor='description' className='font-bold'>
                        Description
                    </label>
                    <InputText
                        id='description'
                        value={manufacturer.description}
                        onChange={(e) => setManufacturer({ ...manufacturer, description: e.target.value })}
                        required
                        autoFocus
                    />
                </div>
            </Dialog>
        </>
    )
}

export default ListView
