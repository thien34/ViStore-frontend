import { useEffect, useRef, useState } from 'react'
import { CustomerOrder, OrderItemsResponse } from '@/interface/orderItem.interface'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { InputNumber } from 'primereact/inputnumber'
import Image from 'next/image'
import OrderService from '@/service/order.service'
import { Toast } from 'primereact/toast'
import { OrderStatusType } from '@/interface/order.interface'
import { Button } from 'primereact/button'
import { ProductResponse } from '@/interface/Product'
import ProductDialog from '../../../retail/_components/ProductDialog'
import ProductService from '@/service/ProducrService'
import CustomerOrderInfo from './CustomerOrder'

interface ProductAttribute {
    productAttribute: {
        name: string
    }
    id: number
    name: string
    value: string
}

interface Product {
    id: number
    name: string
    unitPrice: number
    discountPrice?: number
    quantity: number
    attributes: ProductAttribute[] | null
    largestDiscountPercentage: number
    cartUUID: string
    imageUrl: string
}

type Props = {
    onDelete: (cartUUID: string) => void
    onUpdateQuantity: (id: number, quantity: number) => void
    idOrder: string
    status: OrderStatusType
}

export default function ProductOrderList({ onDelete, idOrder, status }: Props) {
    const [products, setProducts] = useState<Product[]>([])
    const [orderItemsResponse, setOrderItemsResponse] = useState<OrderItemsResponse[]>([])
    const [customerInfo, setCustomerInfo] = useState<CustomerOrder>({
        id: 0,
        addressId: 0,
        addressOrder: '',
        customerName: '',
        customerPhone: ''
    })
    const [visible, setVisible] = useState(false)
    const [filters, setFilters] = useState({})
    const [globalFilterValue, setGlobalFilterValue] = useState('')
    const [productsDialog, setProductsDialog] = useState<ProductResponse[]>([])
    const toast = useRef<Toast>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderResponse, productsResponse] = await Promise.all([
                    OrderService.getOrderItems(idOrder),
                    ProductService.getProuctsDetails()
                ])
                setOrderItemsResponse(orderResponse.payload)
                setProductsDialog(productsResponse)
                console.log(orderResponse.payload)
                setCustomerInfo(
                    orderResponse.payload?.[0].customerOrder || {
                        id: 0,
                        addressId: 0,
                        addressOrder: '',
                        customerName: '',
                        customerPhone: ''
                    }
                )
            } catch (error) {
                console.error('Error fetching data:', error)
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch data',
                    life: 3000
                })
            }
        }

        fetchData()
    }, [idOrder]) // Only re-run if id changes

    useEffect(() => {
        const data: Product[] = orderItemsResponse.map((item) => {
            const product = JSON.parse(item.productJson)
            return {
                id: product.id,
                name: product.name,
                unitPrice: product.unitPrice,
                discountPrice: product.discountPrice,
                quantity: item.quantity,
                attributes:
                    product.productAttributeValues?.map((attr: ProductAttribute) => ({
                        id: attr.id,
                        name: attr.productAttribute.name,
                        value: attr.value
                    })) || [],
                largestDiscountPercentage: product.largestDiscountPercentage || 0,
                cartUUID: item.orderItemGuid,
                imageUrl: product.image || ''
            }
        })
        setProducts(data)
        console.log(data)
    }, [orderItemsResponse])

    const handleDecrement = (id: number) => {
        const currentItem = orderItemsResponse.find((item) => item.id === id)
        if (currentItem && currentItem.quantity > 1) {
            const newQuantity = currentItem.quantity - 1
            handleQuantityChange(id, newQuantity)
        }
    }

    const handleIncrement = (id: number) => {
        const currentItem = orderItemsResponse.find((item) => item.id === id)
        if (currentItem) {
            const newQuantity = currentItem.quantity + 1
            handleQuantityChange(id, newQuantity)
        }
    }

    const handleQuantityChange = async (id: number, value: number) => {
        try {
            await OrderService.updateOrderItem(id, value)
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Quantity updated successfully!',
                life: 3000
            })

            // Fetch updated data
            const response = await OrderService.getOrderItems(idOrder)
            setOrderItemsResponse(response.payload)
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error instanceof Error ? error.message : 'Failed to update quantity',
                life: 3000
            })
        }
    }

    const isEditable = [
        OrderStatusType.CREATED,
        OrderStatusType.PENDING,
        OrderStatusType.CONFIRMED,
        OrderStatusType.SHIPPING_PENDING
    ].includes(status as OrderStatusType)

    return (
        <>
            <Toast ref={toast} />
            <div className='card flex justify-between'>
                <div className='w-1/3'>
                    <div className='flex justify-between'>
                        <h4>Customer</h4>
                    </div>
                    <CustomerOrderInfo customerInfo={customerInfo} />
                </div>
                <div className='w-2/3'>
                    <div className='flex justify-between'>
                        <h4>Order Items</h4>
                        <Button
                            type='button'
                            label='Add Item'
                            onClick={() => setVisible(true)}
                            disabled={!isEditable}
                        />
                    </div>
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className='p-4 rounded-lg flex items-start gap-4 border border-gray-300 shadow-md my-5'
                        >
                            <div className='relative'>
                                <Image
                                    src={product.imageUrl || '/demo/images/default/—Pngtree—sneakers_3989154.png'}
                                    alt={product.name}
                                    className='object-cover rounded-lg'
                                    width={50}
                                    height={50}
                                />
                                {product.largestDiscountPercentage > 0 && (
                                    <div className='absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center'>
                                        -{product.largestDiscountPercentage}%
                                    </div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <div className='flex justify-between items-center'>
                                    <div className='font-semibold text-lg flex-grow flex-shrink-0 w-2/5 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap'>
                                        {product.name}
                                    </div>
                                    <div className='flex items-center space-x-2 bg-gray-200 p-2 rounded-lg h-8'>
                                        <button
                                            onClick={() =>
                                                handleDecrement(
                                                    orderItemsResponse.find(
                                                        (item) => item.orderItemGuid === product.cartUUID
                                                    )?.id || 0
                                                )
                                            }
                                            className='p-1 w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50'
                                            disabled={!isEditable}
                                        >
                                            -
                                        </button>
                                        <InputNumber
                                            min={1}
                                            id='number-input'
                                            value={product.quantity || 1}
                                            onValueChange={(e) => {
                                                const newQuantity = e.value || 1
                                                const itemId =
                                                    orderItemsResponse.find(
                                                        (item) => item.orderItemGuid === product.cartUUID
                                                    )?.id || 0
                                                handleQuantityChange(itemId, newQuantity)
                                            }}
                                            inputStyle={{
                                                width: '55px',
                                                textAlign: 'center',
                                                backgroundColor: 'transparent',
                                                border: 'none'
                                            }}
                                            className='w-10 h-8'
                                            disabled={!isEditable}
                                        />
                                        <button
                                            onClick={() =>
                                                handleIncrement(
                                                    orderItemsResponse.find(
                                                        (item) => item.orderItemGuid === product.cartUUID
                                                    )?.id || 0
                                                )
                                            }
                                            className='p-1 w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50'
                                            disabled={!isEditable}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className='text-gray-600 text-sm flex-shrink-0 w-1/4'>
                                        {product.discountPrice ? (
                                            <div>
                                                <span className='line-through text-gray-400'>
                                                    $
                                                    {product.unitPrice && product.quantity
                                                        ? (Number(product.unitPrice) * product.quantity).toFixed(2)
                                                        : '0.00'}
                                                </span>
                                                <span className='ml-2 text-red-500 font-semibold'>
                                                    $
                                                    {product.discountPrice && product.quantity
                                                        ? (Number(product.discountPrice) * product.quantity).toFixed(2)
                                                        : '0.00'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span>
                                                $
                                                {product.unitPrice && product.quantity
                                                    ? (Number(product.unitPrice) * product.quantity).toFixed(2)
                                                    : '0.00'}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        disabled={!isEditable}
                                        onClick={() => onDelete(product.cartUUID)}
                                        className='text-white bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-colors flex-shrink-0'
                                    >
                                        <RiDeleteBin6Line className='cursor-pointer text-4xl p-2 rounded-lg transition-colors flex-shrink-0' />
                                    </button>
                                </div>
                                <div>
                                    {product.attributes &&
                                        product.attributes.map((attr: ProductAttribute) => (
                                            <div key={attr.id} className='text-gray-600 mr-2 text-sm font-bold'>
                                                {attr?.name?.toUpperCase()}:{' '}
                                                <span className='font-medium'>{attr?.value?.toUpperCase()}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    <ProductDialog
                        products={productsDialog}
                        visible={visible}
                        setVisible={setVisible}
                        filters={filters}
                        setFilters={setFilters}
                        addProductToCart={(product: ProductResponse) => {
                            console.log(product)
                        }}
                        globalFilterValue={globalFilterValue}
                        onGlobalFilterChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setGlobalFilterValue(e.target.value)
                        }}
                    />
                </div>
            </div>
        </>
    )
}
