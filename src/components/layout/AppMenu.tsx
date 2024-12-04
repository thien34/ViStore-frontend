import { useContext } from 'react'
import { LayoutContext } from './context/layoutcontext'
import { MenuProvider } from './context/menucontext'
import Link from 'next/link'
import Image from 'next/image'
import { AppMenuItem } from '@/types'
import AppMenuitem from './AppMenuitem'

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext)

    const model: AppMenuItem[] = [
        {
            label: 'Trang Chủ',
            items: [{ label: 'Tổng Quan', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Bán Lẻ',
            items: [{ label: 'Bán Lẻ', icon: 'pi pi-fw pi-shop', to: '/admin/retail' }]
        },
        {
            label: 'Danh Mục',
            items: [
                { label: 'Sản Phẩm', icon: 'pi pi-fw pi-box', to: '/admin/products' },
                { label: 'Danh Mục', icon: 'pi pi-fw pi-objects-column', to: '/admin/categories' },
                { label: 'Nhà Sản Xuất', icon: 'pi pi-fw pi-sitemap', to: '/admin/manfacturers' },
                { label: 'Nhãn Sản Phẩm', icon: 'pi pi-fw pi-bookmark', to: '/admin/product-tags' },
                { label: 'Thuộc Tính Sản Phẩm', icon: 'pi pi-fw pi-th-large', to: '/admin/product-attributes' },
                {
                    label: 'Thuộc Tính Đặc Tả',
                    icon: 'pi pi-fw pi-mobile',
                    to: '/uikit/button'
                },
                {
                    label: 'Giảm Giá',
                    icon: 'pi pi-fw pi-dollar',
                    items: [
                        {
                            label: 'Bán Hàng',
                            icon: 'pi pi-fw pi-tags',
                            to: '/admin/discounts'
                        },
                        {
                            label: 'Phiếu Giảm Giá',
                            icon: 'pi pi-fw pi-receipt',
                            to: '/admin/vouchers'
                        }
                    ]
                },
                { label: 'Khách Hàng', icon: 'pi pi-fw pi-users', to: '/admin/customers' },
                { label: 'Vai trò', icon: 'pi pi-fw pi-key', to: '/admin/customer-roles' }
            ]
        },
        {
            label: 'Đặt Hàng',
            items: [
                { label: 'Đặt Hàng', icon: 'pi pi-fw pi-table', to: '/admin/orders' },
                { label: 'Trả hàng', icon: 'pi pi-fw pi-list', to: '/admin/return-product' },
                { label: 'Thanh Toán Định Kỳ', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree' },
                { label: 'Giỏ hàng & Danh sách yêu thích', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel' }
            ]
        },
        {
            label: 'Trang',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: '',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Đăng Nhập',
                            icon: 'pi pi-fw pi-sign-in',
                            to: '/auth/login'
                        },
                        {
                            label: 'Lỗi',
                            icon: 'pi pi-fw pi-times-circle',
                            to: '/auth/error'
                        },
                        {
                            label: 'Từ Chối',
                            icon: 'pi pi-fw pi-lock',
                            to: '/auth/access'
                        }
                    ]
                },
                {
                    label: 'Không Tìm Thấy',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    to: '/pages/notfound'
                }
            ]
        },
        {
            label: 'Bắt Đầu',
            items: [
                {
                    label: 'Tài Liệu',
                    icon: 'pi pi-fw pi-question',
                    to: '/documentation'
                },
                {
                    label: 'Xem Nguồn',
                    icon: 'pi pi-fw pi-search',
                    url: 'https://github.com/thien34',
                    target: '_blank'
                }
            ]
        }
    ]

    return (
        <MenuProvider>
            <ul className='layout-menu'>
                {model.map((item, i) => {
                    return !item?.seperator ? (
                        <AppMenuitem item={item} root={true} index={i} key={item.label} />
                    ) : (
                        <li className='menu-separator'></li>
                    )
                })}
                <Link href='https://blocks.primereact.org' target='_blank' style={{ cursor: 'pointer' }}>
                    <Image
                        alt='Prime Blocks'
                        className='w-full mt-3'
                        src={`/layout/images/banner-primeblocks${layoutConfig.colorScheme === 'light' ? '' : '-dark'}.png`}
                        width={500}
                        height={150}
                    />
                </Link>
            </ul>
        </MenuProvider>
    )
}

export default AppMenu
