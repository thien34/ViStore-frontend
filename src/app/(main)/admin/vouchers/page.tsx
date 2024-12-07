'use client'

import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import { useRef, useState, useEffect } from 'react'
import { Column } from 'primereact/column'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import voucherService from '@/service/voucher.service'
import { Voucher } from '@/interface/voucher.interface'
import Link from 'next/link'
import { classNames } from 'primereact/utils'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'
import Spinner from '@/components/spinner/Spinner'
import discountService from '@/service/discount.service'
import { Image } from 'primereact/image'
import axios from 'axios'
import { Dropdown } from 'primereact/dropdown'
import { TabPanel, TabView } from 'primereact/tabview'

dayjs.extend(utc)
dayjs.extend(timezone)

const vietnamTime = (date: string) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')

const ListView = () => {
    const [discounts, setDiscounts] = useState<Voucher[]>([])
    const [filteredDiscounts, setFilteredDiscounts] = useState<Voucher[]>([])
    const toast = useRef<Toast>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'birthday' | 'nonBirthday'>('nonBirthday')
    const [discountPercentageBirthday, setDiscountPercentageBirthday] = useState<number>(0)
    const fetchDiscounts = async (isBirthday: boolean) => {
        try {
            setLoading(true)
            const response = await voucherService.getAll(isBirthday)
            setDiscounts(response)
            setFilteredDiscounts(response)
        } catch (error) {
            console.error('Error fetching discounts:', error)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchDiscounts(activeTab === 'birthday')
    }, [activeTab])
    const formatDiscountAndStock = (rowData: Voucher) => {
        const isPercentage = rowData.usePercentage
        const stockClassName = classNames(
            'w-4rem h-4rem inline-flex font-bold justify-content-center align-items-center text-sm',
            {
                'text-green-900': isPercentage && rowData.discountPercentage >= 1 && rowData.discountPercentage < 10,
                ' text-yellow-900': isPercentage && rowData.discountPercentage >= 10 && rowData.discountPercentage < 20,
                ' text-orange-900': isPercentage && rowData.discountPercentage >= 20 && rowData.discountPercentage < 30,
                ' text-teal-900': isPercentage && rowData.discountPercentage >= 30 && rowData.discountPercentage < 40,
                ' text-blue-900': isPercentage && rowData.discountPercentage >= 40 && rowData.discountPercentage < 50,
                ' text-red-900': isPercentage && rowData.discountPercentage >= 50,

                ' text-green-500': !isPercentage && rowData.discountAmount >= 1 && rowData.discountAmount < 10,
                ' text-yellow-500': !isPercentage && rowData.discountAmount >= 10 && rowData.discountAmount < 20,
                ' text-orange-500': !isPercentage && rowData.discountAmount >= 20 && rowData.discountAmount < 30,
                ' text-teal-500': !isPercentage && rowData.discountAmount >= 30 && rowData.discountAmount < 40,
                ' text-blue-500': !isPercentage && rowData.discountAmount >= 40 && rowData.discountAmount < 50,
                ' text-red-500': !isPercentage && rowData.discountAmount >= 50
            }
        )

        return (
            <div className={stockClassName}>
                {isPercentage ? `${rowData.discountPercentage.toFixed(0)} %` : `$${rowData.discountAmount.toFixed(2)}`}
            </div>
        )
    }
    const isCumulativeTemplate = (rowData: Voucher) => {
        return (
            <Tag
                severity={rowData.isCumulative ? 'success' : 'danger'}
                icon={rowData.isCumulative ? 'pi pi-check' : 'pi pi-times'}
                value={rowData.isCumulative ? 'True' : 'False'}
            />
        )
    }
    useEffect(() => {
        const fetchBirthdayDiscount = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/admin/vouchers/birthday-discount')
                setDiscountPercentageBirthday(response.data)
            } catch (error) {
                console.error('Error fetching birthday discount:', error)
            }
        }

        fetchBirthdayDiscount()
    }, [])

    async function handleUpdateBirthdayDiscount(percentage: number) {
        try {
            await axios.post('http://localhost:8080/api/admin/vouchers/birthday', {
                discountPercentageBirthday: percentage
            })
        } catch (error) {
            console.error('Error updating birthday discount:', error)
            throw error
        }
    }
    const confirmUpdateDiscount = () => {
        confirmDialog({
            message: `Are you sure you want to update the discount percentage to ${discountPercentageBirthday}%?`,
            header: 'Confirm Update',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Update',
            rejectLabel: 'No, Cancel',
            accept: async () => {
                setLoading(true)
                try {
                    await handleUpdateBirthdayDiscount(discountPercentageBirthday)
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Discount percentage updated successfully',
                        life: 3000
                    })
                } catch (error) {
                    console.error('Error updating birthday discount:', error)
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update discount percentage',
                        life: 3000
                    })
                } finally {
                    setLoading(false)
                }
            }
        })
    }

    const leftToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <Link href='/admin/vouchers/add'>
                <Button label='Add new discount' icon='pi pi-plus' severity='success' />
            </Link>
        </div>
    )
    const percentageOptions = Array.from({ length: 50 }, (_, index) => ({
        label: (index + 1).toString(),
        value: index + 1
    }))
    const rightToolbarTemplate = () => (
        <div className='flex flex-wrap gap-2 my-5'>
            <div className='flex items-center'>
                <label htmlFor='percentageInput' className='mr-2'>
                    Discount %:
                </label>
                <Dropdown
                    id='percentageSelect'
                    value={discountPercentageBirthday}
                    options={percentageOptions}
                    onChange={(e) => setDiscountPercentageBirthday(e.value)}
                    placeholder='Select discount percentage'
                    className='w-20rem'
                />

                <span className='ml-2'>%</span>
            </div>

            <Button
                label={loading ? 'Updating...' : 'Discount Percentage Default'}
                icon='pi pi-refresh'
                severity='warning'
                onClick={confirmUpdateDiscount}
                disabled={loading}
            />
        </div>
    )

    const statusBodyTemplate = (discount: Voucher) => {
        const { severity, icon } = getStatus(discount.status)
        return <Tag value={discount.status} severity={severity} icon={icon} />
    }

    const getStatus = (
        status: string
    ): { severity: 'success' | 'info' | 'danger' | 'warning' | null; icon: string | null } => {
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
    const typeBodyTemplate = (rowData: Voucher) => {
        if (rowData.isPublished) {
            return <Tag value='Public' icon='pi pi-unlock' severity='info' />
        } else {
            return <Tag value='Private' icon='pi pi-lock' severity='warning' />
        }
    }

    const voucherInfoTemplate = (rowData: Voucher) => {
        const imageUrl = rowData.usePercentage
            ? 'https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/percent-colorful.0e15568.png'
            : 'https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/dollar-colorful.5e618d0.png'

        return (
            <div className='flex items-center gap-2'>
                <Image
                    src={imageUrl}
                    alt='Discount Type'
                    className='w-4rem h-4rem mt-2'
                    style={{ borderRadius: '50%' }}
                />
                <div>
                    <div>{rowData.name}</div>
                    <div style={{ fontSize: '0.85em', color: '#888' }}>
                        {rowData.couponCode ? `Voucher code: ${rowData.couponCode}` : 'Applicable'}
                    </div>
                </div>
            </div>
        )
    }
    const tabContent = (isBirthday: boolean) => (
        <DataTable
            scrollable
            value={filteredDiscounts}
            paginator
            rows={6}
            rowsPerPageOptions={[10, 25, 50]}
            paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
            dataKey='id'
            currentPageReportTemplate='Showing {first} to {last} of {totalRecords} entries'
            emptyMessage='No discounts found.'
        >
            <Column header='Voucher Name | Voucher Code' frozen body={voucherInfoTemplate} />
            <Column header='Status' body={statusBodyTemplate} />
            <Column header='Discount Value' body={formatDiscountAndStock} />
            <Column header='Type' body={typeBodyTemplate} />
            <Column
                header='Limitation Times'
                body={(rowData) => (rowData.limitationTimes ? rowData.limitationTimes : 'Infinite')}
            />
            <Column header='Usage Count' field='usageCount' />
            <Column header='Is Cumulative' body={isCumulativeTemplate} />
            <Column
                header='Time of Discount Code'
                body={(rowData) => {
                    const startTime = vietnamTime(rowData.startDateUtc)
                    const endTime = vietnamTime(rowData.endDateUtc)
                    return `${startTime} - ${endTime}`
                }}
            />
            {activeTab === 'nonBirthday' && <Column header='Actions' body={editAndExpiredButtonTemplate} />}
        </DataTable>
    )

    const editAndExpiredButtonTemplate = (rowData: Voucher) => {
        return (
            <div className='flex gap-2'>
                {rowData.status !== 'CANCEL' && (
                    <Link href={`/admin/vouchers/${rowData.id}`}>
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

    const handleCancelDiscount = async (promotionId: number | undefined) => {
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
        } catch (error: unknown) {
            console.error('Error cancelling promotion:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error cancelling promotion',
                life: 3000
            })
        }
    }

    const openCancelConfirmDialog = (promotionId: number | undefined) => {
        confirmDialog({
            message: 'Are you sure you want to cancel this promotion?',
            header: 'Confirm Cancel',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Yes, Cancel',
            rejectLabel: 'No, Keep',
            accept: () => handleCancelDiscount(promotionId)
        })
    }

    const handleConfirmExpired = async (promotionId: number | undefined) => {
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
        } catch (error: unknown) {
            console.error('Error marking promotion as expired:', error)
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error marking promotion as expired',
                life: 3000
            })
        }
    }

    const openConfirmDialog = (promotionId: number | undefined) => {
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
            <Spinner isLoading={loading} />
            <div className='card'>
                <TabView
                    activeIndex={activeTab === 'birthday' ? 1 : 0}
                    onTabChange={(e) => setActiveTab(e.index === 1 ? 'birthday' : 'nonBirthday')}
                >
                    <TabPanel header='Non-Birthday Discounts'>
                        <div>{leftToolbarTemplate()}</div>
                        {tabContent(false)}
                    </TabPanel>
                    <TabPanel header='Birthday Discounts'>
                        <div>{rightToolbarTemplate()}</div>
                        {tabContent(true)}
                    </TabPanel>
                </TabView>
            </div>
        </>
    )
}

export default ListView
