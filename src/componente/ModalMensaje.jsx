import React from 'react';
import './Mensaje.css';
import { useNavigate } from 'react-router-dom'

const ModalMensaje = ({ isOpen, onClose, message, nomBtn }) => {
    if (!isOpen) return null;
    const navegacion = useNavigate();

    const handleButtonClick = () => {
        if (nomBtn === "Ir al Home") {
            navegacion('/');
        }
        else { onClose(); }
    };
    return (
        <div className="modal-overlay-mesaje" onClick={onClose}>
            <div className="modal-content-mensaje" onClick={(e) => e.stopPropagation()}>
                <h2>Informacion</h2>
                <div className="modal-message-mensaje">{message}</div>
                <button className="modal-button-mensaje" onClick={handleButtonClick}>{nomBtn}</button>
            </div>
        </div>
    );
};

export default ModalMensaje;
