'use client'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useRef, useState, useEffect } from 'react'
import { Column } from 'primereact/column'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Tag } from 'primereact/tag'
import { classNames } from 'primereact/utils'
import { TriStateCheckbox } from 'primereact/tristatecheckbox'
import { FilterMatchMode } from 'primereact/api'
import { Promotion } from '@/interface/discount.interface'
import { useRouter } from 'next/navigation'

dayjs.extend(utc)
dayjs.extend(timezone)

const vietnamTime = (date: string) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')

interface DiscountProps {
    initialData: Promotion[]
}

const ListView = ({ initialData }: DiscountProps) => {
    const [discounts] = useState<Promotion[]>(initialData)
    const [filteredDiscounts, setFilteredDiscounts] = useState<Promotion[]>(initialData)
    const toast = useRef<Toast>(null)
    const router = useRouter()

    useEffect(() => {
        setFilteredDiscounts(discounts)
    }, [discounts])

    const leftToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <Button
                label='Add new discount'
                icon='pi pi-plus'
                severity='success'
                onClick={() => router.push('/admin/discounts/add')}
            />
        </div>
    )

    const formatDiscountValue = (rowData: Promotion) => {
        if (rowData.discountAmount) {
            return `${rowData.discountAmount} USD`
        } else if (rowData.discountPercentage) {
            return `${rowData.discountPercentage} %`
        }
        return ''
    }

    const statusBodyTemplate = (discount: Promotion) => {
        return <Tag value={discount.status} severity={getStatus(discount.status)} />
    }

    const getStatus = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'success'
            case 'UPCOMING':
                return 'info'
            case 'EXPIRED':
                return 'danger'
            default:
                return null
        }
    }

    const verifiedBodyTemplate = (rowData: any) => {
        return (
            <i
                className={classNames('pi', {
                    'text-green-500 true-icon pi-check-circle': rowData.isActive,
                    'text-red-500 false-icon pi-times-circle': !rowData.isActive
                })}
            ></i>
        )
    }
    const verifiedRowFilterTemplate = (options: any) => {
        return (
            <TriStateCheckbox
                value={options.value}
                onChange={(e) => {
                    const value = e.value
                    console.log('Filter value:', value)
                    try {
                        if (value === null) {
                            setFilteredDiscounts(discounts)
                        } else {
                            const filtered = discounts.filter((discount) => discount.isActive === value)
                            console.log('Filtered Discounts:', filtered)
                            setFilteredDiscounts(filtered)
                        }
                        options.filterApplyCallback(value)
                    } catch (error) {
                        console.error('Error while filtering discounts:', error)
                    }
                }}
            />
        )
    }
    return (
        <>
            <Toast ref={toast} />
            <div className='card'>
                {leftToolbarTemplate()}
                <DataTable value={filteredDiscounts} paginator rows={6} emptyMessage='No discounts found.'>
                    <Column field='name' header='Discount Name' sortable />
                    <Column header='Discount Value' body={formatDiscountValue} />
                    <Column
                        field='startDateUtc'
                        header='Start Date'
                        body={(rowData) => vietnamTime(rowData.startDateUtc)}
                        sortable
                    />
                    <Column
                        field='endDateUtc'
                        header='End Date'
                        body={(rowData) => vietnamTime(rowData.endDateUtc)}
                        sortable
                    />
                    <Column
                        field='isActive'
                        header='Active'
                        body={verifiedBodyTemplate}
                        filter
                        dataType='boolean'
                        filterElement={verifiedRowFilterTemplate}
                        sortable
                        filterMatchMode={FilterMatchMode.EQUALS}
                    />
                    <Column field='status' header='Status' body={statusBodyTemplate} sortable />
                </DataTable>
            </div>
        </>
    )
}

export default ListView
