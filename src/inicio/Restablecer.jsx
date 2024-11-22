import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from './Modal';
import './restablecer.css';
import logo from '../assets/logo.jpeg'
import foto from '../assets/Jose Marti.jpg'
import { resetPasssword } from '../service/api';

const Restablecer = () => {
  const [searchParams] = useSearchParams(); // Para obtener los parámetros de la URL
  const [formValues, setFormValues] = useState({
    contrasena: '',
    confirmarContrasena: ''
  });
  const token = searchParams.get('token');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActions, setModalActions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const allFieldsFilled = Object.values(formValues).every(value => value.trim() !== '');
    setIsFormValid(allFieldsFilled);
  }, [formValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { contrasena, confirmarContrasena } = formValues;

    if (contrasena !== confirmarContrasena) {
      setMessage('Las contraseñas no coinciden');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpen(false) }]);
      setIsModalOpen(true);
      return;
    }

    if (!validatePassword(contrasena)) {
      setMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpen(false) }]);
      setIsModalOpen(true);
      return;
    }

    try {
      const resetPassswordResponse = await resetPasssword(token, contrasena);
      console.log(resetPassswordResponse);
      setMessage(resetPassswordResponse.response.data.message);
      setModalActions([{ label: 'Ir al login', onClick: () => navigate('/login') }]);
      setIsModalOpen(true);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.message);
      } else {
        setMessage('Error al restablecer contraseña');
      }
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpen(false) }]);
      setIsModalOpen(true);
    }
  };

  const togglePasswordVisibility = (type) => {
    if (type === 'password') {
      setShowPassword(!showPassword);
    } else if (type === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleCancelClick = () => {
    setMessage('¿Seguro que quiere cancelar?');
    setModalActions([
      {
        label: 'Sí',
        onClick: () => {
          setFormValues({
            contrasena: '',
            confirmarContrasena: ''
          });
          setIsModalOpen(false);
          navigate('/');
        }
      },
      { label: 'No', onClick: () => setIsModalOpen(false) }
    ]);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='todo-restablecer'>
        <div className="Navbar-restablecer" style={{ backgroundColor: '#001745' }}>
          <div className="logo-nombreR">
            <button className="logo-buttonR" onClick={() => navigate('/')}>
              <div className="logoR">
                <img src={logo} className="img-logo-Restablecer" alt="portada" />
              </div>
            </button>
            <div className="nombre-Restablecer">
              <h3>HistoryHouse</h3>
            </div>
          </div>
        </div>
        <div className="registro-container">
          <div className='restablecer-imagen'>
            <div className='foto'>
              <img src={foto} className= 'foto-restablecer' alt="foto" />
            </div>
            <p>"Los hombres no se miden por sus caídas, sino por la altura a que son capaces de rebotar después de caer."</p>
          </div>
          <div className="form-restablecer">
            <h3>Elige una nueva contraseña</h3>
            <p>Asegúrate de que tu nueva contraseña tenga 8 caracteres o más. Intenta que incluya números, letras mayúsculas y signos de puntuación para que sea una contraseña segura.</p>
            <form onSubmit={handleSubmit}>
              <div className="input_box">
                <h4> Nueva Contraseña</h4>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="Contraseña"
                  name="contrasena"
                  maxLength="20"
                  value={formValues.contrasena}
                  onChange={handleChange}
                  required
                />
                <i
                  className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                  id="ojitoR"
                  onClick={() => togglePasswordVisibility('password')}
                  style={{ cursor: 'pointer' }}
                ></i>
                <h4> Confirmar Contraseña</h4>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="Confirmar contraseña"
                  name="confirmarContrasena"
                  maxLength="20"
                  value={formValues.confirmarContrasena}
                  onChange={handleChange}
                  required
                />
                <i
                  className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                  id="ojitoRestablecer"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  style={{ cursor: 'pointer' }}
                ></i>
              </div>
            </form>
            <div className="button-restablecer">
              <button value="Restablecer Contraseña" onClick={handleSubmit }> Restrablecer contraseña</button>
              <button onClick={handleCancelClick}> Cancelar</button>
            </div>
          </div>
        </div>
        <Modal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          message={message}
          actions={modalActions}
        />
      </div>
    </>
  );
};

export default Restablecer;