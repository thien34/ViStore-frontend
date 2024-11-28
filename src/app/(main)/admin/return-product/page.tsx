'use client'

import returnProductService from '@/service/returnProduct.service';
import { TabView, TabPanel } from 'primereact/tabview';
import ListReturnInvoices from './_components/ListReturnInvoices';
import ListReturnRequests from './_components/ListReturnRequest';
import { useEffect, useState } from 'react';
import { OrderItemInfoResponse, CustomerOrderResponse, ReturnInvoice, ReturnRequest } from '@/interface/returnProduct.interface';
import { Dialog } from 'primereact/dialog';
import ListOrder from './_components/ListOrder';
import ReturnGoods from './_components/ReturnGoods';


const initialOrderResponse: CustomerOrderResponse = {
    orderId: 0,
    billCode: "",
    orderDate: "",
    customerId: 0,
    firstName: "",
    lastName: "",
    orderTotal: 0,
};
const ReturnProduct = () => {
    const [dataReturnInvoices, setDataReturnInvoices] = useState<ReturnInvoice[]>([]);
    const [dataReturnRequests, setDataReturnRequests] = useState<ReturnRequest[]>([]);
    const [dataOrder, setDataOrder] = useState<CustomerOrderResponse[]>([]) // dataOrder
    const [order, setOrder] = useState<CustomerOrderResponse>(initialOrderResponse); //current order
    const [dataOrderItem, setDataOrderItem] = useState<OrderItemInfoResponse[]>([]) // dataOrderItem
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [loadingOrderItem, setLoadingOrderItem] = useState(true);
    const [visible, setVisible] = useState(false);
    const fetchData = async () => {
        try {
            const { payload: invoices } = await returnProductService.getAllReturnInvoice();
            const { payload: requests } = await returnProductService.getAllReturnRequest();
            const { payload: orders } = await returnProductService.getAllOrder();
            setDataReturnInvoices(invoices.items);
            setDataReturnRequests(requests.items);
            setDataOrder(orders.items)
            setLoadingInvoices(false);
            setLoadingRequests(false);
            setLoadingOrder(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoadingInvoices(false);
            setLoadingRequests(false);
            setLoadingOrder(false);
        }
    };
    const closeModal = () => {
        setVisible(false);
        fetchData();
    }

    const openOrderModal = () => {
        setVisible(true);
    }
    useEffect(() => {
        fetchData();
    }, [dataOrderItem]);

    const handleSetOrder = (order: CustomerOrderResponse) => {
        setOrder(order);
        setVisible(false);
    }
    const handleSetOrderItems = (orderItems: OrderItemInfoResponse[]) => {
        setDataOrderItem(orderItems);
    };
    return (
        <TabView>
            <TabPanel header="Return Invoices">
                {loadingInvoices ? (
                    <div>Loading...</div>
                ) : (
                    <ListReturnInvoices initialData={dataReturnInvoices} />
                )}
            </TabPanel>
            <TabPanel header="Return Requests">
                {loadingRequests ? (
                    <div>Loading...</div>
                ) : (
                    <ListReturnRequests initialData={dataReturnRequests} />
                )}
            </TabPanel>
            <TabPanel header="Return Goods">
                <Dialog header="Select Order to Return" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }} >
                    <p className="m-0">
                        <ListOrder setOrderItem={handleSetOrderItems} setOrderModalClose={closeModal} setOrder={handleSetOrder} initialData={dataOrder} />
                    </p>
                </Dialog>
                <ReturnGoods initialData={dataOrderItem} fetchNewData={fetchData} openListModal={openOrderModal} order={order} />
            </TabPanel>
        </TabView>
    );
};

export default ReturnProduct;
