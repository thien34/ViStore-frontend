import React, { use, useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
interface ModalInpuProps {
    totalCost: number;
    value: number;
    onChange: (value: number) => void;
}

const ModalInput = ({ totalCost, value, onChange }: ModalInpuProps) => {
    const [initialValue, setInitialValue] = useState<number>(value);
    const [totalCostValue, setTotalCost] = useState<number>(totalCost);
    const [modalVisible, setModalVisible] = useState(false);
    const [secondaryValue, setSecondaryValue] = useState<number>(0);
    const [unit, setUnit] = useState('%');

    useEffect(() => {
        setInitialValue(value);
        setTotalCost(totalCost);
        setSecondaryValue(Number(calculateFee()));
    }, [value, totalCost]);

    const calculateFee = () => {
        const multiplier = unit === '%' ? 0.01 : 1;
        const calculatedValue = unit === '%' ? secondaryValue * totalCostValue * multiplier : secondaryValue;
        const result = unit === '%' ? calculatedValue : secondaryValue;
        return result.toFixed(3);
    }


    const handleConfirm = () => {
        const result = Number(calculateFee());
        onChange(result);
        setInitialValue(result);
        setModalVisible(false);
    };

    return (
        <div>
            <div>
                <InputText
                    value={initialValue.toString()}
                    onClick={() => setModalVisible(true)}
                    placeholder="Click để nhập giá trị"
                    readOnly
                />
            </div>
            <Dialog
                visible={modalVisible}
                style={{ width: '400px' }}
                onHide={() => setModalVisible(false)}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label htmlFor="valueInput" style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                            Phí Trả Hàng
                        </label>
                        <InputText
                            id="valueInput"
                            type="number"
                            value={secondaryValue.toString()}
                            onChange={(e) => {
                                const inputValue = Number(e.target.value);
                                if (!isNaN(inputValue)) {
                                    setSecondaryValue(inputValue ?? 0);
                                }
                            }}
                            placeholder="Nhập giá trị"
                            style={{ padding: '10px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '5px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label htmlFor="unitSwitch" style={{ fontSize: '14px', color: '#555', margin: 0 }}>
                            Sử Dụng Phần Trăm
                        </label>
                        <InputSwitch
                            id="unitSwitch"
                            checked={unit === '%'}
                            onChange={(e) => setUnit(e.value ? '%' : '$')}
                        />
                    </div>
                </div>
                <div className="flex justify-content-end" style={{ marginTop: '20px' }}>
                    <Button label="Hủy" className="p-button-text" onClick={() => setModalVisible(false)} />
                    <Button label="Xác Nhận" onClick={handleConfirm} />
                </div>
            </Dialog>
        </div>
    );
};
export default ModalInput;
