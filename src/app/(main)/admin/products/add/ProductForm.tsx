'use client'
import { ManufacturerName } from '@/interface/manufacturer.interface'
import { ProductAttribute, ProductRequest } from '@/interface/Product'
import { ProductAttributeName } from '@/interface/productAttribute.interface'
import ProductService from '@/service/ProducrService'
import Image from 'next/image'
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
import { TreeNode } from 'primereact/treenode'
import { TreeSelect } from 'primereact/treeselect'
import { useState } from 'react'

export interface AttributeRow {
    selectedAttribute: ProductAttributeName | null
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
interface ProductAddFormProps {
    categories: TreeNode[]
    manufacturers: ManufacturerName[]
    productAttributes: ProductAttributeName[]
}

const ProductAddForm: React.FC<ProductAddFormProps> = ({ categories, manufacturers, productAttributes }) => {
    const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([])
    const [combinedRows, setCombinedRows] = useState<CombinedRow[]>([])
    const [name, setName] = useState<string>('')
    const [weight, setWeight] = useState<number>(0)
    const [selectedCategory, setSelectedCategory] = useState<{ id: number } | null>(null)
    const [selectedManufacture, setSelectedManufacture] = useState<{ id: number } | null>(null)
    const [text, setText] = useState<string>('')
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File[] }>({})
    const [uploadedImages, setUploadedImages] = useState<{ [key: number]: string[] }>({})
    const [nameError, setNameError] = useState<string>('')
    const [categoryError, setCategoryError] = useState<string>('')
    const [manufactureError, setManufactureError] = useState<string>('')

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
            const newCombinations: CombinedRow[] = []

            const generateCombos = (current: string[], depth: number) => {
                if (depth === values.length) {
                    const name = current.join(' - ')
                    const existingRowIndex = combinedRows.findIndex((row) => row.name === name)

                    if (existingRowIndex === -1) {
                        newCombinations.push({
                            name: name,
                            sku: '',
                            productCost: 0,
                            unitPrice: 0,
                            quantity: 0,
                            gtin: '',
                            images: []
                        })
                    } else {
                        const existingRow = combinedRows[existingRowIndex]
                        newCombinations.push({
                            name: name,
                            sku: existingRow.sku || '',
                            productCost: existingRow.productCost || 0,
                            unitPrice: existingRow.unitPrice || 0,
                            quantity: existingRow.quantity || 0,
                            gtin: existingRow.gtin || '',
                            images: []
                        })
                    }
                    return
                }

                for (const value of values[depth]) {
                    generateCombos([...current, value], depth + 1)
                }
            }

            generateCombos([], 0)

            setCombinedRows(newCombinations)
        } else {
            setCombinedRows([])
        }
    }

    const removeCombinationRow = (index: number) => {
        const newCombinedRows = combinedRows.filter((_, i) => i !== index)

        const updatedAttributeRows = attributeRows.map((row) => {
            const updatedSelectedValues = row.selectedValues.filter((value) =>
                newCombinedRows.some((combinedRow) => combinedRow.name.includes(value))
            )
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
    const validateFields = () => {
        const errors: { name?: string; category?: string; manufacture?: string } = {}

        if (!name) {
            errors.name = 'Product name is required'
        }

        if (!selectedCategory) {
            errors.category = 'Category is required'
        }

        if (!selectedManufacture) {
            errors.manufacture = 'Manufacturer is required'
        }

        return errors
    }
    const isSkuUnique = (sku: string) => {
        return !combinedRows.some((row) => row.sku === sku)
    }
    const getAvailableAttributes = () => {
        const selectedAttributeCodes = new Set(attributeRows.map((row) => row.selectedAttribute?.id).filter(Boolean))
        return productAttributes.filter((attr) => !selectedAttributeCodes.has(attr.id))
    }
    const handleAddProduct = async () => {
        const errors = validateFields()
        setNameError(errors.name || '')
        setCategoryError(errors.category || '')
        setManufactureError(errors.manufacture || '')
        if (Object.keys(errors).length > 0) {
            return
        }

        const commonProductInfo: Omit<
            ProductRequest,
            'id' | 'name' | 'sku' | 'gtin' | 'quantity' | 'unitPrice' | 'productCost' | 'attributes'
        > = {
            fullDescription: text,
            weight: 12,
            published: true,
            deleted: false,
            categoryId: selectedCategory?.id !== undefined ? selectedCategory.id : undefined,
            manufacturerId: selectedManufacture?.id !== undefined ? selectedManufacture.id : undefined
        }

        const productsData: ProductRequest[] = combinedRows.map((combinedRow) => {
            const attributes: ProductAttribute[] = attributeRows
                .map((row) => {
                    const [attributeValue] = combinedRow.name
                        .split(' - ')
                        .filter((value) => row.selectedValues.includes(value))
                    if (attributeValue) {
                        return {
                            id: row.selectedAttribute?.id || null,
                            productId: undefined,
                            value: attributeValue
                        } as ProductAttribute
                    }
                    return undefined
                })
                .filter(Boolean) as ProductAttribute[]

            return {
                ...commonProductInfo,
                id: undefined,
                name: name,
                sku: combinedRow.sku,
                gtin: combinedRow.gtin,
                quantity: combinedRow.quantity,
                unitPrice: combinedRow.unitPrice,
                productCost: combinedRow.productCost,
                attributes: attributes,
                weight: weight
            }
        })

        try {
            const uploadedFilesObj: { [key: number]: File[] } = uploadedFiles
            const uploadedFilesArray: File[][] = Object.values(uploadedFilesObj)

            const data = await ProductService.addProducts(productsData, uploadedFilesArray)
            console.log('Products added successfully:', data)
        } catch (error) {
            console.error('Error:', error)
        }
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
            [rowIndex]: prev[rowIndex] ? [...prev[rowIndex], ...newImages] : newImages
        }))

        setUploadedFiles((prev) => ({
            ...prev,
            [rowIndex]: prev[rowIndex] ? [...prev[rowIndex], ...newFiles] : newFiles
        }))
    }

    const onRemoveImage = (rowIndex: number, imageIndex: number) => {
        setUploadedImages((prevImages) => {
            const updatedImages = { ...prevImages }
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
                        <InputText
                            id='productName'
                            onChange={(e) => {
                                setName(e.target.value)
                                setNameError('')
                            }}
                            placeholder='Enter product name'
                        />
                        {nameError && <small className='p-error'>{nameError}</small>}
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='weight'>Weight</label>
                        <InputNumber
                            inputId='minmax-buttons'
                            onChange={(e) => {
                                setWeight(e.value || 0)
                            }}
                            placeholder='Enter weight'
                            mode='decimal'
                            defaultValue={0}
                            showButtons
                            min={0}
                            suffix='g'
                        />
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='category'>Categories</label>
                        <TreeSelect
                            id='category'
                            value={selectedCategory ? String(selectedCategory.id) : null}
                            onChange={(e) => {
                                setSelectedCategory({ id: Number(e.value) })
                                setCategoryError('')
                            }}
                            options={categories}
                            filter
                            placeholder='Select a category'
                            showClear
                        />
                        {categoryError && <small className='p-error'>{categoryError}</small>}
                    </div>
                    <div className='flex flex-column gap-2 w-full'>
                        <label htmlFor='brand'>Manufactures</label>
                        <Dropdown
                            value={selectedManufacture}
                            onChange={(e) => {
                                setSelectedManufacture(e.value)
                                setManufactureError('')
                            }}
                            options={manufacturers}
                            placeholder='Select a manufacture'
                            optionLabel='manufacturerName'
                        />
                        {manufactureError && <small className='p-error'>{manufactureError}</small>}
                    </div>
                </div>

                <div className='flex flex-row gap-4 align-items-center'>
                    <div className='flex flex-column gap-2 w-full'>
                        {
                            <Editor
                                value={text}
                                onTextChange={(e) => setText(e.htmlValue || '')}
                                style={{ height: '100px', width: '100%' }}
                                placeholder='Enter product description'
                            />
                        }
                    </div>
                </div>
            </div>

            <Accordion className='mt-5'>
                <AccordionTab header='Attributes'>
                    {attributeRows.map((row, index) => (
                        <div key={index} className='mb-4 flex items-center'>
                            <Dropdown
                                value={row.selectedAttribute}
                                options={[
                                    ...getAvailableAttributes(),
                                    ...productAttributes.filter((attr) => attr.id === row.selectedAttribute?.id)
                                ]}
                                onChange={(e) => {
                                    const updatedRows = [...attributeRows]
                                    updatedRows[index].selectedAttribute = e.value
                                    setAttributeRows(updatedRows)
                                    generateCombinations()
                                }}
                                optionLabel='name'
                                placeholder='Select an attribute'
                                className='w-[200px] mr-4'
                                style={{ minWidth: '200px', width: '200px', maxWidth: '200px' }}
                            />
                            <AutoComplete
                                value={row.selectedValues}
                                suggestions={row.selectedValues}
                                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) =>
                                    handleKeydown(event, index)
                                }
                                placeholder='Enter values'
                                multiple
                                onChange={(e) => handleChange(e.value, index)}
                                className='w-full'
                            />
                            <Button
                                className='pi pi-trash bg-gray-500 text-xs'
                                onClick={() => removeAttributeRow(index)}
                            />
                        </div>
                    ))}
                    <Button onClick={addAttributeRow} className='flex items-center mb-5'>
                        <i className={PrimeIcons.PLUS}></i>
                        <span className='ml-2'>Add attribute</span>
                    </Button>

                    {combinedRows.length > 0 && (
                        <DataTable
                            value={combinedRows}
                            editMode='cell'
                            resizableColumns
                            showGridlines
                            tableStyle={{ minWidth: '50rem' }}
                        >
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
                                    <div style={{ width: '100px' }}>
                                        <label className='cursor-pointer rounded-lg justify-center items-center mb-4'>
                                            <input
                                                type='file'
                                                onChange={(event) => onUpload(event, column.rowIndex)}
                                                className='absolute inset-0 opacity-0 cursor-pointer'
                                            />
                                            <span className='text-gray-600 '>
                                                <i className='pi pi-image text-2xl mb-2 '></i>
                                            </span>
                                        </label>

                                        <hr className='border-t-2 border-gray-300 mb-4' />

                                        <div className='flex justify-center items-center'>
                                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
                                                {uploadedImages[column.rowIndex] &&
                                                    uploadedImages[column.rowIndex].map((imageSrc, imageIndex) => (
                                                        <div
                                                            key={imageIndex}
                                                            className='relative flex justify-center items-center'
                                                        >
                                                            <Image
                                                                src={imageSrc}
                                                                alt={`Uploaded image ${imageIndex}`}
                                                                width={100}
                                                                height={100}
                                                                className='rounded-md object-cover shadow-md'
                                                            />
                                                            <button
                                                                style={{ borderRadius: '5px' }}
                                                                className='absolute cursor-pointer border-none rounded-3xl top-0 right-0 bg-red-500 text-white p-1 transition-all duration-300 ease-in-out hover:bg-red-700 hover:scale-110'
                                                                onClick={() =>
                                                                    onRemoveImage(column.rowIndex, imageIndex)
                                                                }
                                                            >
                                                                <i className='pi pi-trash'></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                        <hr className='border-t-2 border-gray-300 mt-4' />
                                    </div>
                                )}
                                style={{ width: '350px', textAlign: 'center' }}
                            />

                            <Column
                                header='Delete'
                                body={(rowData, column) => (
                                    <Button
                                        icon='pi pi-trash'
                                        className='p-button-danger'
                                        onClick={() => removeCombinationRow(column.rowIndex)}
                                    />
                                )}
                                style={{ width: '100px', textAlign: 'center' }}
                            />
                        </DataTable>
                    )}
                </AccordionTab>
            </Accordion>

            <Button onClick={handleAddProduct}>Add New</Button>
        </div>
    )
}

export default ProductAddForm
