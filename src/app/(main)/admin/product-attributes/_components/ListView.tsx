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
import { ProductAttribute } from '@/interface/productAttribute.interface'
import productAttributeService from '@/service/productAttribute.service'

interface ProductAttributeProps {
    initialData: ProductAttribute[]
}

const emptyProductAttribute: ProductAttribute = {
    name: '',
    description: ''
}

const ListView = ({ initialData }: ProductAttributeProps) => {
    const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>(initialData)
    const [productAttribute, setProductAttribute] = useState<ProductAttribute>(emptyProductAttribute)
    const [selectedProductAttributes, setSelectedProductAttributes] = useState<ProductAttribute>()
    const [submitted, setSubmitted] = useState(false)
    const [productAttributeDialog, setProductAttributeDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<ProductAttribute[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setProductAttribute(emptyProductAttribute)
        setSubmitted(false)
        setProductAttributeDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setProductAttributeDialog(false)
    }

    const editProductAttribute = (productAttribute: ProductAttribute) => {
        setProductAttribute({ ...productAttribute })
        setProductAttributeDialog(true)
    }

    const fetchProductAttributes = async () => {
        const { payload: data } = await productAttributeService.getAll()
        setProductAttributes(data.items)
    }

    const saveProductAttribute = async () => {
        setSubmitted(true)
        if (productAttribute.name.trim()) {
            if (!productAttribute.id) {
                await productAttributeService.create(productAttribute)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Attribute Created',
                    life: 3000
                })
            } else {
                await productAttributeService.update(productAttribute.id, productAttribute)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Attribute Updated',
                    life: 3000
                })
            }
            setProductAttributeDialog(false)
            setProductAttribute(emptyProductAttribute)
            await fetchProductAttributes()
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
                        !selectedProductAttributes ||
                        !Array.isArray(selectedProductAttributes) ||
                        !selectedProductAttributes.length
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

    const actionBodyTemplate = (rowData: ProductAttribute) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => editProductAttribute(rowData)}
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
            <h5 className='m-0'>Manage Product Attributes</h5>
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

    const productAttributeDialogFooter = (
        <>
            <Button label='Cancel' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Save' icon='pi pi-check' onClick={saveProductAttribute} />
        </>
    )

    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                <Toolbar className='mb-4' start={leftToolbarTemplate} end={rightToolbarTemplate}></Toolbar>
                <DataTable
                    ref={dt}
                    value={productAttributes}
                    selection={selectedProductAttributes}
                    onSelectionChange={(e) => setSelectedProductAttributes(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} product attributes'
                    globalFilter={globalFilter}
                    emptyMessage='No product attribute found.'
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
                visible={productAttributeDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Product Attribute Details'
                style={{ width: '30vw' }}
                modal
                className='p-fluid'
                footer={productAttributeDialogFooter}
                onHide={hideDialog}
            >
                <div className='field'>
                    <label htmlFor='name' className='font-bold'>
                        Name
                    </label>
                    <InputText
                        id='name'
                        value={productAttribute.name}
                        onChange={(e) => setProductAttribute({ ...productAttribute, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !productAttribute.name })}
                    />
                    {submitted && !productAttribute.name && <small className='p-error'>Name is required.</small>}
                </div>
                <div className='field'>
                    <label htmlFor='description' className='font-bold'>
                        Description
                    </label>
                    <InputText
                        id='description'
                        value={productAttribute.description}
                        onChange={(e) => setProductAttribute({ ...productAttribute, description: e.target.value })}
                    />
                </div>
            </Dialog>
        </>
    )
}

export default ListView
