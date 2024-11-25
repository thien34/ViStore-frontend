'use client'

import returnProductService from '@/service/returnProduct.service';
import { TabView, TabPanel } from 'primereact/tabview';
import ListReturnInvoices from './_components/ListReturnInvoices';
import ListReturnRequests from './_components/ListReturnRequest';
import { useEffect, useState } from 'react';
import { OrderItemInfoResponse, OrderResponse, ReturnInvoice, ReturnRequest } from '@/interface/returnProduct.interface';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import ListOrder from './_components/ListOrder';

const ReturnProduct = () => {
    const [dataReturnInvoices, setDataReturnInvoices] = useState<ReturnInvoice[]>([]);
    const [dataReturnRequests, setDataReturnRequests] = useState<ReturnRequest[]>([]);
    const [dataOrder, setDataOrder] = useState<OrderResponse[]>([])
    const [dataOrderItem, setDataOrderItem] = useState<OrderItemInfoResponse[]>([])
    const [loadingInvoices, setLoadingInvoices] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [loadingOrder, setLoadingOrder] = useState(true);
    const [loadingOrderItem, setLoadingOrderItem] = useState(true);
    const [visible, setVisible] = useState(false)
    const actionBodyTemplate = (rowData: ReturnInvoice) => {
        return (
            <>
                <Button label="Create New Return Invoice" className="mb-2" icon="pi pi-plus" onClick={() => setVisible(true)} />
                <Dialog header="Select Order to Return" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }} >
                    <p className="m-0">
                        <ListOrder setOrderModalClose={closeModal} initialData={dataOrder} />
                    </p>
                </Dialog>
            </>
        )
    }
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
        console.log('close modal')
        setVisible(false);
        fetchData();
    }
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <TabView>
            <TabPanel header="Return Invoices">
                {actionBodyTemplate({} as ReturnInvoice)}
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
                Return Goods Here
            </TabPanel>
        </TabView>
    );
};

export default ReturnProduct;
