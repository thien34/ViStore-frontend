'use client'
import CartService from '@/service/CartService'
import { Button } from 'primereact/button'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup'
import { useLocalStorage, useUpdateEffect } from 'primereact/hooks'

import { TabPanel, TabPanelHeaderTemplateOptions, TabView } from 'primereact/tabview'

import { Toast } from 'primereact/toast'

import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ProductListComponent from './_components/ProductList'
type Props = {}

type Tab = {
    id: string
    header: string
    content: JSX.Element
    billId: string
}

export default function Retail({}: Props) {
    const [tabs, setTabs] = useState<Tab[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [billId, setBillId] = useLocalStorage<string>('billId', '')
    const toast = useRef<Toast>(null)

    useUpdateEffect(() => {
        CartService.getBills()
            .then((res) => {
                if (res) {
                    const billData = res
                    const newTabs = Object.entries(billData)
                        .sort(([, quantityA], [, quantityB]) => Number(quantityA) - Number(quantityB))
                        .map(([billId, quantity]) => ({
                            id: billId,
                            header: `Bill ${quantity}`,
                            content: <ProductListComponent />,
                            billId: billId
                        }))
                    setTabs(newTabs)
                    setBillId(newTabs[0]?.id || '')
                }
            })
            .catch((error) => {
                console.error('Error fetching bills:', error)
            })
    }, [billId])

    const tabHeaderTemplate = (options: TabPanelHeaderTemplateOptions, header: string) => {
        return (
            <div className='flex align-items-center gap-2 p-3' style={{ cursor: 'pointer' }} onClick={options.onClick}>
                <span className='font-bold white-space-nowrap'>{header}</span>
                <Button
                    icon='pi pi-times'
                    className='p-button-rounded p-button-text p-button-sm ml-2'
                    onClick={(e) => {
                        e.stopPropagation()
                        confirmDelete(options.index, header, e.currentTarget)
                    }}
                />
            </div>
        )
    }

    const addTab = async () => {
        const newId = uuidv4()
        const newHeader = `Bill ${tabs.length + 1}`
        if (tabs.length >= 10) {
            showError()
            return
        }
        await CartService.addBill(newId)
        setBillId(newId)
        setTabs([...tabs, { id: newId, header: newHeader, content: <ProductListComponent />, billId: newId }])
        setActiveIndex(tabs.length)
    }

    const removeTab = (tabIndex: number, billId: string) => {
        const newTabs = tabs.filter((_, index) => index !== tabIndex)

        CartService.deleteBill(billId)
        setTabs(newTabs)

        if (newTabs.length > 0) {
            if (tabIndex === activeIndex) {
                const newActiveIndex = tabIndex === newTabs.length ? activeIndex - 1 : activeIndex
                setActiveIndex(newActiveIndex)
                setBillId(newTabs[newActiveIndex].billId)
            } else {
                setActiveIndex(activeIndex > tabIndex ? activeIndex - 1 : activeIndex)
                setBillId(newTabs[activeIndex > tabIndex ? activeIndex - 1 : activeIndex].billId)
            }
        } else {
            setActiveIndex(0)
            setBillId('')
        }
    }

    const handleTabChange = (e: { index: number }) => {
        setActiveIndex(e.index)
        const currentTabId = tabs[e.index].id
        setBillId(currentTabId)
    }

    const showError = () => {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'You can only create up to 10 bill.',
            life: 1000
        })
    }

    const confirmDelete = (tabIndex: number, header: string, target: HTMLElement) => {
        const billId = tabs[tabIndex].billId
        confirmPopup({
            message: `Do you want to delete this ${header} ?`,
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            target: target,
            accept: () => removeTab(tabIndex, billId)
        })
    }

    return (
        <div className='card'>
            <div className='flex justify-between items-center'>
                <h2 className=''>Retail Sales</h2>
                <Button label='Create bill' onClick={addTab} />
            </div>

            <TabView className='mt-5' activeIndex={activeIndex} onTabChange={handleTabChange}>
                {tabs.map((tab, index) => (
                    <TabPanel
                        key={tab.id}
                        closable
                        headerTemplate={(options) => tabHeaderTemplate(options, tab.header)}
                    >
                        {tab.content}
                    </TabPanel>
                ))}
            </TabView>
            <ConfirmPopup />
            <Toast ref={toast} />
        </div>
    )
}

const styles = {
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    }
}
