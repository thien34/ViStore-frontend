'use client'
import { useEffect, useState } from 'react'
import ProductService from '@/service/ProducrService'
import ProductList from './details/_components/ProductList'
import { ProductResponse } from '@/interface/Product'
import Spinner from '@/components/spinner/Spinner'

export default function ProductPage() {
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true)
            try {
                const data = await ProductService.getAllProducts()
                setProducts(data)
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

    return (
        <>
            <Spinner isLoading={isLoading} />
            <ProductList products={products} />
        </>
    )
}
