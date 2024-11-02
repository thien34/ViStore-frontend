import discountService from '@/service/discount.service';
import ListView from './_components/ListView';

const DiscountPage = async () => {
    const { payload: data } = await discountService.getAll();

    return (
        <>
            <ListView initialData={data?.items} />
        </>
    );

};

export default DiscountPage;
