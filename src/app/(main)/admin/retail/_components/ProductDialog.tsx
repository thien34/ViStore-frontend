import React from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { FaCartPlus } from 'react-icons/fa'
import { ProductResponse } from '@/interface/Product'

interface ProductDialogProps {
    products: ProductResponse[]
    visible: boolean
    setVisible: (visible: boolean) => void
    filters: any
    setFilters: (filters: any) => void
    onFilter: (e: any) => void
    addProductToCart: (product: ProductResponse) => void
    globalFilterValue: string
    onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ProductDialog: React.FC<ProductDialogProps> = ({
    products,
    visible,
    setVisible,
    filters,
    setFilters,
    onFilter,
    addProductToCart,
    globalFilterValue,
    onGlobalFilterChange
}) => {
    const renderHeader = () => {
        return (
            <div className='flex justify-content-between'>
                <Button
                    type='button'
                    icon='pi pi-filter-slash'
                    label='Clear'
                    outlined
                    onClick={() => setFilters({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } })}
                />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder='Keyword Search' />
            </div>
        )
    }

    return (
        <Dialog header='Search Product' visible={visible} style={{ width: '1300px' }} onHide={() => setVisible(false)}>
            <DataTable
                value={products}
                paginator
                rows={10}
                filters={filters}
                header={renderHeader()}
                emptyMessage='No products found.'
                onFilter={onFilter}
            >
                <Column
                    field='imageUrl'
                    header='Image'
                    body={(rowData) => (
                        <img
                            src={
                                rowData.imageUrl ||
                                'https://bizweb.dktcdn.net/thumb/1024x1024/100/415/445/products/370031-black-1.jpg'
                            }
                            alt={rowData.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                    )}
                />
                <Column field='name' header='Product Name' />
                <Column field='sku' header='SKU' />
                <Column field='categoryName' header='Category' />
                <Column field='manufacturerName' header='Manufacturer' />
                <Column field='price' header='Price' body={(rowData) => `$${rowData.price}`} />
                <Column
                    header='Action'
                    body={(rowData) => (
                        <FaCartPlus
                            onClick={() => addProductToCart(rowData)}
                            className='text-4xl cursor-pointer text-blue-500 hover:text-blue-600'
                        />
                    )}
                />
            </DataTable>
        </Dialog>
    )
}

export default ProductDialog
