'use client'
import { RoleName } from '@/interface/role.interface'
import { AutoComplete } from 'primereact/autocomplete'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { useRef, useState } from 'react'
import { RadioButton } from 'primereact/radiobutton'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Customer } from '@/interface/customer.interface'
import { Calendar } from 'primereact/calendar'
import { classNames } from 'primereact/utils'
import customerService from '@/service/customer.service'
import { useRouter } from 'next/navigation'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { AddressesResponse, Province } from '@/interface/address.interface'
import AddressForm from './AddressForm'
import addressService from '@/service/address.service'

interface FormProps {
    roles: RoleName[]
    initialData: Customer
    initAddresses: AddressesResponse[]
    provinces: Province[]
    customerId: number
}

const genders = [
    { name: 'Male', key: '0' },
    { name: 'Female', key: '1' }
]

const activities = [
    { name: 'Active', key: true },
    { name: 'Inactive', key: false }
]

const CustomerForm = ({ roles, initialData, initAddresses, provinces, customerId }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [addresses, setAddresses] = useState<AddressesResponse[]>(initAddresses)
    const [customer, setCustomer] = useState<Customer>(initialData)
    const [submitted, setSubmitted] = useState(false)
    const [selectedAddreses, setSelectedAddreses] = useState<AddressesResponse>()
    const [globalFilter, setGlobalFilter] = useState('')
    const dt = useRef<DataTable<AddressesResponse[]>>(null)
    const router = useRouter()

    const addressFormRef = useRef<{ openNew: (idAddress: number | null) => void }>(null)
    const openAddressDialog = (idAddress: number | null) => {
        addressFormRef.current?.openNew(idAddress)
    }

    const fetchAddresses = async () => {
        const { payload: data } = await addressService.getAll(customerId)
        setAddresses(data.items)
    }

    const saveCustomer = async () => {
        if (customer == initialData) {
            router.push('/admin/customers')
            return
        }
        setSubmitted(true)
        if (customer.email.trim()) {
            await customerService.update(customerId, customer)
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Customer Updated',
                life: 3000
            })
            router.push('/admin/customers')
        }
    }

    const header = (
        <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center'>
            <h5 className='m-0'>Manage Address</h5>
            <span className='block mt-2 md:mt-0 p-input-icon-left'>
                <i className='pi pi-search' />
                <InputText
                    type='search'
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder='Search...'
                />
            </span>
        </div>
    )

    const actionBodyTemplate = (rowData: Customer) => {
        return (
            <>
                <Button
                    icon='pi pi-pencil'
                    rounded
                    outlined
                    className='mr-2'
                    onClick={() => openAddressDialog(rowData.id ?? null)}
                />
                <Button
                    icon='pi pi-trash'
                    rounded
                    outlined
                    severity='danger'
                    // onClick={() => confirmDeleteProduct(rowData)}
                />
            </>
        )
    }

    return (
        <>
            <Toast ref={toast} />
            <div className='flex gap-x-4'>
                <div className='w-2/3'>
                    <div className='card h-full'>
                        <div className='text-xl font-medium mb-6'>General</div>
                        <div className='field'>
                            <label htmlFor='email' className='font-medium w-full'>
                                Email
                            </label>
                            <AutoComplete
                                id='email'
                                readOnly
                                delay={230}
                                inputStyle={{ width: '100%' }}
                                value={customer.email}
                                onChange={(e) => setCustomer({ ...customer, email: e.value })}
                                className={'w-full'}
                            />
                            <small className='p-info'>Email cannot be updated.</small>
                        </div>
                        <div className='flex flex-wrap'>
                            <div className='field'>
                                <label htmlFor='firstName' className='font-medium w-full'>
                                    First name
                                </label>
                                <InputText
                                    id='firstName'
                                    value={customer.firstName}
                                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                                    required
                                    className={classNames({ 'p-invalid': submitted && !customer.firstName })}
                                />
                                {submitted && !customer.firstName && (
                                    <small className='p-error block'>First name is required.</small>
                                )}
                            </div>
                            <div className='field'>
                                <label htmlFor='lastName' className='font-medium w-full'>
                                    Last name
                                </label>
                                <InputText
                                    id='lastName'
                                    value={customer.lastName}
                                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                                    required
                                    className={classNames({ 'p-invalid': submitted && !customer.lastName })}
                                />
                                {submitted && !customer.lastName && (
                                    <small className='p-error block'>Last name is required.</small>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-wrap'>
                            <div className='field'>
                                <label htmlFor='dob' className='font-medium w-full'>
                                    Date of birth
                                </label>
                                <Calendar
                                    readOnlyInput
                                    value={customer.dateOfBirth ? new Date(customer.dateOfBirth) : null}
                                    onChange={(e) => setCustomer({ ...customer, dateOfBirth: e.value || null })}
                                    className={classNames({ 'p-invalid': submitted && !customer.dateOfBirth })}
                                />
                                {submitted && !customer.dateOfBirth && (
                                    <small className='p-error block'>Date of birth is required.</small>
                                )}
                            </div>
                            <div className='field'>
                                <div className='flex flex-wrap gap-3'>
                                    <label htmlFor='name' className='font-medium w-full'>
                                        Gender
                                    </label>
                                    {genders.map((gender) => {
                                        return (
                                            <div key={gender.key} className='flex align-items-center'>
                                                <RadioButton
                                                    inputId={gender.key}
                                                    name='gender'
                                                    value={gender.key}
                                                    onChange={(e) => setCustomer({ ...customer, gender: e.value })}
                                                    checked={customer.gender == gender.key}
                                                />
                                                <label htmlFor={gender.key} className='ml-2'>
                                                    {gender.name}
                                                </label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-1/3'>
                    <div className='card mb-4'>
                        <div className='text-xl font-medium mb-6'>Role</div>
                        <div className='field'>
                            <Dropdown
                                value={roles.find((role) => role.id === customer.customerRoles[0])}
                                onChange={(e) => setCustomer({ ...customer, customerRoles: [e.value.id] })}
                                options={roles}
                                optionLabel='name'
                                style={{ width: '100%' }}
                            />
                            <div className='flex items-center gap-x-1 mt-2'>
                                <i className='pi pi-exclamation-circle'></i>
                                <small className='p-info'>The role determines the customer&apos;s permissions.</small>
                            </div>
                        </div>
                    </div>
                    <div className='card'>
                        <div className='text-xl font-medium mb-6'>Activity</div>
                        <div className='field'>
                            <Dropdown
                                value={activities.find((active) => active.key === customer.active)}
                                onChange={(e) => setCustomer({ ...customer, active: e.value.key })}
                                options={activities}
                                optionLabel='name'
                                style={{ width: '100%' }}
                            />
                            <div className='flex items-center gap-x-1 mt-2'>
                                <i className='pi pi-exclamation-circle'></i>
                                <small className='p-info'>User&apos;s account status.</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='card mt-2'>
                <div className='flex justify-content-between align-items-center mb-6'>
                    <div className='text-xl font-medium'>Addresses</div>
                    <Button label='Add new address' onClick={() => openAddressDialog(null)} />
                </div>
                <DataTable
                    ref={dt}
                    value={addresses}
                    selection={selectedAddreses}
                    onSelectionChange={(e) => setSelectedAddreses(e.value)}
                    dataKey='id'
                    removableSort
                    resizableColumns
                    showGridlines
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate='FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    currentPageReportTemplate='Showing {first} to {last} of {totalRecords} addresses'
                    globalFilter={globalFilter}
                    emptyMessage='No addresses found.'
                    header={header}
                >
                    <Column
                        selectionMode='multiple'
                        headerStyle={{
                            width: '4rem'
                        }}
                    />
                    <Column
                        field='name'
                        header='Name'
                        body={(rowData: AddressesResponse) => `${rowData.firstName} ${rowData.lastName}`}
                        sortable
                    />
                    <Column field='email' header='Email' sortable />
                    <Column field='phoneNumber' header='Phone number' sortable />
                    <Column field='addressDetail' header='Address' sortable />
                    <Column body={actionBodyTemplate}></Column>
                </DataTable>
            </div>
            <div className='my-3'>
                <Button label='Submit' onClick={() => saveCustomer()} />
            </div>
            <AddressForm
                provinces={provinces}
                ref={addressFormRef}
                customerId={customerId}
                fetchAdresses={fetchAddresses}
            />
        </>
    )
}
export default CustomerForm
