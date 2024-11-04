import React, { useState } from 'react'
import { MdDelete } from 'react-icons/md'
import { CartResponse } from '@/interface/Cart'
import { InputNumber } from 'primereact/inputnumber'
import { RiDeleteBin6Line } from 'react-icons/ri'

interface CartItemProps {
    cart: CartResponse
    onDelete: (id: string) => void
}

const CartItem: React.FC<CartItemProps> = ({ cart, onDelete }) => {
    const [quantity, setQuantity] = useState(cart.quantity)

    const handleIncrement = () => {
        setQuantity((prev) => prev + 1)
    }

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1)
        }
    }

    const handleChange = (e: any) => {
        const value = e.value
        if (value >= 1) {
            setQuantity(value)
        }
    }

    return (
        <div className='p-4 rounded-lg flex items-start gap-4 border border-gray-300 shadow-md my-5'>
            <img
                src={
                    cart.productResponse.imageUrl ||
                    'https://bizweb.dktcdn.net/thumb/1024x1024/100/415/445/products/370031-black-1.jpg'
                }
                alt={cart.productResponse.name}
                className='w-24 h-24 object-cover rounded-lg'
            />
            <div className='flex-1'>
                <div className='flex justify-between items-center'>
                    <div className='font-semibold text-lg flex-grow flex-shrink-0 w-2/5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap'>
                        {cart.productResponse.name}
                    </div>
                    <div className='flex items-center space-x-2 bg-gray-200 p-2 rounded-lg h-8'>
                        <button
                            onClick={handleDecrement}
                            className='p-1 w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition'
                        >
                            -
                        </button>
                        <InputNumber
                            min={1}
                            id='number-input'
                            value={quantity}
                            onValueChange={handleChange}
                            inputStyle={{
                                width: '55px',
                                textAlign: 'center',
                                backgroundColor: 'transparent',
                                border: 'none'
                            }}
                            className='w-10 h-8 '
                        />
                        <button
                            onClick={handleIncrement}
                            className='p-1 w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition'
                        >
                            +
                        </button>
                    </div>
                    <div className='text-gray-600 text-sm flex-shrink-0 w-1/4'>
                        ${cart.productResponse.price * quantity}
                    </div>
                    <RiDeleteBin6Line
                        onClick={() => onDelete(cart.cartUUID)}
                        className='text-white bg-red-500 cursor-pointer text-5xl p-2 rounded-lg transition-colors flex-shrink-0'
                    />
                </div>
                <div>
                    {cart.productResponse.attributes?.map((attr) => (
                        <div key={attr.id} className='text-gray-600 mr-2 text-sm font-bold'>
                            {attr.name.toUpperCase()}: <span className='font-medium'>{attr.value?.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CartItem
