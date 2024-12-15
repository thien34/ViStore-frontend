import React from 'react'
import { Card } from 'primereact/card'
import { Skeleton } from 'primereact/skeleton'

const LoadingState = () => {
    return (
        <div className='container mx-auto p-6'>
            <div className='grid md:grid-cols-2 gap-6'>
                {[1, 2, 3, 4].map((item) => (
                    <Card key={item} className='mb-4'>
                        <Skeleton height='200px' />
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default LoadingState
