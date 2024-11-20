import { DataTable, DataTableFilterEvent, DataTableFilterMeta } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { FaCartPlus } from 'react-icons/fa'
import { ProductResponse } from '@/interface/Product'
import { Image } from 'primereact/image'

interface ProductDialogProps {
    products: ProductResponse[]
    visible: boolean
    setVisible: (visible: boolean) => void
    filters: DataTableFilterMeta
    setFilters: (filters: DataTableFilterMeta) => void
    onFilter?: (e: DataTableFilterEvent) => void
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
        <Dialog
            header='Search Product'
            contentStyle={{ overflowY: 'visible', flexGrow: '0' }}
            visible={visible}
            style={{ width: '1300px' }}
            onHide={() => setVisible(false)}
        >
            <DataTable
                value={products}
                paginator
                rows={5}
                filters={filters}
                header={renderHeader()}
                emptyMessage='No products found.'
                onFilter={onFilter}
            >
                <Column
                    field='imageUrl'
                    header='Image'
                    body={(rowData) => (
                        <div className='relative'>
                            <Image
                                src={rowData.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                                alt={rowData.name}
                                width='50'
                                height='50'
                            />
                            {rowData.largestDiscountPercentage > 0 && (
                                <div className='absolute -top-2 right-6 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                                    -{rowData.largestDiscountPercentage}%
                                </div>
                            )}
                        </div>
                    )}
                />
                <Column field='name' header='Product Name' />
                <Column field='sku' header='SKU' />
                <Column field='categoryName' header='Category' />
                <Column field='manufacturerName' header='Manufacturer' />
                <Column
                    field='price'
                    header='Price'
                    body={(rowData: ProductResponse) => (
                        <div className='flex gap-2 items-center'>
                            {rowData.discountPrice ? (
                                <>
                                    <span className='line-through text-gray-500'>$ {rowData.price}</span>
                                    <span className='text-red-500'>$ {rowData.discountPrice}</span>
                                </>
                            ) : (
                                <span>$ {rowData.price}</span>
                            )}
                        </div>
                    )}
                />
                <Column field='quantity' header='Quantity' />

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
