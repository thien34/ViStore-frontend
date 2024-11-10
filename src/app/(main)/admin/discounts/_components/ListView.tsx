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
import { useRouter } from 'next/navigation'
import discountService from '@/service/discount.service'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'

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
    const router = useRouter()

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
            <Button
                label='Add new discount'
                icon='pi pi-plus'
                severity='success'
                onClick={() => router.push('/admin/discounts/add')}
            />
        </div>
    )

    const formatDiscountValue = (rowData: Promotion) => {
        return rowData.discountPercentage ? `${rowData.discountPercentage} %` : 'N/A'
    }

    const statusBodyTemplate = (discount: Promotion) => {
        return <Tag value={discount.status} severity={getStatus(discount.status)} />
    }
    const statuses: string[] = ['UPCOMING', 'ACTIVE', 'EXPIRED']
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
        return <Tag value={option} severity={getStatus(option)} />
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

    const editButtonTemplate = (rowData: Promotion) => {
        return (
            <Button
                icon='pi pi-pencil'
                severity='info'
                aria-label='Edit'
                rounded
                onClick={() => router.push(`/admin/discounts/${rowData.id}`)}
            />
        )
    }

    return (
        <>
            <Toast ref={toast} />
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
                    <Column body={editButtonTemplate} header='Actions' />
                </DataTable>
            </div>
        </>
    )
}

export default ListView
