import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { useRef, useState } from "react"
import ListReturnItems from "./ListOrderItems"
import { OrderItemInfoResponse, OrderResponse, ReturnInvoiceRequest, ReturnItem, ReturnItemRequest, ReturnRequestRequest } from "@/interface/returnProduct.interface"
import returnProductService from "@/service/returnProduct.service"
import ModalReturnProduct from "./ModalReturnProduct"
import { useRouter } from "next/navigation"

interface OrderProps {
    initialData: OrderResponse[],
    setOrderModalClose: () => void
}
const ListOrder = ({ initialData, setOrderModalClose }: OrderProps) => {
    const router = useRouter();
    const [orderItemInfo, setOrderItemInfo] = useState<OrderItemInfoResponse[]>([])
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [visible, setVisible] = useState(false)
    const [selectOrderItemModal, setselectOrderItemModal] = useState(false)
    const [returnItemModal, setreturnItemModal] = useState(false)
    const data = useRef<DataTable<OrderResponse[]>>(null)
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemInfoResponse[]>([])
    const fetchOrderItems = async (orderId: number) => {
        const { payload: orderitems } = await returnProductService.getOrderItemByOrderId(orderId);
        setOrderItemInfo(orderitems);
    }


    const showModal = async (orderId: number) => {
        try {
            setVisible(false);
            await fetchOrderItems(orderId);
            setselectOrderItemModal(true);

        } catch (error) {
            setVisible(true);
            console.error('Error fetch order items data:', error);
        }
    }
    const actionBodyTemplate = (rowData: { id: number, name: string }) => {
        return (
            <>
                <Button label="Chọn" icon="pi pi-expand" onClick={() => setVisible(true)} />
                <Dialog header="Header" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }} >
                    <p className="m-0">
                        LIST Order ITEMS
                    </p>
                </Dialog>
            </>
        )
    }

    const openReturnModal = () => {
        console.log(selectedOrderItems);
        setreturnItemModal(true);
    }

    const handleCloseAllModal = () => {
        console.log("Điều Hướng");
        setreturnItemModal(false);
        setselectOrderItemModal(false);
        setOrderModalClose();
    }

    const handleReturn = async (returnItems: ReturnItemRequest[], returnRequest: ReturnRequestRequest) => {
        try {

            const returnRequestResult = await returnProductService.createReturnRequest(returnRequest, returnItems);
            console.log('returnRequestResult', returnRequestResult);
            const returnRequestPayload = returnRequestResult.payload as { id: number, orderId: number };
            if (!returnRequestPayload?.id) {
                throw new Error('id is required');
            }
            const returnRequestId = returnRequestPayload.id;


            const returnItemResult = await returnProductService.createReturnItem(returnItems, returnRequestId);


            const returnInvoice: ReturnInvoiceRequest = {
                returnRequestId: returnRequestId,
                orderId: returnRequestPayload.orderId,
                refundAmount: returnItems.reduce((total, item) => total + (item.refundTotal || 0), 0),
            };
            const returnInvoiceResult = await returnProductService.createReturnInvoice(returnInvoice);

            const returnItemsPayload = returnItemResult.payload as ReturnItem[];
            if (!Array.isArray(returnItemsPayload)) {
                throw new Error('Expected return items to be an array');
            }
            await uploadImage(returnItemsPayload);
        } catch (error) {
            console.error('Error handling return:', error);
        }
    };
    async function urlToFile(imageUrl: string, fileName: string): Promise<File> {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        return file;
    }
    const uploadImage = async (returnItems: ReturnItem[]) => {
        const storedImages = JSON.parse(localStorage.getItem('productImages') || '[]');
        const imagesForReturnItems: { [key: number]: string } = {};
        returnItems.forEach(returnItem => {
            const image = storedImages.find((storedImage: { productId: number }) => storedImage.productId === returnItem.productId);
            if (image) {
                if (returnItem.id !== undefined) {
                    imagesForReturnItems[returnItem.id] = image.imageUrl;
                }
            }
        });
        Object.entries(imagesForReturnItems).forEach(async ([returnItemId, imageUrl]: [string, string]) => {
            const file = await urlToFile(imageUrl, `imageReturnItemId${returnItemId}.jpg`);
            await returnProductService.createPictureReturnProduct(file, Number(returnItemId));
        });
        localStorage.removeItem('productImages');
    }

    const listOrderItems = (rowData: { orderId: number, customerId: number, initialData: OrderItemInfoResponse[] }) => {
        return (
            <>
                <Button label="Select" icon="pi pi-verified" onClick={() => showModal(rowData.orderId)} />
                <Dialog header="Select Product To Return" visible={selectOrderItemModal} style={{ width: '50vw' }} onHide={() => setselectOrderItemModal(false)} >
                    <ListReturnItems initialData={orderItemInfo} onSelectedOrderItems={(orderItemInfo) => setSelectedOrderItems(orderItemInfo)} />
                    <Button label="Return" onClick={() => openReturnModal()} />
                    <Dialog
                        header="Return Product"
                        visible={returnItemModal}
                        style={{ width: '50vw' }}
                        onHide={() => setreturnItemModal(false)}
                    >
                        <ModalReturnProduct
                            orderId={rowData.orderId}
                            customerId={rowData.customerId}
                            initialData={selectedOrderItems}
                            onSelectedOrderItems={(orderItemInfo) => setSelectedOrderItems(orderItemInfo)}
                            submitReturnRequest={(returnItems, returnRequest) => {
                                // router.push('/admin/manfacturers');                                
                                handleReturn(returnItems, returnRequest);
                                handleCloseAllModal();
                            }}
                        />
                    </Dialog>
                </Dialog>
            </>
        )
    }

    return (
        <div className='card'>
            <DataTable
                ref={data}
                value={initialData}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} Orders'
                emptyMessage='No Orders found.'
            >
                <Column field='orderId' header='Order' />
                <Column
                    header="Customer"
                    body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
                />
                <Column
                    body={(rowData) => `${rowData.orderTotal}$`}
                    header="Total" />
                <Column body={
                    listOrderItems
                } />
            </DataTable>
        </div>
    )

}
export default ListOrder