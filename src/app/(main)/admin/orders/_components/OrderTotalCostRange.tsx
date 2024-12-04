import { Button } from "primereact/button";
import { Slider } from "primereact/slider";
import { useState } from "react";

interface Props {
    totalCost: [number, number];
    setVisible: () => void;
    setTotalCostRange: (totalCost: [number, number]) => void;
}
const OrderTotalCostRange = ({ totalCost, setTotalCostRange, setVisible }: Props) => {
    const [value, setValue] = useState<[number, number]>(totalCost ?? [0, 20000]);
    const onChangeRange = (value: [number, number]) => {
        setTotalCostRange(value);
        setValue(value);
    }
    const handleFilter = () => {
        setTotalCostRange(value);
        setVisible();
    }
    return (
        <>
            <div className="p-d-flex p-flex-column p-align-center w-19rem mb-4 ">
                <div className="flex justify-between w-full mb-2">
                    <label htmlFor="left" className="text-left">${value[0]}</label>
                    <label htmlFor="right" className="text-right">${value[1]}</label>
                </div>
                <Slider
                    value={value}
                    max={5000}
                    onChange={(e) => onChangeRange(e.value as [number, number])}
                    className="w-full"
                    range
                />
                <div className="flex justify-between w-full mb-2 mt-4">
                    <Button label="Close" onClick={setVisible} />
                    <Button label="Apply" onClick={handleFilter} />
                </div>
            </div>
        </>

    )
}

export default OrderTotalCostRange;