'use client';
interface PropSpinner {
    isLoading: boolean;
}
const Spinner = ({ isLoading }: PropSpinner) =>
    isLoading ? (
        <div className="spinner-overlay">
            <div className="spinner-4"></div>
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
                    background-color: rgba(0, 0, 0, 0.4);
                    z-index: 9999;
                    animation: fadeIn 0.5s ease-out;
                }

                .spinner-4 {
                    width: 55px;
                    --b: 9px;
                    aspect-ratio: 1;
                    border-radius: 50%;
                    padding: 1px;
                    background: conic-gradient(#0000 10%, #00bfff) content-box;
                    -webkit-mask: repeating-conic-gradient(#0000 0deg, #000 1deg 20deg, #0000 21deg 36deg),
                        radial-gradient(farthest-side, #0000 calc(100% - var(--b) - 1px), #000 calc(100% - var(--b)));
                    -webkit-mask-composite: destination-in;
                    mask-composite: intersect;
                    animation:
                        s4 0.7s infinite steps(10),
                        glow 0.7s infinite alternate;
                }

                @keyframes s4 {
                    to {
                        transform: rotate(1turn);
                    }
                }

                @keyframes glow {
                    0% {
                        box-shadow:
                            0 0 10px #00bfff,
                            0 0 20px #00bfff,
                            0 0 30px #00bfff,
                            0 0 40px #00bfff,
                            0 0 50px #00bfff;
                    }
                    100% {
                        box-shadow:
                            0 0 15px #00bfff,
                            0 0 30px #00bfff,
                            0 0 40px #00bfff,
                            0 0 60px #00bfff,
                            0 0 80px #00bfff;
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
    ) : null;

export default Spinner;
