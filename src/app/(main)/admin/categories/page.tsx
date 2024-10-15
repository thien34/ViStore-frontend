/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'
import React, { useEffect, useRef, useState } from 'react'
import { Category } from '@/interface/Category'
import { ProductService } from '@/demo/service/ProductService'

const CategoryPage = () => {
    const emptyCategory: Category = {
        id: 0,
        name: '',
        parentCategoryId: 0
    }
    const [products, setProducts] = useState(null)
    const [productDialog, setProductDialog] = useState(false)
    const [deleteProductDialog, setDeleteProductDialog] = useState(false)
    const [deleteProductsDialog, setDeleteProductsDialog] = useState(false)
    const [product, setProduct] = useState<Category>(emptyCategory)
    const [selectedProducts, setSelectedProducts] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<any>>(null)

    useEffect(() => {
        ProductService.getProducts().then((data) => setProducts(data as any))
    }, [])

    const openNew = () => {
        setProduct(emptyCategory)
        setSubmitted(false)
        setProductDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setProductDialog(false)
    }

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false)
    }

    const hideDeleteProductsDialog = () => {
        setDeleteProductsDialog(false)
    }

    const saveProduct = () => {
        setSubmitted(true)

        if (product.name.trim()) {
            const _products = [...(products as any)]
            const _product = { ...product }
            if (product.id) {
                const index = findIndexById(product.id)

                _products[index] = _product
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Updated',
                    life: 3000
                })
            } else {
                _product.id = createId()
                _products.push(_product)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Product Created',
                    life: 3000
                })
            }
            setProducts(_products as any)
            setProductDialog(false)
            setProduct(emptyCategory)
        }
    }

    const editProduct = (product: Category) => {
        setProduct({ ...product })
        setProductDialog(true)
    }

    const confirmDeleteProduct = (product: Category) => {
        setProduct(product)
        setDeleteProductDialog(true)
    }

    const deleteProduct = () => {
        const _products = (products as any)?.filter((val: any) => val.id !== product.id)
        setProducts(_products)
        setDeleteProductDialog(false)
        setProduct(emptyCategory)
        toast.current?.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product Deleted',
            life: 3000
        })
    }

    const findIndexById = (id: number) => {
        let index = -1
        for (let i = 0; i < (products as any)?.length; i++) {
            if ((products as any)[i].id === id) {
                index = i
                break
            }
        }
        return index
    }

    const createId = () => {
        let id = ''
        const chars = '0123456789'
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return +id
    }

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const confirmDeleteSelected = () => {
        setDeleteProductsDialog(true)
    }

    const deleteSelectedProducts = () => {
        const _products = (products as any)?.filter((val: any) => !(selectedProducts as any)?.includes(val))
        setProducts(_products)
        setDeleteProductsDialog(false)
        setSelectedProducts(null)
        toast.current?.show({
            severity: 'success',
            summary: 'Successful',
            detail: 'Products Deleted',
            life: 3000
        })
    }

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: keyof Category) => {
        const val = (e.target && e.target.value) || ''
        const _product = { ...product }
        _product[name] = val
        setProduct(_product)
    }

    const leftToolbarTemplate = () => {
        return (
            <>
                <div className='my-2'>
                    <Button label='New' icon='pi pi-plus' severity='success' className=' mr-2' onClick={openNew} />
                    <Button label='Delete' icon='pi pi-trash' severity='danger' onClick={confirmDeleteSelected} disabled={!selectedProducts || !(selectedProducts as any).length} />
                </div>
            </>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <>
                <FileUpload mode='basic' accept='image/*' maxFileSize={1000000} chooseLabel='Import' className='mr-2 inline-block' />
                <Button label='Export' icon='pi pi-upload' severity='help' onClick={exportCSV} />
            </>
        )
    }

    const codeBodyTemplate = (rowData: Category) => {
        return (
            <>
                <span className='p-column-title'>Code</span>
                {rowData.id}
            </>
        )
    }

    const nameBodyTemplate = (rowData: Category) => {
        return (
            <>
                <span className='p-column-title'>Name</span>
                {rowData.name}
            </>
        )
    }

    const actionBodyTemplate = (rowData: Category) => {
        return (
            <>
                <Button icon='pi pi-pencil' rounded severity='success' className='mr-2' onClick={() => editProduct(rowData)} />
                <Button icon='pi pi-trash' rounded severity='warning' onClick={() => confirmDeleteProduct(rowData)} />
            </>
        )
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Manage Categories</h5>
            <span className='block mt-2 md:mt-0 p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText type='search' onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder='Search...' />
            </span>
        </div>
    )

    const productDialogFooter = (
        <>
            <Button label='Cancel' icon='pi pi-times' text onClick={hideDialog} />
            <Button label='Save' icon='pi pi-check' text onClick={saveProduct} />
        </>
    )
    const deleteProductDialogFooter = (
        <>
            <Button label='No' icon='pi pi-times' text onClick={hideDeleteProductDialog} />
            <Button label='Yes' icon='pi pi-check' text onClick={deleteProduct} />
        </>
    )
    const deleteProductsDialogFooter = (
        <>
            <Button label='No' icon='pi pi-times' text onClick={hideDeleteProductsDialog} />
            <Button label='Yes' icon='pi pi-check' text onClick={deleteSelectedProducts} />
        </>
    )

    return (
        <div className='card'>
            <Toast ref={toast} />
            <Toolbar className='mb-4' left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
            <DataTable
                ref={dt}
                value={products}
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value as any)}
                dataKey='id'
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} products'
                globalFilter={globalFilter}
                emptyMessage='No products found.'
                header={header}
                showGridlines
            >
                <Column selectionMode='multiple' headerStyle={{ width: '4rem' }}></Column>
                <Column field='name' header='Name' sortable body={nameBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                <Column field='code' header='Code' sortable body={codeBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
            </DataTable>

            <Dialog visible={productDialog} style={{ width: '450px' }} header='Product Details' modal className='p-fluid' footer={productDialogFooter} onHide={hideDialog}>
                <div className='field'>
                    <label htmlFor='name'>Name</label>
                    <InputText
                        id='name'
                        value={product.name}
                        onChange={(e) => onInputChange(e, 'name')}
                        required
                        autoFocus
                        className={classNames({
                            'p-invalid': submitted && !product.name
                        })}
                    />
                    {submitted && !product.name && <small className='p-invalid'>Name is required.</small>}
                </div>
            </Dialog>

            <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header='Confirm' modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className='flex align-items-center justify-content-center'>
                    <i className='pi pi-exclamation-triangle mr-3' style={{ fontSize: '2rem' }} />
                    {product && (
                        <span>
                            Are you sure you want to delete <b>{product.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog visible={deleteProductsDialog} style={{ width: '450px' }} header='Confirm' modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                <div className='flex align-items-center justify-content-center'>
                    <i className='pi pi-exclamation-triangle mr-3' style={{ fontSize: '2rem' }} />
                    {product && <span>Are you sure you want to delete the selected products?</span>}
                </div>
            </Dialog>
        </div>
    )
}

export default CategoryPage
