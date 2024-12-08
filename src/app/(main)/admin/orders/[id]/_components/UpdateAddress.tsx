'use client'
import RequiredIcon from '@/components/icon/RequiredIcon'
import { AddressRequest, Province } from '@/interface/address.interface'
import addressService from '@/service/address.service'
import districtService from '@/service/district.service'
import wardService from '@/service/ward.service'
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { classNames } from 'primereact/utils'
import { useEffect, useRef, useState, useCallback } from 'react'

interface FormProps {
    provinces: Province[]
    customerId: number
    visible: boolean
    setVisible: (visible: boolean) => void
    idAddress: number | null
    hideDialog: () => void
}

const emtyAddress: AddressRequest = {
    firstName: '',
    lastName: '',
    email: '',
    districtId: '',
    provinceId: '',
    wardId: '',
    addressName: '',
    phoneNumber: '',
    customerId: 0
}

const domains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com']

const UpdateAddress = ({ provinces, customerId, visible, setVisible, idAddress, hideDialog }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [submitted, setSubmitted] = useState(false)
    const [items, setItems] = useState<string[]>([])
    const [address, setAddress] = useState<AddressRequest>(emtyAddress)
    const [districts, setDistricts] = useState<Province[]>([])
    const [wards, setWards] = useState<Province[]>([])

    const fetchData = useCallback(async () => {
        if (idAddress) {
            const { payload: address } = await addressService.getById(idAddress)
            setAddress(address)
            if (address.provinceId) {
                const { payload: districts } = await districtService.getAll(address.provinceId)
                setDistricts(districts)
            }
            if (address.districtId) {
                const { payload: wards } = await wardService.getAll(address.districtId)
                setWards(wards)
            }
        }
        setSubmitted(false)
    }, [idAddress])

    useEffect(() => {
        fetchData()
    }, [idAddress, fetchData])

    const search = (event: AutoCompleteCompleteEvent) => {
        setItems(domains.map((item) => event.query + item))
    }

    const fetchDistricts = async (provinceId: string) => {
        const { payload: districts } = await districtService.getAll(provinceId)
        setDistricts(districts)
        setWards([])
        setAddress((prev) => ({ ...prev, districtId: '', wardId: '' }))
    }

    const fetchWards = async (districtId: string) => {
        const { payload: wards } = await wardService.getAll(districtId)
        setWards(wards)
        setAddress((prev) => ({ ...prev, wardId: '' }))
    }

    const saveAddress = async () => {
        setSubmitted(true)
        address.customerId = customerId
        if (address.email.trim()) {
            if (address.id) {
                await addressService
                    .update(address.id, address)
                    .then(() => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Địa chỉ đã được cập nhật',
                            life: 3000
                        })
                        hideDialog()
                    })
                    .catch((error) => {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: error.message,
                            life: 3000
                        })
                    })
            } else {
                await addressService
                    .create(address)
                    .then(() => {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Địa chỉ đã được tạo',
                            life: 3000
                        })
                        hideDialog()
                    })
                    .catch((error) => {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Thất bại',
                            detail: error.message,
                            life: 3000
                        })
                    })
            }
        }
    }

    const addressDialogFooter = (
        <>
            <Button label='Hủy' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Lưu' icon='pi pi-check' onClick={saveAddress} />
        </>
    )
    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Chi tiết địa chỉ'
                style={{ width: '45vw' }}
                modal
                className='p-fluid'
                footer={addressDialogFooter}
                onHide={() => setVisible(false)}
            >
                <div className='flex w-full gap-x-5'>
                    <div className='field w-full'>
                        <label htmlFor='firstNameAdress' className='font-medium block'>
                            Tên Khách Hàng <RequiredIcon />
                        </label>
                        <InputText
                            id='firstNameAdress'
                            value={address.firstName}
                            onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                            required
                            autoFocus
                            className={classNames({ 'p-invalid': submitted && !address.firstName })}
                        />
                        {submitted && !address.firstName && (
                            <small className='p-error block'>Tên khách hàng là bắt buộc.</small>
                        )}
                    </div>
                    <div className='field w-full'>
                        <label htmlFor='lastNameAdress' className='font-medium block'>
                            Họ Khách Hàng <RequiredIcon />
                        </label>
                        <InputText
                            id='lastNameAdress'
                            value={address.lastName}
                            onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                            required
                            className={classNames({ 'p-invalid': submitted && !address.lastName })}
                        />
                        {submitted && !address.lastName && <small className='p-error block'>Họ là bắt buộc.</small>}
                    </div>
                </div>
                <div className='flex w-full gap-x-5'>
                    <div className='field w-full'>
                        <label htmlFor='emailAdress' className='font-medium block'>
                            Email <RequiredIcon />
                        </label>
                        <AutoComplete
                            inputId='emailAdress'
                            delay={230}
                            value={address.email}
                            suggestions={items}
                            completeMethod={search}
                            required
                            onChange={(e) => setAddress({ ...address, email: e.value })}
                            placeholder='Nhập email của bạn'
                            className={classNames({ 'p-invalid': submitted && !address.email })}
                        />
                        {submitted && !address.email && <small className='p-error'>Email là bắt buộc.</small>}
                    </div>
                    <div className='field w-full'>
                        <label htmlFor='phoneNumber' className='font-medium block'>
                            Số Điện Thoại <RequiredIcon />
                        </label>
                        <InputText
                            id='phoneNumber'
                            value={address.phoneNumber}
                            onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                            required
                            className={classNames({ 'p-invalid': submitted && !address.phoneNumber })}
                        />
                        {submitted && !address.phoneNumber && (
                            <small className='p-error block'>Số điện thoại là bắt buộc.</small>
                        )}
                    </div>
                </div>
                <div className='flex w-full gap-x-4'>
                    <div className='field w-full'>
                        <label htmlFor='province' className='font-medium block'>
                            Tỉnh <RequiredIcon />
                        </label>
                        <Dropdown
                            inputId='province'
                            value={provinces.find((province) => province.code === address.provinceId)}
                            onChange={(e) => {
                                setAddress({ ...address, provinceId: e.target.value.code })
                                fetchDistricts(e.target.value.code)
                            }}
                            options={provinces}
                            optionLabel='name'
                            placeholder='Chọn tỉnh'
                            filter
                            className={classNames({ 'p-invalid': submitted && !address.provinceId })}
                        />
                        {submitted && !address.provinceId && <small className='p-error block'>Tỉnh là bắt buộc.</small>}
                    </div>
                    <div className='field w-full'>
                        <label htmlFor='district' className='font-medium block'>
                            Quận <RequiredIcon />
                        </label>
                        <Dropdown
                            inputId='district'
                            value={districts.find((district) => district.code === address.districtId)}
                            onChange={(e) => {
                                setAddress({ ...address, districtId: e.target.value.code })
                                fetchWards(e.target.value.code)
                            }}
                            options={districts}
                            optionLabel='name'
                            placeholder='Chọn quận'
                            filter
                            disabled={!address.provinceId}
                            className={classNames({ 'p-invalid': submitted && !address.districtId })}
                        />
                        {submitted && !address.districtId && <small className='p-error block'>Quận là bắt buộc.</small>}
                    </div>
                    <div className='field w-full'>
                        <label htmlFor='ward' className='font-medium block'>
                            Phường <RequiredIcon />
                        </label>
                        <Dropdown
                            itemID='ward'
                            value={wards.find((ward) => ward.code === address.wardId)}
                            onChange={(e) => setAddress({ ...address, wardId: e.target.value.code })}
                            options={wards}
                            optionLabel='name'
                            placeholder='Chọn phường'
                            filter
                            disabled={!address.districtId}
                            className={classNames({ 'p-invalid': submitted && !address.wardId })}
                        />
                        {submitted && !address.wardId && <small className='p-error block'>Phường là bắt buộc.</small>}
                    </div>
                </div>
                <div className='field w-full'>
                    <label htmlFor='addressName' className='font-medium block'>
                        Chi tiết địa chỉ <RequiredIcon />
                    </label>
                    <InputText
                        id='addressName'
                        value={address.addressName}
                        onChange={(e) => setAddress({ ...address, addressName: e.target.value })}
                        required
                        className={classNames({ 'p-invalid': submitted && !address.addressName })}
                    />
                    {submitted && !address.addressName && (
                        <small className='p-error block'>Tên địa chỉ là bắt buộc.</small>
                    )}
                </div>
            </Dialog>
        </>
    )
}
export default UpdateAddress
