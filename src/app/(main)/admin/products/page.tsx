import ProductService from '@/service/ProducrService'
import React from 'react'
import ProductList from './ProductList'

export default async function ProductPage() {
    const products = await ProductService.getAllProducts()

    return (
        <>
            <ProductList products={products} />
        </>
    )
}
