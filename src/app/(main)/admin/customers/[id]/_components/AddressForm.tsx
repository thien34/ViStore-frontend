'use client'
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
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

interface FormProps {
    provinces: Province[]
    customerId: number
    fetchAdresses: () => Promise<void>
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

const AddressForm = forwardRef(({ provinces, customerId, fetchAdresses }: FormProps, ref) => {
    const toast = useRef<Toast>(null)
    const [addressDialog, setAddressDialog] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [items, setItems] = useState<string[]>([])
    const [address, setAddress] = useState<AddressRequest>(emtyAddress)
    const [districts, setDistricts] = useState<Province[]>([])
    const [wards, setWards] = useState<Province[]>([])

    const hideDialog = () => {
        setSubmitted(false)
        setAddressDialog(false)
        setDistricts([])
        setWards([])
    }

    const openNew = () => {
        setAddress(emtyAddress)
        setSubmitted(false)
        setAddressDialog(true)
    }

    useImperativeHandle(ref, () => ({
        openNew
    }))

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
            await addressService.create(address)
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Address Created',
                life: 3000
            })
        }
        hideDialog()
        fetchAdresses()
    }

    const addressDialogFooter = (
        <>
            <Button label='Cancel' icon='pi pi-times' outlined onClick={hideDialog} />
            <Button label='Save' icon='pi pi-check' onClick={saveAddress} />
        </>
    )
    return (
        <>
            <Dialog
                visible={addressDialog}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header='Address Details'
                style={{ width: '45vw' }}
                modal
                className='p-fluid'
                footer={addressDialogFooter}
                onHide={hideDialog}
            >
                <div className='flex flex-wrap justify-content-between w-full'>
                    <div className='field w-full md:w-[49%]'>
                        <label htmlFor='firstName' className='font-medium block'>
                            First name
                        </label>
                        <InputText
                            id='firstName'
                            value={address.firstName}
                            onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                            required
                            autoFocus
                            className={classNames({ 'p-invalid': submitted && !address.firstName })}
                        />
                        {submitted && !address.firstName && (
                            <small className='p-error block'>First name is required.</small>
                        )}
                    </div>
                    <div className='field w-full md:w-[49%]'>
                        <label htmlFor='lastName' className='font-medium block'>
                            Last name
                        </label>
                        <InputText
                            id='lastName'
                            value={address.lastName}
                            onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                            required
                            className={classNames({ 'p-invalid': submitted && !address.lastName })}
                        />
                        {submitted && !address.lastName && (
                            <small className='p-error block'>Last name is required.</small>
                        )}
                    </div>
                </div>
                <div className='flex flex-wrap justify-content-between w-full'>
                    <div className='field w-full md:w-[49%]'>
                        <label htmlFor='email' className='font-medium block'>
                            Email
                        </label>
                        <AutoComplete
                            id='email'
                            delay={230}
                            value={address.email}
                            suggestions={items}
                            completeMethod={search}
                            required
                            onChange={(e) => setAddress({ ...address, email: e.value })}
                            placeholder='Enter your email'
                            className={classNames({ 'p-invalid': submitted && !address.email })}
                        />
                        {submitted && !address.email && <small className='p-error'>Email is required.</small>}
                    </div>
                    <div className='field w-full md:w-[49%]'>
                        <label htmlFor='phoneNumber' className='font-medium block'>
                            Phone number
                        </label>
                        <InputText
                            id='phoneNumber'
                            value={address.phoneNumber}
                            onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                            required
                            className={classNames({ 'p-invalid': submitted && !address.phoneNumber })}
                        />
                        {submitted && !address.phoneNumber && (
                            <small className='p-error block'>Phone number is required.</small>
                        )}
                    </div>
                </div>
                <div className='flex flex-wrap justify-content-between w-full'>
                    <div className='field w-full md:w-[32%]'>
                        <label htmlFor='province' className='font-medium block'>
                            Province
                        </label>
                        <Dropdown
                            value={provinces.find((province) => province.code === address.provinceId)}
                            onChange={(e) => {
                                setAddress({ ...address, provinceId: e.target.value.code })
                                fetchDistricts(e.target.value.code)
                            }}
                            options={provinces}
                            optionLabel='fullName'
                            placeholder='Select a Province'
                            filter
                            className={classNames({ 'p-invalid': submitted && !address.provinceId })}
                        />
                        {submitted && !address.provinceId && (
                            <small className='p-error block'>Province is required.</small>
                        )}
                    </div>
                    <div className='field w-full md:w-[32%]'>
                        <label htmlFor='district' className='font-medium block'>
                            District
                        </label>
                        <Dropdown
                            value={districts.find((district) => district.code === address.districtId)}
                            onChange={(e) => {
                                setAddress({ ...address, districtId: e.target.value.code })
                                fetchWards(e.target.value.code)
                            }}
                            options={districts}
                            optionLabel='fullName'
                            placeholder='Select a District'
                            filter
                            disabled={!address.provinceId}
                            className={classNames({ 'p-invalid': submitted && !address.districtId })}
                        />
                        {submitted && !address.provinceId && (
                            <small className='p-error block'>District is required.</small>
                        )}
                    </div>
                    <div className='field w-full md:w-[32%]'>
                        <label htmlFor='ward' className='font-medium block'>
                            Ward
                        </label>
                        <Dropdown
                            value={wards.find((ward) => ward.code === address.wardId)}
                            onChange={(e) => setAddress({ ...address, wardId: e.target.value.code })}
                            options={wards}
                            optionLabel='fullName'
                            placeholder='Select a Ward'
                            filter
                            disabled={!address.districtId}
                            className={classNames({ 'p-invalid': submitted && !address.wardId })}
                        />
                        {submitted && !address.wardId && <small className='p-error block'>Ward is required.</small>}
                    </div>
                </div>
                <div className='field w-full'>
                    <label htmlFor='addressName' className='font-medium block'>
                        Address detail
                    </label>
                    <InputText
                        id='addressName'
                        value={address.addressName}
                        onChange={(e) => setAddress({ ...address, addressName: e.target.value })}
                        required
                        className={classNames({ 'p-invalid': submitted && !address.addressName })}
                    />
                    {submitted && !address.addressName && (
                        <small className='p-error block'>Address name is required.</small>
                    )}
                </div>
            </Dialog>
        </>
    )
})
AddressForm.displayName = 'AddressForm'
export default AddressForm
