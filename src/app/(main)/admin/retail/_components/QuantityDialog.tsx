import React from 'react'
import { InputNumber } from 'primereact/inputnumber'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { ProductResponseDetails } from '@/interface/Product'

interface QuantityDialogProps {
    visible: boolean
    setVisible: (visible: boolean) => void
    product: ProductResponseDetails | null
    quantity: number
    setQuantity: (quantity: number) => void
    onSave: () => void
}

const QuantityDialog = ({ visible, setVisible, product, quantity, setQuantity, onSave }: QuantityDialogProps) => {
    return (
        <Dialog
            header={<div className='text-xl font-bold text-gray-800'>{product?.name}</div>}
            visible={visible}
            style={{ width: '50vw' }}
            onHide={() => {
                setVisible(false)
                setQuantity(1)
            }}
        >
            <div className='p-2'>
                <div className='mb-2'>
                    <span className='text-lg font-semibold text-gray-600'>Số lượng có sẵn: {product?.quantity}</span>
                </div>

                <div className='space-y-3'>
                    {product?.attributes.map((attribute) => (
                        <div
                            key={attribute.id}
                            className='flex items-center gap-3 p-3 rounded-lg bg-gray-100 shadow-md hover:shadow-lg transition-shadow duration-200'
                        >
                            <span className='font-medium text-gray-800 text-sm md:text-base'>{attribute.name}:</span>
                            <span className='text-white rounded-md bg-blue-600 px-3 py-1 text-sm md:text-base shadow-sm'>
                                {attribute.value?.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className='mt-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Chọn số lượng:</label>
                    <InputNumber
                        onValueChange={(e) => setQuantity(e.value ?? 1)}
                        value={quantity}
                        defaultValue={1}
                        min={quantity === 1 ? 1 : 0}
                        max={product?.quantity ?? 1}
                        showButtons
                        buttonLayout='horizontal'
                        decrementButtonClassName='p-button-secondary'
                        incrementButtonClassName='p-button-secondary'
                        incrementButtonIcon='pi pi-plus'
                        decrementButtonIcon='pi pi-minus'
                        className='w-full'
                        inputClassName='text-center'
                    />
                </div>

                <div className='flex justify-end mt-5'>
                    <Button
                        label='Lưu'
                        onClick={onSave}
                        className='bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200'
                    />
                </div>
            </div>
        </Dialog>
    )
}

export default QuantityDialog
