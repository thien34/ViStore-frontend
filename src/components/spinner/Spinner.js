import React, { useState } from 'react'

export default function Spinner() {
    const [isSpinning, setIsSpinning] = useState(false)

    const handleClick = () => {
        setIsSpinning(true)
    }

    return (
        <div className='spinner-overlay'>
            <div className='nyan-cat' onClick={handleClick}>
                <img
                    id='nyan-cat-img'
                    src='http://www.nyan.cat/cats/original.gif'
                    alt='Nyan Cat'
                    className={isSpinning ? 'spinning' : ''}
                />
            </div>

            <style>{`
                .spinner-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(0, 0, 0, 0.6);
                    z-index: 9999;
                    animation: fadeIn 0.5s ease-out;
                    opacity: 1;
                }

                .nyan-cat {
                    width: 90px;
                    height: 60px;
                    position: relative;
                    cursor: pointer;
                    margin: 0;
                }

                .spinning {
                    animation: spin 2s infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
}
