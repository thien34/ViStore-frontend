'use client'
import { Accordion, AccordionTab } from 'primereact/accordion'
import { PrimeIcons } from 'primereact/api'
import { AutoComplete } from 'primereact/autocomplete'
import { Button } from 'primereact/button'
import { Column, ColumnEvent } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Editor } from 'primereact/editor'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { useState } from 'react'

interface Attribute {
    code: number
    name: string
}

interface AttributeRow {
    selectedAttribute: Attribute | null
    selectedValues: string[]
}

interface CombinedRow {
    name: string
    sku: string
    gtin: string
    unitPrice: number
    productCost: number
    quantity: number
    images: File[]
}

interface ColumnMeta {
    field: string
    header: string
}

const columns: ColumnMeta[] = [
    { field: 'name', header: 'Name' },
    { field: 'sku', header: 'Sku' },
    { field: 'unitPrice', header: 'Unit Price' },
    { field: 'productCost', header: 'Product Cost' },
    { field: 'quantity', header: 'Quantity' }
]

const ProductPage = () => {
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([])
    const [combinedRows, setCombinedRows] = useState<CombinedRow[]>([])
    const [attributes, setAttributes] = useState<Attribute[]>([
        { code: 1, name: 'Màu sắc' },
        { code: 2, name: 'Kích thước' }
    ])
    const addCustomTag = (tag: string, index: number) => {
        setAttributeRows((prevRows) => {
            const newRows = [...prevRows]
            const row = newRows[index]
            if (tag && !row.selectedValues.includes(tag)) {
                row.selectedValues.push(tag)
            }
            return newRows
        })
    }

    const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (event.key === 'Enter') {
            const input = (event.target as HTMLInputElement).value
            addCustomTag(input, index)
            ;(event.target as HTMLInputElement).value = ''
            generateCombinations()
        }
    }

    const handleChange = (value: string[], index: number) => {
        const updatedRows = [...attributeRows]
        updatedRows[index].selectedValues = value
        setAttributeRows(updatedRows)

        generateCombinations()
        if (updatedRows[index].selectedValues.length === 0) {
            setCombinedRows([])
            generateCombinations()
        }
    }

    const addAttributeRow = () => {
        setAttributeRows([...attributeRows, { selectedAttribute: null, selectedValues: [] }])
    }
    const generateCombinations = () => {
        const selectedAttributes = attributeRows.filter((row) => row.selectedAttribute && row.selectedValues.length > 0)
        if (selectedAttributes.length > 0) {
            const values = selectedAttributes.map((row) => row.selectedValues)
            let newCombinations = [...combinedRows]

            if (values.length === 1) {
                const newRows = values[0].map((value, index) => {
                    const existingRow = newCombinations[index] || {}
                    return {
                        name: value,
                        sku: existingRow.sku || '',
                        productCost: existingRow.productCost || 0,
                        unitPrice: existingRow.unitPrice || 0,
                        quantity: existingRow.quantity || 0,
                        gtin: existingRow.gtin || '',
                        images: []
                    }
                })
                newCombinations = newRows
            } else if (values.length > 1) {
                for (const value1 of values[0]) {
                    for (const value2 of values[1]) {
                        const existingRowIndex = newCombinations.findIndex((row) => row.name === `${value1} - ${value2}`)

                        if (existingRowIndex === -1) {
                            newCombinations.push({
                                name: `${value1} - ${value2}`,
                                sku: '',
                                productCost: 0,
                                unitPrice: 0,
                                quantity: 0,
                                gtin: '',
                                images: []
                            })
                        } else {
                            const existingRow = newCombinations[existingRowIndex]
                            newCombinations[existingRowIndex] = {
                                name: `${value1} - ${value2}`,
                                sku: existingRow.sku || '',
                                productCost: existingRow.productCost || 0,
                                unitPrice: existingRow.unitPrice || 0,
                                quantity: existingRow.quantity || 0,
                                gtin: existingRow.gtin || '',
                                images: []
                            }
                        }
                    }
                }
            }

            setCombinedRows(newCombinations)
        }
    }

    const removeCombinationRow = (index: number) => {
        const newCombinedRows = combinedRows.filter((_, i) => i !== index)

        const updatedAttributeRows = attributeRows.map((row) => {
            const updatedSelectedValues = row.selectedValues.filter((value) => newCombinedRows.some((combinedRow) => combinedRow.name.includes(value)))
            return { ...row, selectedValues: updatedSelectedValues }
        })

        generateCombinations()
        setCombinedRows(newCombinedRows)
        setAttributeRows(updatedAttributeRows)
    }

    const removeAttributeRow = (index: number) => {
        setAttributeRows((prevRows) => prevRows.filter((_, i) => i !== index))
        attributeRows[index].selectedValues = []
        generateCombinations()
    }

    const isPositiveInteger = (val: number) => {
        let str = String(val)

        str = str.trim()

        if (!str) {
            return false
        }

        str = str.replace(/^0+/, '') || '0'
        const n = Math.floor(Number(str))

        return n !== Infinity && String(n) === str && n >= 0
    }

    const onCellEditComplete = (e: ColumnEvent) => {
        const { rowData, newValue, field, originalEvent: event } = e

        switch (field) {
            case 'quantity':
            case 'unitPrice':
            case 'productCost':
                if (isPositiveInteger(newValue)) rowData[field] = newValue
                else event.preventDefault()
                break

            case 'sku':
                if (isSkuUnique(newValue)) {
                    rowData[field] = newValue
                } else {
                    event.preventDefault()
                }
                break

            default:
                if (newValue.trim().length > 0) rowData[field] = newValue
                else event.preventDefault()
                break
        }
    }

    const isSkuUnique = (sku: string) => {
        return !combinedRows.some((row) => row.sku === sku)
    }
    const getAvailableAttributes = () => {
        const selectedAttributeCodes = new Set(attributeRows.map((row) => row.selectedAttribute?.code).filter(Boolean))
        return attributes.filter((attr) => !selectedAttributeCodes.has(attr.code))
    }
    // const chooseOptions = { icon: 'pi  pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' }

    const handleAddProduct = () => {
        console.log(combinedRows)
        const formData = new FormData()

        Object.keys(uploadedFiles).forEach((rowIndex) => {
            const index = Number(rowIndex)
            if (uploadedFiles[index]) {
                uploadedFiles[index].forEach((file: File) => {
                    formData.append('images', file)
                })
            }
        })

        console.log(formData)
    }

    const onUpload = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
        const files = event.target.files
        const newImages: string[] = []
        const newFiles: File[] = []

        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const imageUrl = URL.createObjectURL(file)
                newImages.push(imageUrl)
                newFiles.push(file)
            }
        }

        setUploadedImages((prev) => ({
            ...prev,
            [rowIndex]: newImages
        }))

        setUploadedFiles((prev) => ({
            ...prev,
            [rowIndex]: newFiles
        }))
    }

    const categories = [{ name: 'Phụ kiện Nữ', code: 'female_accessories' }]

    const manufactures = [
        { name: 'Thương hiệu 1', code: 'brand1' },
        { name: 'Thương hiệu 2', code: 'brand2' }
    ]
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedManufacture, setSelectedManufacture] = useState(null)
    const [text, setText] = useState<string>('')
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File[] }>({})
    const [uploadedImages, setUploadedImages] = useState<{ [key: number]: string[] }>({})

    const onRemoveImage = (rowIndex: number, imageIndex: number) => {
        setUploadedImages((prevImages) => {
            const updatedImages = { ...prevImages }
            // Xóa ảnh tại vị trí được chỉ định
            updatedImages[rowIndex] = updatedImages[rowIndex].filter((_, index) => index !== imageIndex)
            return updatedImages
        })
    }

    return (
        <div className='card'>
            <div className='flex flex-column gap-4'>
                <div className='flex flex-row gap-4'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='productName'>Product Name</label>
                        <InputText id='productName' placeholder='Enter product name' aria-describedby='productName-help' />
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='weight'>Weight</label>
                        <InputNumber inputId='minmax-buttons' placeholder='Enter weight' mode='decimal' defaultValue={0} showButtons min={0} suffix='g' />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='category'>Categories</label>
                        <Dropdown value={selectedCategory} onChange={(e) => setSelectedCategory(e.value)} options={categories} placeholder='Select a category' optionLabel='name' />
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='brand'>Manufactures</label>
                        <Dropdown value={selectedManufacture} onChange={(e) => setSelectedManufacture(e.value)} options={manufactures} placeholder='Select a manufacture' optionLabel='name' />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <Editor value={text} onTextChange={(e) => setText(e.htmlValue || '')} style={{ height: '100px', width: '100%' }} placeholder='Enter product description' />
                    </div>
                </div>
            </div>

            <Accordion className='mt-5'>
                <AccordionTab header='Attributes'>
                    {attributeRows.map((row, index) => (
                        <div key={index} className='mb-4 flex items-center'>
                            <Dropdown
                                value={row.selectedAttribute}
                                options={[...getAvailableAttributes(), ...attributes.filter((attr) => attr.code === row.selectedAttribute?.code)]} // Thêm thuộc tính đã chọn vào danh sách
                                onChange={(e) => {
                                    const updatedRows = [...attributeRows]
                                    updatedRows[index].selectedAttribute = e.value
                                    setAttributeRows(updatedRows)
                                    generateCombinations()
                                }}
                                optionLabel='name'
                                placeholder='Chọn thuộc tính'
                                className='w-[200px] mr-4'
                                style={{ minWidth: '200px', width: '200px', maxWidth: '200px' }}
                            />
                            <AutoComplete
                                value={row.selectedValues}
                                suggestions={row.selectedValues}
                                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeydown(event, index)}
                                placeholder='Nhập giá trị và enter'
                                multiple
                                onChange={(e) => handleChange(e.value, index)}
                                className='w-full'
                            />
                            <Button className='pi pi-trash bg-gray-500 text-xs' onClick={() => removeAttributeRow(index)} />
                        </div>
                    ))}
                    <Button onClick={addAttributeRow} className='flex items-center mb-5'>
                        <i className={PrimeIcons.PLUS}></i>
                        <span className='ml-2'>Thêm thuộc tính</span>
                    </Button>

                    {combinedRows.length > 0 && (
                        <DataTable value={combinedRows} editMode='cell' resizableColumns showGridlines tableStyle={{ minWidth: '50rem' }}>
                            {columns.map(({ field, header }) => {
                                if (field === 'name') {
                                    return <Column key={field} field={field} header={header} style={{ width: '25%' }} />
                                }
                                return (
                                    <Column
                                        key={field}
                                        field={field}
                                        header={header}
                                        editor={(options) => (
                                            <InputText
                                                type='text'
                                                style={{
                                                    width: '100%'
                                                }}
                                                value={options.value}
                                                onChange={(e) => options.editorCallback?.(e.target.value)}
                                            />
                                        )}
                                        onCellEditComplete={onCellEditComplete}
                                        style={{ width: '25%' }}
                                    />
                                )
                            })}
                            <Column
                                header='Image'
                                body={(rowData, column) => (
                                    <div style={{ width: '350px' }}>
                                        <label className='cursor-pointer rounded-lg justify-center items-center mb-4'>
                                            <input type='file' multiple onChange={(event) => onUpload(event, column.rowIndex)} className='absolute inset-0 opacity-0 cursor-pointer' />
                                            <span className='text-gray-600 '>
                                                <i className='pi pi-image text-2xl mb-2 '></i>
                                            </span>
                                        </label>

                                        <hr className='border-t-2 border-gray-300 mb-4' />
                                        <div className='grid grid-cols-2 gap-4 w-full'>
                                            {uploadedImages[column.rowIndex] &&
                                                uploadedImages[column.rowIndex].map((imageSrc, imageIndex) => (
                                                    <div key={imageIndex} className='relative'>
                                                        <img src={imageSrc} alt={`Uploaded image ${imageIndex}`} style={{ width: '100px', height: '100px' }} className='rounded-md object-cover shadow-md' />

                                                        <button
                                                            style={{ borderRadius: '5px' }}
                                                            className='absolute cursor-pointer border-none rounded-3xl top-0 right-0 bg-red-500 text-white p-1 transition-all duration-300 ease-in-out hover:bg-red-700 hover:scale-110'
                                                            onClick={() => onRemoveImage(column.rowIndex, imageIndex)}
                                                        >
                                                            <i className='pi pi-trash'></i>
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>

                                        <hr className='border-t-2 border-gray-300 mt-4' />
                                    </div>
                                )}
                                style={{ width: '350px', textAlign: 'center' }}
                            />

                            <Column header='Delete' body={(rowData, column) => <Button icon='pi pi-trash' className='p-button-danger' onClick={() => removeCombinationRow(column.rowIndex)} />} style={{ width: '100px', textAlign: 'center' }} />
                        </DataTable>
                    )}
                </AccordionTab>
            </Accordion>

            <Button onClick={handleAddProduct}>Add New</Button>
        </div>
    )
}

export default ProductPage
