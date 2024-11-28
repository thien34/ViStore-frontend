'use client'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from "primereact/inputtext"
import { InputSwitch } from 'primereact/inputswitch';
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { use, useEffect, useRef, useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { CustomerOrderResponse, OrderItemInfoResponse, ReturnInvoiceRequest, ReturnItemRequest, ReturnRequest, ReturnRequestRequest } from '@/interface/returnProduct.interface';
import { InputNumber } from 'primereact/inputnumber';
import ModalInputExample from './InputMultiple';
import returnProductService from '@/service/returnProduct.service';
import { Toast } from 'primereact/toast';
const reasons = [
    'Product damaged, but shipping box OK',
    'Missing parts of accessories',
    'Both product and shipping box damaged',
    'Wrong item was sent',
]
interface ReturnGoodsProps {
    openListModal: () => void;
    order?: CustomerOrderResponse;
    initialData: OrderItemInfoResponse[];
    fetchNewData: () => void;
};
const defaultReturnRequest: ReturnRequestRequest = {
    customerId: 0,
    orderId: 0,
    reasonForReturn: '',
    requestAction: 'Requesting exchange',
    totalReturnQuantity: 0,
    customerComments: '',
    staffNotes: '',
    returnFee: 0,
    returnRequestStatusId: 'RETURN_REQUESTED',
}

const returnGoods = ({ openListModal, order, initialData, fetchNewData }: ReturnGoodsProps) => {
    const [orderItems, setOrderItems] = useState<OrderItemInfoResponse[]>(initialData);
    const [mappedData, setMappedData] = useState<ReturnItemRequest[]>([]);
    const [returnRequest, setReturnRequest] = useState<ReturnRequestRequest>(defaultReturnRequest);
    const toast = useRef<Toast>(null)
    useEffect(() => {
        setOrderItems(initialData);
        const updatedMappedData = initialData.map((item) => ({
            returnRequestId: undefined,
            orderItemId: item.orderItemId ?? 0,
            productId: item.productId ?? null,
            quantity: 0,
            oldUnitPrice: item.productPrice,
            discountAmountPerItem: item.discountAmount / item.quantity,
            refundTotal: item.quantity * (item.productPrice - item.discountAmount),
        }));
        setMappedData(updatedMappedData);
        const updateReturnRequest = {
            customerId: order?.customerId,
            orderId: order?.orderId,
            reasonForReturn: '',
            requestAction: 'Requesting exchange',
            totalReturnQuantity: 0,
            customerComments: '',
            staffNotes: '',
            returnFee: 0,
            returnRequestStatusId: 'RETURN_REQUESTED',
        }
        setReturnRequest(updateReturnRequest);
    }, [initialData, order]);

    const handleReturnRequestChange = (updatedFields: Partial<ReturnRequestRequest>) => {
        setReturnRequest(prevReturnRequest => { return { ...prevReturnRequest, ...updatedFields } });
    }
    const onChangeRequestAction = (check: boolean) => {
        if (check == false) {
            handleReturnRequestChange({ requestAction: 'Requesting exchange' });
        } else {
            handleReturnRequestChange({ requestAction: 'Requesting refunds' });
        }
    }

    const isMappedDataValid = (): boolean => {
        if (mappedData.length === 0) {
            return false;
        }
        const filteredData = mappedData.filter(item => item.quantity > 0);
        return filteredData.length > 0;
    };

    const totalRefund = mappedData.reduce((total, item) => {
        return total + (item.quantity * (item.oldUnitPrice - item.discountAmountPerItem));
    }, 0);
    const refundCustomer = (totalRefund - returnRequest.returnFee) > 0 ? (totalRefund - returnRequest.returnFee).toFixed(3) : 0;
    const handleQuantityChange = (productId: number, quantity: number) => {
        const updatedData = mappedData.map((item: ReturnItemRequest) =>
            item.productId === productId
                ? {
                    ...item,
                    quantity,
                    refundTotal: quantity * (item.oldUnitPrice - item.discountAmountPerItem)
                }
                : item
        );
        const totalQuantity = updatedData.reduce((total: number, item: ReturnItemRequest) => total + item.quantity, 0);
        handleReturnRequestChange({ totalReturnQuantity: totalQuantity });
        return setMappedData(updatedData);
    };
    const disableSubmit = () => {
        if (returnRequest.reasonForReturn === '' || returnRequest.requestAction === '' || returnRequest.totalReturnQuantity === 0 || isMappedDataValid() === false) {
            return true;
        }
        return false;
    }
    const bodyQuantity = (rowData: OrderItemInfoResponse) => {
        const currentValue = mappedData.find((u) => u.productId === rowData.productId)?.quantity ?? rowData.quantity;
        return (
            <>
                <div style={{ width: '60px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <InputNumber
                        value={currentValue}
                        onValueChange={(e) => {
                            const newValue = e.value ?? 0;
                            const validValue = newValue <= 0 ? 0 : (newValue > rowData.quantity ? rowData.quantity : newValue);
                            handleQuantityChange(rowData.productId, validValue)
                        }}
                        onBlur={(e) => {
                            if (currentValue > rowData.quantity) {
                                handleQuantityChange(rowData.productId, rowData.quantity);
                            }
                        }}
                    />
                    <span >{`/ ${rowData.quantity}`}</span>
                </div>
            </>
        )
    }
    const handleChangeReturnFee = (value: number) => {
        handleReturnRequestChange({ returnFee: value });
    }
    const clearData = () => {
        setMappedData([]);
        setOrderItems([]);
        setReturnRequest(defaultReturnRequest);
    }
    const handleReturn = async () => {
        try {
            const listReturnItem = mappedData.filter(item => item.quantity > 0);

            const returnResponse = await returnProductService.createReturnRequest(returnRequest);

            if (returnResponse.status !== 200) {
                throw new Error('Failed to create return request');
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Create Return Request Success'
            });

            const returnResponsePayload = returnResponse.payload as { id: number, orderId: number };

            if (!returnResponsePayload || !returnResponsePayload.id || !returnResponsePayload.orderId) {
                throw new Error('Create return request failed: returnRequest or id not found');
            }

            const returnRequestId = returnResponsePayload.id;

            const returnInvoiceReq: ReturnInvoiceRequest = {
                returnRequestId: returnRequestId,
                orderId: returnResponsePayload.orderId,
                refundAmount: Number(refundCustomer) || 0,
            };

            const returnItemResponse = await returnProductService.createReturnItem(listReturnItem, returnRequestId);

            if (returnItemResponse.status === 200) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Create Return Item Success'
                });
            } else {
                throw new Error('Create return item failed');
            }

            const returnInvoiceResponse = await returnProductService.createReturnInvoice(returnInvoiceReq);

            if (returnInvoiceResponse.status === 200) {
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Create Return Invoice Success' });
            } else {
                throw new Error('Create return invoice failed');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: (error as Error).message || 'An error occurred during the return request process'
            });
        }
        fetchNewData();
    }
    const handleSubmit = () => {
        handleReturn();
        clearData();
    }
    const returnGoodsForm = (order?: CustomerOrderResponse) => {

        return (
            <>  <Toast ref={toast} />
                <div className="card p-fluid">
                    {order && (
                        <label htmlFor="" className='font-bold mb-5'>RETURN / {order.billCode} - {order.firstName + ' ' + order.lastName}</label>
                    )}
                    <div className="field grid mt-2">
                        <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-4 md:mb-0">
                            EXCHANGE
                        </label>
                        <div className="col-12 md:col-4">
                            <InputSwitch
                                checked={returnRequest.requestAction == 'Requesting refunds'}
                                onChange={(e) => onChangeRequestAction(e.value)} />
                        </div>
                    </div>
                    <div className="field grid mt-2">
                        <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                            Total Cost of Return
                        </label>
                        <div className="col-12 md:col-4 text-right">
                            <label className="font-bold">{totalRefund}$</label>
                        </div>
                    </div>
                    <div className="field grid mt-2">
                        <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                            Return Fee
                        </label>
                        <div className="col-12 md:col-4">
                            <ModalInputExample value={returnRequest.returnFee} totalCost={totalRefund} onChange={handleChangeReturnFee} />
                        </div>
                    </div>
                    <div className="field grid p-float-label mb-4">
                        <InputTextarea
                            id="staffNotes"
                            value={returnRequest.staffNotes}
                            onChange={(e) => handleReturnRequestChange({ staffNotes: e.target.value })}
                            rows={2}
                        />
                        <label className='font-bold' htmlFor="username">Staff Notes</label>
                    </div>
                    <div className="field grid p-float-label ">
                        <InputTextarea
                            id="customerComments"
                            value={returnRequest.customerComments}
                            onChange={(e) => handleReturnRequestChange({ customerComments: e.target.value })}
                            rows={2}
                        />
                        <label className='font-bold' htmlFor="username">Customer Comments</label>
                    </div>
                    <div className="field grid mt-2">
                        <label className="font-bold" htmlFor="reasonForReturn">Reason</label>
                        <Dropdown value={returnRequest.reasonForReturn} onChange={(e) => handleReturnRequestChange({ reasonForReturn: e.target.value })}
                            options={reasons}
                            placeholder="Choose reason return" style={{ width: '100%' }} />
                    </div>
                    <div className="field grid mt-2">
                        <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                            Total Quantity :
                        </label>
                        <div className="col-12 md:col-4 text-right">
                            <label className="font-bold">{returnRequest.totalReturnQuantity}</label>
                        </div>
                    </div>

                    <div className="field grid mt-2">
                        <label htmlFor="name3" className="font-bold col-12 mb-2 md:col-8 md:mb-0">
                            Refund Customer
                        </label>
                        <div className="col-12 md:col-4 text-right">
                            <label className="font-bold">{refundCustomer}$</label>
                        </div>
                    </div>
                    <div className="flex align-items-center">
                        <Button label="Submit" onClick={handleSubmit} disabled={disableSubmit()} className="p-button-success" />
                    </div>
                </div>
            </>
        )
    }
    return (
        <>
            <div>
                <div className='flex justify-content-end'>
                    <Button label="Create New Return Invoice" className="mb-2 " icon="pi pi-plus" onClick={openListModal} />
                </div>
                <div className="grid">
                    <div className="col-12 md:col-8 h-auto ">
                        <div className="card p-fluid">
                            <DataTable
                                value={orderItems}
                                dataKey='id'
                                removableSort
                                showGridlines
                                resizableColumns
                                scrollable tableStyle={{ minWidth: '50rem', minHeight: '300px' }}
                            >
                                <Column field='productName' header="Product Name"></Column>
                                <Column header="Quantity"
                                    body={bodyQuantity} />
                                <Column field='productPrice' header="Price"></Column>
                                <Column header="Discount Per Item" body={(rowData: OrderItemInfoResponse) =>
                                (
                                    <div>
                                        {rowData.discountAmount / rowData.quantity}$
                                    </div>
                                )
                                } />
                                <Column header="Total" body={(rowData: OrderItemInfoResponse) =>
                                (
                                    <div>
                                        {rowData.quantity * rowData.productPrice}$
                                    </div>
                                )
                                } />
                            </DataTable>
                        </div>
                    </div>
                    <div className="col-12 md:col-4 flex">
                        {returnGoodsForm(order)}
                    </div>
                </div>
            </div>
        </>
    )
}
export default returnGoods;