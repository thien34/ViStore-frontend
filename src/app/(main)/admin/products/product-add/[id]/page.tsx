import React from 'react'
import ProductDetailsFormParent from './_components/ProductDetailsFornParent'
import ProductService from '@/service/ProducrService'

export default async function ProductParentAdd(props: { params: { id: string } }) {
    const product = await ProductService.getProductById(+props.params.id)
    return (
        <>
            <ProductDetailsFormParent id={props.params.id} name={product?.name || ''} />
        </>
    )
}
