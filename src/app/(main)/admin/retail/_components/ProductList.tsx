'use client'
import React, { useRef, useState } from 'react'
import { FilterMatchMode, FilterOperator } from 'primereact/api'
import { DataTableFilterMeta } from 'primereact/datatable'
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
import CustommerOrder from './CustommerOrder'

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

interface ProductListComponentProps {
    updateTabTotalItems: (billId: string, newTotalItems: number) => void
}

export default function ProductListComponent({ updateTabTotalItems }: ProductListComponentProps) {
    const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters)
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('')
    const [product, setProduct] = useState<ProductResponseDetails>()
    const [billId, setBillId] = useLocalStorage<string>('billId', '')
    const [quantity, setQuantity] = useState<number>(1)
    const [carts, setCarts] = useState<CartResponse[]>([])
    const [products, setProducts] = useState<ProductResponse[]>([])
    const toast = useRef<Toast>(null)
    const [orderTotals, setOrderTotals] = useState<{
        subtotal: number
        shippingCost: number
        tax: number
        total: number
    }>({ subtotal: 0, shippingCost: 0, tax: 0, total: 0 })
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

    const [visible, setVisible] = useState<boolean>(false)
    const [visibleQuantity, setVisibleQuantity] = useState<boolean>(false)

    useMountEffect(() => {
        ProductService.getProuctsDetails().then((res) => setProducts(res))
    })

    useUpdateEffect(() => {
        fetchCart()
    }, [billId])

    const fetchCart = () => {
        CartService.getCart(billId).then((res) => {
            setCarts(res)

            updateTabTotalItems(billId, res.length)
            calculateTotals(res)
        })
    }

    const calculateTotals = (carts: CartResponse[]) => {
        const subtotal = carts.reduce((total, cartItem) => {
            return total + cartItem.productResponse.price * cartItem.quantity
        }, 0)

        const shippingCost = 0
        const tax = 0
        const total = subtotal + shippingCost + tax

        setOrderTotals({ subtotal, shippingCost, tax, total })
    }

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
            setVisibleQuantity(false)
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Product added to cart successfully',
                life: 1000
            })
            fetchCart()
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
                        fetchCart()
                    })
                    .catch((error) => {
                        console.error('Error deleting cart item:', error)
                    })
            }
        })
    }
    return (
        <div>
            <div className='flex justify-between'>
                <h4>Product Order</h4>
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
            {carts.length > 0 && (
                <div className='space-y-4 card mt-2'>
                    {carts.map((cart) => (
                        <CartItem
                            key={cart.id}
                            cart={cart}
                            onQuantityChange={fetchCart}
                            onDelete={(e) => handleCartItemDelete(cart, e)}
                        />
                    ))}
                </div>
            )}

            {carts.length > 0 && (
                <>
                    <hr className='my-4 border-1 border-gray-300' />
                    <CustommerOrder orderTotals={orderTotals} />
                </>
            )}
        </div>
    )
}
