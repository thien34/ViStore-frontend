import Layout from '@/components/layout/layout'
import { Metadata } from 'next'
import { ScrollTop } from 'primereact/scrolltop'
import { Suspense } from 'react'

interface AppLayoutProps {
    children: React.ReactNode
}

export const metadata: Metadata = {
    title: 'ViStore - Your Choice, Our Promise!',
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
    robots: { index: false, follow: false },
    openGraph: {
        type: 'website',
        title: 'ViStore',
        url: 'https://sakai.primereact.org/',
        description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
        images: ['https://www.primefaces.org/static/social/sakai-react.png'],
        ttl: 604800
    },
    icons: {
        icon: '/layout/images/ViStore.png',
        shortcut: '/layout/images/ViStore.png'
    }
}

export const viewport = {
    initialScale: 1,
    width: 'device-width'
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ScrollTop />
            <Layout>{children}</Layout>
        </Suspense>
    )
}
