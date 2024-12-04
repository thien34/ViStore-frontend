'use client'
import { Address, Province } from '@/interface/address.interface'
import { cn } from '@/libs/utils'
import districtService from '@/service/district.service'
import wardService from '@/service/ward.service'
import { Dropdown } from 'primereact/dropdown'
import { useUpdateEffect } from 'primereact/hooks'
import { Toast } from 'primereact/toast'
import { classNames } from 'primereact/utils'
import { useRef, useState } from 'react'

interface FormProps {
    provinces: Province[]
    submitted: boolean
    onAddressChange: (address: Address) => void
    className?: string
    addressDetail?: Address
}

const emptyAddress: Address = {
    provinceId: '',
    districtId: '',
    wardId: '',
    province: '',
    district: '',
    address: ''
}
const AddressComponent = ({ provinces, submitted, className, onAddressChange, addressDetail }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [address, setAddress] = useState<Address>(addressDetail || emptyAddress)
    const [districts, setDistricts] = useState<Province[]>([])
    const [wards, setWards] = useState<Province[]>([])

    const fetchDistricts = async (provinceId: string) => {
        const { payload: districts } = await districtService.getAll(provinceId)
        setDistricts(districts)
        setWards([])
    }

    const fetchWards = async (districtId: string) => {
        if (districtId) {
            const { payload: wards } = await wardService.getAll(districtId)
            setWards(wards)
        }
    }

    const handleAddressChange = (updatedAddress: Address) => {
        setAddress(updatedAddress)
        onAddressChange(updatedAddress)
    }
    useUpdateEffect(() => {
        if (addressDetail) {
            setAddress(addressDetail)
            fetchDistricts(addressDetail.provinceId).then(() => fetchWards(addressDetail.districtId))
        } else {
            setAddress(emptyAddress)
            setDistricts([])
            setWards([])
        }
    }, [addressDetail])

    return (
        <>
            <div className='w-full'>
                <Toast ref={toast} />
                <div className={cn('flex w-full gap-x-4 flex-1', className)}>
                    <div className='field w-1/3'>
                        <label htmlFor='province' className='font-medium block'>
                            Tỉnh
                        </label>
                        <Dropdown
                            value={provinces.find((province) => province.code === address.provinceId)}
                            onChange={(e) => {
                                const updatedAddress = {
                                    provinceId: e.target.value.code,
                                    province: e.target.value.fullName,
                                    districtId: '',
                                    district: '',
                                    wardId: '',
                                    ward: '',
                                    address: ''
                                }
                                handleAddressChange(updatedAddress)
                                fetchDistricts(e.target.value.code)
                            }}
                            options={provinces}
                            optionLabel='name'
                            placeholder='Chọn tỉnh'
                            filter
                            className={(classNames({ 'p-invalid': submitted && !address.provinceId }), 'w-full')}
                        />
                        {submitted && !address.provinceId && (
                            <small className='p-error block'>Tỉnh là bắt buộc.</small>
                        )}
                    </div>
                    <div className='field w-1/3'>
                        <label htmlFor='district' className='font-medium block'>
                            Quận
                        </label>
                        <Dropdown
                            value={districts.find((district) => district.code === address.districtId)}
                            onChange={(e) => {
                                const updatedAddress = {
                                    ...address,
                                    districtId: e.target.value.code,
                                    district: e.target.value.fullName
                                }
                                handleAddressChange(updatedAddress)
                                fetchWards(e.target.value.code)
                            }}
                            options={districts}
                            optionLabel='name'
                            placeholder='Chọn quận'
                            filter
                            disabled={!address.provinceId}
                            className={(classNames({ 'p-invalid': submitted && !address.districtId }), 'w-full')}
                        />
                        {submitted && !address.districtId && (
                            <small className='p-error block'>Quận là bắt buộc.</small>
                        )}
                    </div>
                    <div className='field w-1/3'>
                        <label htmlFor='ward' className='font-medium block'>
                            Phường
                        </label>
                        <Dropdown
                            value={wards.find((ward) => ward.code === address.wardId)}
                            onChange={(e) => {
                                const updatedAddress = {
                                    ...address,
                                    wardId: e.target.value.code,
                                    ward: e.target.value.fullName
                                }
                                handleAddressChange(updatedAddress)
                            }}
                            options={wards}
                            optionLabel='name'
                            placeholder='Chọn phường'
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
