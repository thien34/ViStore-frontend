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
import { ProductTag, ProductTags } from '@/interface/productTag.interface'
import productTagService from '@/service/prductTag.service'

interface ProductTagProps {
    initialData: ProductTags[]
}

const emptyProductTag: ProductTag = {
    name: ''
}

const ListView = ({ initialData }: ProductTagProps) => {
    const [productTags, setProductTags] = useState<ProductTags[]>(initialData)
    const [productTag, setProductTag] = useState<ProductTag>(emptyProductTag)
    const [selectedProductTags, setSelectedProductTags] = useState<ProductTags>()
    const [submitted, setSubmitted] = useState(false)
    const [productTagDialog, setProductTagDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<ProductTags[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setProductTag(emptyProductTag)
        setSubmitted(false)
        setProductTagDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setProductTagDialog(false)
    }

    const editProductTag = (productTag: ProductTag) => {
        setProductTag({ ...productTag })
        setProductTagDialog(true)
    }

    const fetchProductTags = async () => {
        const { payload: data } = await productTagService.getAll()
        setProductTags(data.items)
    }

    const saveProductTag = async () => {
        setSubmitted(true)
        if (productTag.name.trim()) {
            if (!productTag.id) {
                await productTagService.create(productTag)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Tag Created',
                    life: 3000
                })
            } else {
                await productTagService.update(productTag.id, productTag)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Tag Updated',
                    life: 3000
                })
            }
            setProductTagDialog(false)
            setProductTag(emptyProductTag)
            await fetchProductTags()
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
                    disabled={
                        !selectedProductTags || !Array.isArray(selectedProductTags) || !selectedProductTags.length
                    }
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

    const actionBodyTemplate = (rowData: ProductTag) => {
        return (
            <>
                <Button icon='pi pi-pencil' rounded outlined className='mr-2' onClick={() => editProductTag(rowData)} />
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
            <h5 className='m-0'>Manage Product Tags</h5>
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

    const productTagDialogFooter = (
        <>
            <Button label='Cancel' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Save' icon='pi pi-check' onClick={saveProductTag} />
        </>
    )

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={productTags}
                    selection={selectedProductTags}
                    onSelectionChange={(e) => setSelectedProductTags(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} product tags'
                    globalFilter={globalFilter}
                    emptyMessage='No product tag found.'
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
                    <Column
                        field='taggedProducts'
                        header='Tagged Products'
                        align={'center'}
                        style={{
                            maxWidth: '4rem'
                        }}
                    />
                    <Column
                        body={actionBodyTemplate}
                        style={{
                            width: '3rem'
                        }}
                    ></Column>
                </DataTable>
            </div>
            <Dialog
                visible={productTagDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Product Tag Details'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={productTagDialogFooter}
                onHide={hideDialog}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Name
                    </label>
                    <InputText
                        id='name'
                        value={productTag.name}
                        onChange={(e) => setProductTag({ ...productTag, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !productTag.name })}
                    />
                    {submitted && !productTag.name && <small className='p-error'>Name is required.</small>}
                </div>
            </Dialog>
        </>
    )
}

export default ListView
