'use client'
import { ReturnRequest } from "@/interface/returnProduct.interface"
import returnProductService from "@/service/returnProduct.service"
import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Dialog } from "primereact/dialog"
import { Divider } from "primereact/divider"
import { Tag } from "primereact/tag"
import { useRef, useState } from "react"

interface ReturnRequestProps {
    initialData: ReturnRequest[]
}

const ListReturnRequests = ({ initialData }: ReturnRequestProps) => {
    const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(initialData)
    const data = useRef<DataTable<ReturnRequest[]>>(null)
    const [visible, setVisible] = useState(false)
    // const fetchReturnRequests = async () => {
    //     const { payload: data } = await returnProductService.getAllReturnRequest();
    //     setReturnRequests(data.items);
    // }
    const getTagValue = (status: string): "info" | "success" | "danger" | "warning" => {
        switch (status) {
            case 'PENDING':
                return 'info';
            case 'APPROVED':
                return 'warning';
            case 'REJECTED':
                return 'danger';
            case 'EXCHANGED':
                return 'success';
            case 'REFUNDED':
                return 'success';
            case 'CLOSED':
                return 'success';
            default:
                return 'info';
        }
    }

    const actionBodyTemplate = (rowData: ReturnRequest) => {
        return (
            <>
                <Button label="Hiển thị" icon="pi pi-expand" onClick={() => setVisible(true)} />
                <Dialog header="Header" visible={visible} style={{ width: '50vw' }} onHide={() => { if (!visible) return; setVisible(false); }} >
                    <p className="m-0">
                        DANH SÁCH HÀNG TRẢ LẠI
                    </p>
                </Dialog>
            </>
        )
    }

    return (
        <div className='card'>
            <DataTable
                ref={data}
                value={returnRequests}
                dataKey='id'
                removableSort
                resizableColumns
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                currentPageReportTemplate='Hiển thị từ {first} đến {last} trong tổng số {totalRecords} yêu cầu trả hàng'
                emptyMessage='Không tìm thấy yêu cầu trả hàng'
            >
                {/* <Column
                    selectionMode='multiple'
                    headerStyle={{
                        width: '4rem'
                    }}
                ></Column> */}
                <Column
                    header="Khách Hàng"
                    body={(rowData) => `${rowData.firstName} ${rowData.lastName}`}
                />
                <Column field='reasonForReturn' header='Lý Do' />
                <Column field='requestAction' header='Yêu Cầu Hành Động' />
                <Column field='returnRequestStatusId' header='Trạng Thái'
                    body={(rowData: ReturnRequest) => {
                        return (
                            <div>
                                <Tag value={rowData.returnRequestStatusId} severity={getTagValue(rowData.returnRequestStatusId)}></Tag>
                            </div>
                        )
                    }}
                />
                <Column header='Thao Tác'
                    body={actionBodyTemplate}
                />
            </DataTable>
        </div>
    )
}
export default ListReturnRequests
