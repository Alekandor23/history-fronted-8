import { useState, useEffect } from 'react';
import React from 'react';
import './contraseña.css';
import { requestPasswordEmail } from '../service/api';

const Recuperar= ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Estado para almacenar el correo electrónico
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    // Función para manejar el cambio en el campo de entrada
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    // Función para manejar el envío del correo
    const handleEnviar = async () => {
        try {
            const responseRequestPassword = await requestPasswordEmail(email);
            console.log('Respuesta de solicitar contraseña', responseRequestPassword);

            if (responseRequestPassword.response.data.message === 'Correo de restablecimiento enviado') {
                setMessage('Se envió un correo para recuperar su contraseña.');
            } else {
                setMessage(responseRequestPassword.response.data.message);
            }
        } catch (error) {
            setMessage('Error al intentar enviar el correo.');
        }
    };
    
    useEffect(() => {
        if (message === 'Se envió un correo para recuperar su contraseña.') {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); 
            return () => clearTimeout(timer); 
        }
    }, [message, onClose]);

    return (
        <div className="modal-recuperado">
            <div className="content-recuperado">
                <h2> Encuentra tu cuenta de History House </h2>
                <span id="cerrar-recordatorio" onClick={onClose}>&times;</span>
                <h4>Introduzca su correo electrónico con el que se registro para que le enviemos las instrucciones necesarias para la recuperación de su contraseña.</h4>
                <p>Correo Electronico</p>
                <input
                    type="email"
                    value={email} // Asociamos el estado con el valor del input
                    onChange={handleEmailChange} // Actualizamos el estado cuando el usuario escriba
                    required
                />
                <h3>{message}</h3>
                <div className='botones-recuperado'>
                    <button onClick={handleEnviar}> Enviar </button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default Recuperar;