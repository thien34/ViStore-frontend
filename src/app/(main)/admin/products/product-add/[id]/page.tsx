import React from 'react'
import ProductDetailsFormParent from './_components/ProductDetailsFornParent'
import productAttributeService from '@/service/productAttribute.service'
import ProductService from '@/service/ProducrService'

export default async function ProductParentAdd(props: { params: { id: string } }) {
    const { payload: productAttributesData } = await productAttributeService.getListName()
    const product = await ProductService.getProductById(+props.params.id)
    return (
        <>
            <ProductDetailsFormParent
                productAttributes={productAttributesData}
                id={props.params.id}
                name={product?.name || ''}
            />
        </>
    )
}
