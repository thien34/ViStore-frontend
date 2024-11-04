'use client'
import { RoleName } from '@/interface/role.interface'
import { AutoComplete, AutoCompleteCompleteEvent } from 'primereact/autocomplete'
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

interface FormProps {
    roles: RoleName[]
}
const emptyCustomer: Customer = {
    email: '',
    firstName: '',
    lastName: '',
    gender: '0',
    dateOfBirth: null,
    customerRoles: []
}
const domains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com']
const genders = [
    { name: 'Male', key: '0' },
    { name: 'Female', key: '1' }
]

const CustomerForm = ({ roles }: FormProps) => {
    const toast = useRef<Toast>(null)
    const [items, setItems] = useState<string[]>([])
    const [customer, setCustomer] = useState<Customer>(emptyCustomer)
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const search = (event: AutoCompleteCompleteEvent) => {
        setItems(domains.map((item) => event.query + item))
    }

    const saveCustomer = async () => {
        setSubmitted(true)
        if (customer.email.trim()) {
            await customerService.create(customer)
            toast.current?.show({
                severity: 'success',
                summary: 'Successful',
                detail: 'Customer Created',
                life: 3000
            })
            router.push('/admin/customers')
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className='flex'>
                <div className='col-12 md:col-8'>
                    <div className='card'>
                        <div className='text-xl font-medium mb-6'>General</div>
                        <div className='field'>
                            <label htmlFor='email' className='font-medium w-full'>
                                Email
                            </label>
                            <AutoComplete
                                id='email'
                                delay={230}
                                inputStyle={{ width: '100%' }}
                                value={customer.email}
                                suggestions={items}
                                completeMethod={search}
                                required
                                autoFocus
                                onChange={(e) => setCustomer({ ...customer, email: e.value })}
                                placeholder='Enter your email'
                                className={classNames({ 'p-invalid': submitted && !customer.email }, 'w-full')}
                            />
                            {submitted && !customer.email && <small className='p-error'>Email is required.</small>}
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
                                    value={customer.dateOfBirth}
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
                                                    value={gender}
                                                    onChange={(e) => setCustomer({ ...customer, gender: e.value.key })}
                                                    checked={customer.gender === gender.key}
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
                <div className='col-12 md:col-4'>
                    <div className='card'>
                        <div className='text-xl font-medium mb-6'>Role</div>
                        <div className='field'>
                            <label htmlFor='roleName' className='font-medium w-full'>
                                {customer.customerRoles}
                                Role name
                            </label>
                            <Dropdown
                                value={roles.find((role) => role.id === customer.customerRoles[0])}
                                onChange={(e) => setCustomer({ ...customer, customerRoles: [e.value.id] })}
                                options={roles}
                                optionLabel='name'
                                style={{ width: '100%' }}
                                placeholder='Select a role'
                                className={classNames(
                                    { 'p-invalid': submitted && customer.customerRoles.length < 1 },
                                    'md:w-full'
                                )}
                            />
                            {submitted && customer.customerRoles.length < 1 && (
                                <small className='p-error block'>Customer Role is required.</small>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-3'>
                <Button label='Submit' onClick={() => saveCustomer()} />
            </div>
        </>
    )
}
export default CustomerForm
