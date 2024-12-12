import { DataTable, DataTableFilterEvent, DataTableFilterMeta } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { FaCartPlus } from 'react-icons/fa'
import { ProductResponse } from '@/interface/Product'
import { Image } from 'primereact/image'
import { useEffect, useMemo } from 'react'

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

const ProductDialog = ({
    products,
    visible,
    setVisible,
    filters,
    setFilters,
    onFilter,
    addProductToCart,
    globalFilterValue,
    onGlobalFilterChange
}: ProductDialogProps) => {
    const initialFilters: DataTableFilterMeta = useMemo(
        () => ({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            sku: { value: null, matchMode: FilterMatchMode.CONTAINS },
            categoryName: { value: null, matchMode: FilterMatchMode.EQUALS },
            manufacturerName: { value: null, matchMode: FilterMatchMode.EQUALS },
            price: { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
            quantity: { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO }
        }),
        []
    )

    const renderHeader = () => {
        return (
            <div className='flex justify-content-between'>
                <Button
                    type='button'
                    icon='pi pi-filter-slash'
                    label='Làm Mới'
                    outlined
                    onClick={() => setFilters(initialFilters)}
                />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder='Tìm kiếm từ khóa' />
            </div>
        )
    }
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    }
    const indexBodyTemplate = (_: ProductResponse, options: { rowIndex: number }) => {
        return <>{options.rowIndex + 1}</>
    }

    useEffect(() => {
        setFilters(initialFilters)
    }, [initialFilters, setFilters])

    return (
        <Dialog
            header='Tìm Sản Phẩm'
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
                emptyMessage='Không tìm thấy sản phẩm nào.'
                onFilter={onFilter}
                filterDisplay='menu'
            >
                <Column
                    header='#'
                    body={indexBodyTemplate}
                    headerStyle={{
                        width: '4rem'
                    }}
                />
                <Column
                    field='imageUrl'
                    header='Hình Ảnh'
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
                <Column field='name' header='Tên Sản Phẩm' filter filterPlaceholder='Tìm theo tên' />
                <Column field='sku' header='SKU' filter filterPlaceholder='Tìm theo SKU' />
                <Column field='categoryName' header='Danh Mục' filter filterPlaceholder='Tìm theo danh mục' />
                <Column
                    field='manufacturerName'
                    header='Nhà Sản Xuất'
                    filter
                    filterPlaceholder='Tìm theo nhà sản xuất'
                />
                <Column
                    field='price'
                    header='Giá'
                    dataType='numeric'
                    body={(rowData: ProductResponse) => (
                        <div className='flex gap-2 items-center'>
                            {rowData.discountPrice ? (
                                <>
                                    <span className='line-through text-gray-500'>{formatCurrency(rowData.price)}</span>
                                    <span className='text-red-500'>{formatCurrency(rowData.discountPrice)}</span>
                                </>
                            ) : (
                                <span>{formatCurrency(rowData.price)}</span>
                            )}
                        </div>
                    )}
                    filter
                    filterElement={(options) => (
                        <div className='flex flex-col gap-2'>
                            <InputText
                                type='number'
                                value={options.value}
                                onChange={(e) => options.filterCallback(parseInt(e.target.value), options.index)}
                                placeholder='Giá tối thiểu'
                                className='w-full'
                                min={0}
                            />
                        </div>
                    )}
                />
                <Column
                    field='quantity'
                    header='Số lượng'
                    dataType='numeric'
                    filter
                    filterElement={(options) => (
                        <div className='flex flex-col gap-2'>
                            <InputText
                                type='number'
                                value={options.value}
                                onChange={(e) => options.filterCallback(parseInt(e.target.value), options.index)}
                                placeholder='Số lượng tối thiểu'
                                className='w-full'
                                min={0}
                            />
                        </div>
                    )}
                />
                <Column
                    header='Thao Tác'
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
