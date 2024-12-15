import React from 'react'
import { RadioButton } from 'primereact/radiobutton'
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaCalendarMinus } from 'react-icons/fa'

const filterOptions = [
    { value: 'today', label: 'Hôm nay', icon: <FaCalendarDay className='text-blue-600' /> },
    { value: 'thisWeek', label: 'Tuần này', icon: <FaCalendarWeek className='text-green-600' /> },
    { value: 'thisMonth', label: 'Tháng này', icon: <FaCalendarMinus className='text-yellow-600' /> },
    { value: 'thisYear', label: 'Năm này', icon: <FaCalendarAlt className='text-red-600' /> },
    { value: 'custom', label: 'Tùy chọn', icon: <FaCalendarAlt className='text-purple-600' /> }
]

interface FilterOptionsProps {
    filter: string
    setFilter: (value: string) => void
}

const FilterOptions = ({ filter, setFilter }: FilterOptionsProps) => {
    return (
        <div className='card flex flex-wrap gap-4 mb-4 justify-between'>
            {filterOptions.map((option) => (
                <div key={option.value} className='flex align-items-center'>
                    <RadioButton
                        inputId={option.value}
                        name='filter'
                        value={option.value}
                        onChange={() => setFilter(option.value)}
                        checked={filter === option.value}
                    />
                    <label htmlFor={option.value} className='ml-2 mr-4 flex align-items-center gap-1'>
                        {option.icon} <span className='font-semibold'>{option.label}</span>
                    </label>
                </div>
            ))}
        </div>
    )
}

export default FilterOptions
