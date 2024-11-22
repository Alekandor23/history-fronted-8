import React from 'react';
import './ModalPerfil.css'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} aria-modal="true" role="dialog">
      <div className="modal-body modal-body-centered" >
        <button className="btn-close-perfil" onClick={onClose} >
          <i className="bi bi-x"></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
