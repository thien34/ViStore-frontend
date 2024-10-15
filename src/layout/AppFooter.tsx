import { useContext } from 'react'
import { LayoutContext } from './context/layoutcontext'
import Image from 'next/image'

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext)

    return (
        <div className='layout-footer'>
            <Image src={`/layout/images/logo-${layoutConfig.colorScheme === 'light' ? 'dark' : 'white'}.svg`} className='mr-2' alt='Logo' width={20} height={20} />
            by
            <span className='font-medium ml-2'>PrimeReact</span>
        </div>
    )
}

export default AppFooter
