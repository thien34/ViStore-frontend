'use client'
import React, { useRef, useState } from 'react'
import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { DataTableFilterMeta } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { ProductResponse, ProductResponseDetails } from '@/interface/Product'
import ProductService from '@/service/ProducrService'
import { useLocalStorage, useMountEffect, useUpdateEffect } from 'primereact/hooks'
import { CartResponse, ShoppingCart } from '@/interface/cart.interface'
import CartService from '@/service/cart.service'
import { v4 as uuidv4 } from 'uuid'
import ProductDialog from './ProductDialog'
import QuantityDialog from './QuantityDialog'
import CartItem from './CartItem'
import { confirmPopup } from 'primereact/confirmpopup'
import { Toast } from 'primereact/toast'

const defaultFilters: DataTableFilterMeta = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    },
    'country.name': {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }]
    },
    representative: { value: null, matchMode: FilterMatchMode.IN },

    balance: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    status: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }]
    },
    activity: { value: null, matchMode: FilterMatchMode.BETWEEN },
    verified: { value: null, matchMode: FilterMatchMode.EQUALS }
}

export default function ProductListComponent() {
    const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters)
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('')
    const [product, setProduct] = useState<ProductResponseDetails>()
    const [billId, setBillId] = useLocalStorage<string>('billId', '')
    const [quantity, setQuantity] = useState<number>(0)
    const [carts, setCarts] = useState<CartResponse[]>([])
    const [products, setProducts] = useState<ProductResponse[]>([])
    const toast = useRef<Toast>(null)
    const clearFilter = () => {
        initFilters()
    }

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const _filters = { ...filters }

        // @ts-ignore
        _filters['global'].value = value

        setFilters(_filters)
        setGlobalFilterValue(value)
    }

    const initFilters = () => {
        setFilters(defaultFilters)
        setGlobalFilterValue('')
    }

    const renderHeader = () => {
        return (
            <div className='flex justify-content-between'>
                <Button type='button' icon='pi pi-filter-slash' label='Clear' outlined onClick={clearFilter} />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder='Keyword Search' />
            </div>
        )
    }

    const header = renderHeader()
    const [visible, setVisible] = useState<boolean>(false)
    const [visibleQuantity, setVisibleQuantity] = useState<boolean>(false)

    useMountEffect(() => {
        ProductService.getProuctsDetails().then((res) => setProducts(res))
    })

    useUpdateEffect(() => {
        CartService.getCart(billId).then((res) => {
            setCarts(res)
        })
    }, [billId])

    const addProductToCart = (product: ProductResponseDetails) => {
        setProduct(product)
        setVisibleQuantity(true)
    }

    const addProductToCartHandler = () => {
        const cart: ShoppingCart = {
            cartUUID: uuidv4(),
            productId: product?.id ?? null,
            quantity: quantity,
            customerId: 1,
            isAdmin: true
        }
        CartService.addProductToCart(cart, billId).then((res) => {
            console.log(res)
        })
    }

    function handleCartItemDelete(cart: CartResponse, event: any): void {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to delete this item from the cart?',
            icon: 'pi pi-info-circle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => {
                CartService.deleteBill(cart.cartUUID)
                    .then(() => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Delete cart item successfully',
                            life: 1000
                        })
                        CartService.getCart(billId).then((updatedCarts) => {
                            setCarts(updatedCarts)
                        })
                    })
                    .catch((error) => {
                        console.error('Error deleting cart item:', error)
                    })
            }
        })
    }
    return (
        <div className='card'>
            <div className='flex justify-between'>
                <h4>Product List</h4>
                <Button onClick={() => setVisible(true)}>Add Product</Button>
            </div>
            <Toast ref={toast} />
            <ProductDialog
                products={products}
                visible={visible}
                setVisible={setVisible}
                filters={filters}
                setFilters={setFilters}
                addProductToCart={(product: ProductResponse) => {
                    addProductToCart(product as unknown as ProductResponseDetails)
                }}
                globalFilterValue={globalFilterValue}
                onGlobalFilterChange={onGlobalFilterChange}
            />

            <QuantityDialog
                visible={visibleQuantity}
                setVisible={setVisibleQuantity}
                product={product || null}
                quantity={quantity}
                setQuantity={setQuantity}
                onSave={addProductToCartHandler}
            />

            <div className='space-y-4'>
                {carts.map((cart) => (
                    <CartItem key={cart.id} cart={cart} onDelete={(e) => handleCartItemDelete(cart, e)} />
                ))}
            </div>
        </div>
    )
}
