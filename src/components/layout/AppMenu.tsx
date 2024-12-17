import { MenuProvider } from './context/menucontext'
import { AppMenuItem } from '@/types'
import AppMenuitem from './AppMenuitem'

const AppMenu = () => {
    const model: AppMenuItem[] = [
        {
            label: 'Trang Chủ',
            items: [{ label: 'Tổng Quan', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Bán Hàng',
            items: [{ label: 'Tại Quầy', icon: 'pi pi-fw pi-shop', to: '/admin/retail' }]
        },
        {
            label: 'Danh Mục',
            items: [
                { label: 'Sản Phẩm', icon: 'pi pi-fw pi-box', to: '/admin/products' },
                { label: 'Danh Mục', icon: 'pi pi-fw pi-objects-column', to: '/admin/categories' },
                { label: 'Nhà Sản Xuất', icon: 'pi pi-fw pi-sitemap', to: '/admin/manfacturers' },
                { label: 'Thuộc Tính Sản Phẩm', icon: 'pi pi-fw pi-th-large', to: '/admin/product-attributes' },
                {
                    label: 'Giảm Giá',
                    icon: 'pi pi-fw pi-dollar',
                    items: [
                        {
                            label: 'Đợt giảm giá',
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
                { label: 'Đơn hàng', icon: 'pi pi-fw pi-table', to: '/admin/orders' },
                // { label: 'Trả hàng', icon: 'pi pi-fw pi-list', to: '/admin/return-product' }
            ]
        },
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
            </ul>
        </MenuProvider>
    )
}

export default AppMenu
