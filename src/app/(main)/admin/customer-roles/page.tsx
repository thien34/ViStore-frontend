import ListView from './_components/ListView'
import roleService from '@/service/role.service'

const RolePage = async () => {
    const { payload: data } = await roleService.getAll()

    return (
        <>
            <ListView initialData={data.items} />
        </>
    )
}

export default RolePage
