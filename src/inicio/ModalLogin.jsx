import React from 'react';
import './ModalLoginS.css';

const ModalLogin = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay-login" onClick={onClose}>
            <div className="modal-content-login" onClick={(e) => e.stopPropagation()}>
                <h2>Informacion</h2>
                <div className="modal-message-login">{message}</div>
                <button className="modal-button-login" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default ModalLogin;
