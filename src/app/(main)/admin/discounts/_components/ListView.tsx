'use client'

import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Slider, SliderChangeEvent } from 'primereact/slider'
import { useRef, useState, useEffect } from 'react'
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Tag } from 'primereact/tag'
import { Card } from 'primereact/card'
import { Promotion } from '@/interface/discount.interface'
import discountService from '@/service/discount.service'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import Link from 'next/link'
import { classNames } from 'primereact/utils'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'

dayjs.extend(utc)
dayjs.extend(timezone)

const vietnamTime = (date: string) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')

const ListView = () => {
    const [discounts, setDiscounts] = useState<Promotion[]>([])
    const [filteredDiscounts, setFilteredDiscounts] = useState<Promotion[]>([])
    const [searchParams, setSearchParams] = useState({
        startDate: null,
        endDate: null,
        discountName: '',
        discountPercentage: [0, 100]
    })
    const toast = useRef<Toast>(null)
    useEffect(() => {
        const fetchDiscounts = async () => {
            const response = await discountService.getAll()
            setDiscounts(response)
            setFilteredDiscounts(response)
        }

        fetchDiscounts()
    }, [])
    // const fetchDiscounts = async () => {
    //     const response = await discountService.getAll()
    //     setDiscounts(response)
    //     setFilteredDiscounts(response)
    // }
    // useEffect(() => {
    //     fetchDiscounts()
    //     const intervalId = setInterval(() => {
    //         fetchDiscounts()
    //     }, 10000)
    //     return () => clearInterval(intervalId)
    // }, [])

    const formatDiscountAndStock = (rowData: any) => {
        const stockClassName = classNames(
            'border-circle w-4rem h-4rem inline-flex font-bold justify-content-center align-items-center text-sm',
            {
                'bg-green-100 text-green-900': rowData.discountPercentage >= 1 && rowData.discountPercentage < 10,
                'bg-yellow-100 text-yellow-900': rowData.discountPercentage >= 10 && rowData.discountPercentage < 20,
                'bg-orange-100 text-orange-900': rowData.discountPercentage >= 20 && rowData.discountPercentage < 30,
                'bg-teal-100 text-teal-900': rowData.discountPercentage >= 30 && rowData.discountPercentage < 40,
                'bg-blue-100 text-blue-900': rowData.discountPercentage >= 40 && rowData.discountPercentage < 50,
                'bg-red-100 text-red-900': rowData.discountPercentage >= 50
            }
        )

        return (
            <div className='flex flex-column align-items-start'>
                <div className={stockClassName}>{rowData.discountPercentage} %</div>
            </div>
        )
    }

    const handleSearch = () => {
        const filtered = discounts.filter((discount) => {
            const matchStartDate = searchParams.startDate
                ? dayjs(discount.startDateUtc).isAfter(searchParams.startDate)
                : true
            const matchEndDate = searchParams.endDate ? dayjs(discount.endDateUtc).isBefore(searchParams.endDate) : true
            const matchDiscountName = searchParams.discountName
                ? discount.name.toLowerCase().includes(searchParams.discountName.toLowerCase())
                : true
            const matchDiscountPercentage =
                discount.discountPercentage >= searchParams.discountPercentage[0] &&
                discount.discountPercentage <= searchParams.discountPercentage[1]

            return matchStartDate && matchEndDate && matchDiscountName && matchDiscountPercentage
        })

        setFilteredDiscounts(filtered)
    }

    const leftToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <Link href='/admin/discounts/add'>
                <Button label='Add new discount' icon='pi pi-plus' severity='success' />
            </Link>
        </div>
    )

    const statusBodyTemplate = (discount: Promotion) => {
        const { severity, icon } = getStatus(discount.status)
        return <Tag value={discount.status} severity={severity} icon={icon} />
    }
    const statuses: string[] = ['UPCOMING', 'ACTIVE', 'EXPIRED', 'CANCEL']

    const statusFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <Dropdown
                value={options.value}
                options={statuses}
                onChange={(e: DropdownChangeEvent) => options.filterCallback(e.value, options.index)}
                itemTemplate={statusItemTemplate}
                placeholder='Select One'
                className='p-column-filter'
                showClear
            />
        )
    }
    const statusItemTemplate = (option: string) => {
        const { severity, icon } = getStatus(option)
        return <Tag value={option} icon={icon} severity={severity} />
    }

    type SeverityType = 'success' | 'info' | 'danger' | 'warning' | null

    const getStatus = (status: string): { severity: SeverityType; icon: string | null } => {
        switch (status) {
            case 'ACTIVE':
                return { severity: 'success', icon: 'pi pi-check' }
            case 'UPCOMING':
                return { severity: 'info', icon: 'pi pi-info-circle' }
            case 'EXPIRED':
                return { severity: 'danger', icon: 'pi pi-times' }
            case 'CANCEL':
                return { severity: 'warning', icon: 'pi pi-exclamation-triangle' }
            default:
                return { severity: null, icon: null }
        }
    }

    const handleCancelDiscount = async (promotionId: string) => {
        try {
            await discountService.cancelDiscount(promotionId)

            const updatedDiscounts = discounts.map((discount) =>
                discount.id === promotionId ? { ...discount, status: 'CANCEL' } : discount
            )
            setDiscounts(updatedDiscounts)
            setFilteredDiscounts(updatedDiscounts)

            toast.current?.show({
                severity: 'success',
                summary: 'Status Updated',
                detail: 'Promotion marked as cancelled successfully!',
                life: 3000
            })
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error cancelling promotion',
                life: 3000
            })
        }
    }

    const editAndExpiredButtonTemplate = (rowData: Promotion) => {
        return (
            <div className='flex gap-2'>
                {rowData.status !== 'CANCEL' && (
                    <Link href={`/admin/discounts/${rowData.id}`}>
                        <Button icon='pi pi-pencil' severity='info' aria-label='Edit' rounded />
                    </Link>
                )}
                {rowData.status === 'ACTIVE' && (
                    <Button
                        icon='pi pi-times'
                        severity='danger'
                        aria-label='Expire'
                        onClick={() => openConfirmDialog(rowData.id)}
                        rounded
                    />
                )}
                {rowData.status === 'UPCOMING' && (
                    <Button
                        icon='pi pi-trash'
                        severity='warning'
                        aria-label='Notification'
                        onClick={() => openCancelConfirmDialog(rowData.id)}
                        rounded
                    />
                )}
            </div>
        )
    }

    const openCancelConfirmDialog = (promotionId: string) => {
        confirmDialog({
            message: 'Are you sure you want to cancel this promotion?',
            header: 'Confirm Cancel',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Cancel',
            rejectLabel: 'No, Keep',
            accept: () => handleCancelDiscount(promotionId),
            reject: () => {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Action cancelled.',
                    life: 3000
                })
            }
        })
    }

    const handleConfirmExpired = async (promotionId: string) => {
        try {
            await discountService.markAsExpired(promotionId)

            const updatedDiscounts = discounts.map((discount) =>
                discount.id === promotionId
                    ? { ...discount, status: 'EXPIRED', endDateUtc: new Date().toISOString() }
                    : discount
            )
            setDiscounts(updatedDiscounts)
            setFilteredDiscounts(updatedDiscounts)

            toast.current?.show({
                severity: 'success',
                summary: 'Status Updated',
                detail: 'Promotion marked as expired and end date set to now!',
                life: 3000
            })
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error marking promotion as expired',
                life: 3000
            })
        }
    }

    const openConfirmDialog = (promotionId: string) => {
        confirmDialog({
            message: 'Are you sure you want to mark this promotion as expired?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes',
            rejectLabel: 'No',
            accept: () => handleConfirmExpired(promotionId),
            reject: () => {
                toast.current?.show({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Action cancelled.',
                    life: 3000
                })
            }
        })
    }

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className='card'>
                <Card title='Search' className='mb-4'>
                    <div className='p-fluid grid formgrid'>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='startDate'>Start Date</label>
                            <Calendar
                                id='startDate'
                                value={searchParams.startDate}
                                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.value })}
                                dateFormat='dd/mm/yy'
                                showIcon
                                placeholder='Select Start Date'
                            />
                        </div>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='endDate'>End Date</label>
                            <Calendar
                                id='endDate'
                                value={searchParams.endDate}
                                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.value })}
                                dateFormat='dd/mm/yy'
                                showIcon
                                placeholder='Select End Date'
                            />
                        </div>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='discountName'>Discount Name</label>
                            <InputText
                                id='discountName'
                                value={searchParams.discountName}
                                onChange={(e) => setSearchParams({ ...searchParams, discountName: e.target.value })}
                                placeholder='Enter Discount Name'
                            />
                        </div>
                        <div className='field col-12'>
                            <label htmlFor='discountPercentage'>
                                Discount Percentage ({searchParams.discountPercentage[0]}% -{' '}
                                {searchParams.discountPercentage[1]}%)
                            </label>
                            <Slider
                                id='discountPercentage'
                                value={searchParams.discountPercentage}
                                onChange={(e: SliderChangeEvent) =>
                                    setSearchParams({ ...searchParams, discountPercentage: e.value })
                                }
                                range
                                min={0}
                                max={100}
                            />
                        </div>
                        <div className='col-12 text-right'>
                            <Button label='Search' icon='pi pi-search' onClick={handleSearch} className='mt-3' />
                        </div>
                    </div>
                </Card>

                {leftToolbarTemplate()}

                <DataTable
                    value={filteredDiscounts}
                    paginator
                    rows={6}
                    rowsPerPageOptions={[10, 25, 50]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    dataKey='id'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} entries'
                    emptyMessage='No discounts found.'
                >
                    <Column field='name' header='Discount Name' sortable />
                    <Column header='Discount Value' body={formatDiscountAndStock} />
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
                        field='status'
                        header='Status'
                        body={statusBodyTemplate}
                        sortable
                        filter
                        showClearButton={false}
                        showAddButton={false}
                        filterElement={statusFilterTemplate}
                        filterMenuStyle={{ width: '14rem' }}
                        style={{ width: '15%' }}
                    ></Column>
                    {/* <Column
                        field='active'
                        header='Active'
                        body={(rowData) =>
                            rowData.isActive ? (
                                <i className='pi pi-check' style={{ color: 'green' }}></i>
                            ) : (
                                <i className='pi pi-times' style={{ color: 'red' }}></i>
                            )
                        }
                        style={{ width: '10%' }}
                    /> */}
                    <Column body={editAndExpiredButtonTemplate} header='Actions' />
                </DataTable>
            </div>
        </>
    )
}

export default ListView
