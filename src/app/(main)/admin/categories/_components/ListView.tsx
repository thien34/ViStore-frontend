'use client'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { FileUpload } from 'primereact/fileupload'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { useRef, useState } from 'react'
import { Category } from '@/interface/category.interface'
import { Dialog } from 'primereact/dialog'
import { classNames } from 'primereact/utils'
import { TreeSelect } from 'primereact/treeselect'
import { TreeNode } from 'primereact/treenode'
import categoryService from '@/service/category.service'

interface CategoryProps {
    initialData: Category[]
    initialNodes: TreeNode[]
}

const emptyCategory: Category = {
    name: '',
    categoryParentId: null
}

const ListView = ({ initialData, initialNodes }: CategoryProps) => {
    const [categories, setCategories] = useState<Category[]>(initialData)
    const [nodes, setNodes] = useState<TreeNode[]>(initialNodes)
    const [category, setCategory] = useState<Category>(emptyCategory)
    const [selectedCategories, setSelectedCategories] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [categoryDialog, setCategoryDialog] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Category[]>>(null)

    const exportCSV = () => {
        dt.current?.exportCSV()
    }

    const openNew = () => {
        setCategory(emptyCategory)
        setSubmitted(false)
        setCategoryDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setCategoryDialog(false)
    }

    const editCategory = (category: Category) => {
        setCategory({ ...category })
        setCategoryDialog(true)
    }

    const fetchCategories = async () => {
        const { payload: data } = await categoryService.getAll()
        const { payload: newNodes } = await categoryService.getListName()
        const treeNodes = categoryService.convertToTreeNode(newNodes)

        setCategories(data.items)
        setNodes(treeNodes)
    }

    const saveCategory = async () => {
        setSubmitted(true)
        if (category.name.trim()) {
            if (!category.id) {
                await categoryService.create(category)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Category Created',
                    life: 3000
                })
            } else {
                await categoryService.update(category.id, category)
                toast.current?.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Category Updated',
                    life: 3000
                })
                console.log('update', category)
            }
            setCategoryDialog(false)
            setCategory(emptyCategory)
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
                    // disabled={!selectedProducts || !selectedProducts.length}
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

    const actionBodyTemplate = (rowData: Category) => {
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
            <h5 className='m-0'>Manage Categories</h5>
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
                    value={categories}
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
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} products'
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
                            minWidth: '15rem'
                        }}
                    />
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
                header='Product Details'
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
                        value={category.name}
                        onChange={(e) => setCategory({ ...category, name: e.target.value })}
                        required
                        autoFocus
                        className={classNames({ 'p-invalid': submitted && !category.name })}
                    />
                    {submitted && !category.name && <small className='p-error'>Name is required.</small>}
                </div>
                <div className='field'>
                    <label htmlFor='categoryParent' className='font-bold'>
                        Category parent
                    </label>
                    <TreeSelect
                        id='categoryParent'
                        value={category.categoryParentId?.toString() || null}
                        onChange={(e) => setCategory({ ...category, categoryParentId: Number(e.value as string) })}
                        options={nodes}
                        filter
                        placeholder='Select Item'
                        showClear
                    ></TreeSelect>
                </div>
            </Dialog>
        </>
    )
}

export default ListView
