'use client'
import Checkout from './_components/Checkout'

import { loadStripe } from '@stripe/stripe-js'
import { useRef, useState } from 'react'
import { useLocalStorage, useMountEffect, useUpdateEffect } from 'primereact/hooks'
import { Elements } from '@stripe/react-stripe-js'
import CartService from '@/service/cart.service'
import { CartResponse } from '@/interface/cart.interface'
import CartItem from '../retail/_components/CartItem'
import { Toast } from 'primereact/toast'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)

export default function CheckoutPage() {
    const [amountPaidLocal, setAmountPaidLocal] = useLocalStorage<number>(1000, 'amountPaid')
    const [billId, setBillId] = useState<string | null>(null)

    const [carts, setCarts] = useState<CartResponse[]>([])
    const toast = useRef<Toast>(null)
    const router = useRouter()

    useMountEffect(() => {
        let storedBillId = null
        if (typeof window !== 'undefined') {
            storedBillId = localStorage.getItem('billIdCurrent')
            setBillId(storedBillId)
        }
        if (!storedBillId) {
            router.push('/admin/retail')
        }
    })

    useUpdateEffect(() => {
        fetchCart()
    }, [billId])

    const fetchCart = () => {
        if (!billId) return
        CartService.getCart(billId)
            .then((res) => {
                const sortedCarts = res.sort((a, b) => a.cartUUID.localeCompare(b.cartUUID))
                setCarts(sortedCarts)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    function handleCartItemDelete(cart: CartResponse, event: React.MouseEvent<HTMLElement>): void {
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
        <main className='card  '>
            <div className=''>
                <h5>
                    Total Amount: <span className='font-bold text-primary-700'>${amountPaidLocal}</span>
                </h5>
                <h5>
                    Order Code: <span className='font-bold text-primary-700'>{billId}</span>
                </h5>
            </div>
            <ConfirmPopup />
            {carts.length > 0 && (
                <>
                    <div className='space-y-4 card mt-2'>
                        {carts.map((cart) => (
                            <CartItem
                                key={cart.id}
                                cart={cart}
                                onQuantityChange={fetchCart}
                                onDelete={() => handleCartItemDelete(cart, {} as React.MouseEvent<HTMLElement>)}
                            />
                        ))}
                    </div>
                </>
            )}

            <Elements
                stripe={stripePromise}
                options={{
                    mode: 'payment',
                    amount: amountPaidLocal * 100,
                    currency: 'usd'
                }}
            >
                <Checkout totalAmount={amountPaidLocal} />
            </Elements>
        </main>
    )
}
