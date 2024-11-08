'use client'
import { Address, Province } from '@/interface/address.interface'
import { cn } from '@/libs/utils'
import districtService from '@/service/district.service'
import wardService from '@/service/ward.service'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { classNames } from 'primereact/utils'
import { useRef, useState } from 'react'

interface FormProps {
    provinces: Province[]
    submitted: boolean
    onAddressChange: (address: Address) => void
    className?: string
}

const emtyAddress: Address = {
    provinceId: '',
    districtId: '',
    wardId: ''
}
const AddressComponent = ({ provinces, submitted, className, onAddressChange }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [address, setAddress] = useState<Address>(emtyAddress)
    const [districts, setDistricts] = useState<Province[]>([])
    const [wards, setWards] = useState<Province[]>([])

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

    const handleAddressChange = (updatedAddress: Address) => {
        setAddress(updatedAddress)
        onAddressChange(updatedAddress)
    }

    return (
        <>
            <div className='w-full'>
                <Toast ref={toast} />
                <div className={cn('flex w-full gap-x-4 flex-1', className)}>
                    <div className='field w-1/3'>
                        <label htmlFor='province' className='font-medium block'>
                            Province
                        </label>
                        <Dropdown
                            value={provinces.find((province) => province.code === address.provinceId)}
                            onChange={(e) => {
                                const updatedAddress = { ...address, provinceId: e.target.value.code }
                                handleAddressChange(updatedAddress)
                                fetchDistricts(e.target.value.code)
                            }}
                            options={provinces}
                            optionLabel='fullName'
                            placeholder='Select a Province'
                            filter
                            className={(classNames({ 'p-invalid': submitted && !address.provinceId }), 'w-full')}
                        />
                        {submitted && !address.provinceId && (
                            <small className='p-error block'>Province is required.</small>
                        )}
                    </div>
                    <div className='field w-1/3'>
                        <label htmlFor='district' className='font-medium block'>
                            District
                        </label>
                        <Dropdown
                            value={districts.find((district) => district.code === address.districtId)}
                            onChange={(e) => {
                                const updatedAddress = { ...address, districtId: e.target.value.code }
                                handleAddressChange(updatedAddress)
                                fetchWards(e.target.value.code)
                            }}
                            options={districts}
                            optionLabel='fullName'
                            placeholder='Select a District'
                            filter
                            disabled={!address.provinceId}
                            className={(classNames({ 'p-invalid': submitted && !address.districtId }), 'w-full')}
                        />
                        {submitted && !address.districtId && (
                            <small className='p-error block'>District is required.</small>
                        )}
                    </div>
                    <div className='field w-1/3'>
                        <label htmlFor='ward' className='font-medium block'>
                            Ward
                        </label>
                        <Dropdown
                            value={wards.find((ward) => ward.code === address.wardId)}
                            onChange={(e) => {
                                const updatedAddress = { ...address, wardId: e.target.value.code }
                                handleAddressChange(updatedAddress)
                            }}
                            options={wards}
                            optionLabel='fullName'
                            placeholder='Select a Ward'
                            filter
                            disabled={!address.districtId}
                            className={(classNames({ 'p-invalid': submitted && !address.wardId }), 'w-full')}
                        />
                        {submitted && !address.wardId && <small className='p-error block'>Ward is required.</small>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddressComponent
