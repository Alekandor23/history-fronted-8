import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../service/api';
import { useUser } from '../contexts/userContext';
import ModalLogin from './ModalLogin';
import Modal from './Modal';
import './Login.css';
import logo from '../assets/logo.jpeg'
import Mapa from '../assets/Mapa.jpg'
import Personas from '../assets/Personas.jpg'
import Recuperar from "./Recuperar";

const Login = () => {
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    nombreUsuario: '',
    contrasenia: ''
  });
  const [formValues, setFormValues] = useState({
    nombreRegistro: '',
    apellido: '',
    nombreUsuarioRegistro: '',
    correoElectronicoRegistro: '',
    contrasenaRegistro: '',
    confirmarContrasena: ''
  });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenR, setIsModalOpenR] = useState(false);
  const [modalActions, setModalActions] = useState([]);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [message, setMessage] = useState('');
  const [isRecuperarOpen, setRecuperarOpen] = useState(false);

  useEffect(() => {
    const allFieldsFilled = Object.values(formValues).every(value => value.trim() !== '');
    setIsFormValid(allFieldsFilled);
  }, [formValues]);

  useEffect(() => {
    const container = document.getElementById('contenedor-LG-R');
    const registerBtn = document.getElementById('registrarse');
    const loginBtn = document.getElementById('iniciar-sesion');
    if (registerBtn && loginBtn && container) {
      registerBtn.addEventListener('click', () => {
        container.classList.add("active");
      });
      loginBtn.addEventListener('click', () => {
        container.classList.remove("active");
      });
    }
  },
    []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => (
      { ...prevCredentials, [name]: value }
    ));
  };

  const handleChangeRegistro = (e) => {
    const { name, value } = e.target;
    setFormValues((prevFormValues) => (
      { ...prevFormValues, [name]: value }
    ));
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[A-Za-z0-9]+$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmitRegistro = async (e) => {
    e.preventDefault();

    const { nombreUsuarioRegistro, contrasenaRegistro, confirmarContrasena } = formValues;

    if (!validateUsername(nombreUsuarioRegistro)) {
      setMessage('El nombre de usuario solo debe contener letras y números, sin espacios');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpenR(false) }]);
      setIsModalOpenR(true);
      return;
    }

    if (contrasenaRegistro !== confirmarContrasena) {
      setMessage('Las contraseñas no coinciden');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpenR(false) }]);
      setIsModalOpenR(true);
      return;
    }

    if (!validatePassword(contrasenaRegistro)) {
      setMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpenR(false) }]);
      setIsModalOpenR(true);
      return;
    }

    try {
      const usuarioCreado = await registerUser(
        nombreUsuarioRegistro,
        formValues.nombreRegistro,
        formValues.apellido,
        formValues.correoElectronico,
        contrasenaRegistro
      );
      setMessage(usuarioCreado.response.data.message);
      setIsModalOpenR(true);
      if( usuarioCreado.response.data.message == 'Usuario creado exitosamente'){
        setModalActions([{ label: '¡Bienvenido!', onClick: () => setIsModalOpenR(false) }]);
        setFormValues({
          nombreUsuarioRegistro: '',
          nombreRegistro: '',
          apellido: '',
          correoElectronico: '',
          contrasenaRegistro: '',
          confirmarContrasena: ''
        });
      }else{
        setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpenR(false) }]);
      }
  
    } catch (error) {
      if (error.response) {
        if (error.response.data.message === 'usuario') {
          setMessage('El usuario ya existe con este nombre de usuario');
        } else if (error.response.data.message === 'correo') {
          setMessage('El correo electrónico ya está registrado');
        } else {
          setMessage('Error al crear la cuenta');
        }
      } else {
        setMessage('Error al crear la cuenta');
      }
    }
  };


  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const responseUsuario = await loginUser(credentials.nombreUsuario, credentials.contrasenia);
      const usuario = responseUsuario.response.data;

      console.log('Respuesta del login', responseUsuario);
      if (responseUsuario.response.status === 200) {
        setUser(usuario);
        alert('Usuario Logeado con exito');
        if (loading) return <div>Cargando...</div>;
        navigate('/');
      } else {
        setError(responseUsuario.response.data.message);
        setIsModalOpen(true);
        setAttempts(prevAttempts => {
          const newAttempts = prevAttempts + 1;
          if (newAttempts >= 4) {
            alert("Demasiados intentos fallidos.");
            navigate('/');
          }
          return newAttempts;
        });
      }

    } catch (error) {
      setError(error.response.data.message || 'Error en la conexión');
      setIsModalOpen(true);
      setAttempts(prevAttempts => {
        const newAttempts = prevAttempts + 1;
        if (newAttempts >= 4) {
          alert("Demasiados intentos fallidos.");
          navigate('/');
        }
        return newAttempts;
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRecuperar = () => {
    setRecuperarOpen(!isRecuperarOpen);
  };

  const closeModal = () => {setIsModalOpen(false); };
  const closeModalR = () => {setIsModalOpenR(false); };

  const togglePasswordVisibility = (type) => {
    if (type === 'password') {
      setShowPassword(!showPassword);
    } else if (type === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const togglePasswordVisualizar = () => {
    setShowPassword(!showPassword);
  };

  const handleCancelClick = () => {
    setMessage('¿Seguro que quiere cancelar?');
    setModalActions([
      {
        label: 'Sí',
        onClick: () => {
          setFormValues({
            nombreUsuario: '',
            nombre: '',
            apellido: '',
            correoElectronico: '',
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
      <div className="Navbar-login" style={{ backgroundColor: '#001745' }}>
        <div className="logo-nombre-login">
          <button className="logo-button-login" onClick={() => navigate('/')}>
            <div className="logo-login">
              <img src={logo} className="img-logo-login" alt="portada" />
            </div>
          </button>
          <div className="nombre-app-login">
            <h3>HistoryHouse</h3>
          </div>
        </div>
      </div>
      <div className="flecha-Login" >
        <div className='row'>
          <i className="bi bi-arrow-left" id="Login-flecha" onClick={() => navigate('/')}></i>
        </div>
      </div>
      <div className='cuerpo'>
        <div className='contenedor-LG-R' id="contenedor-LG-R">
          <div className='contenedor-formulario registro'>
            <form onSubmit={handleSubmitRegistro}>
              <h1>Registro</h1>
              <input
                type="text"
                placeholder='Nombre'
                name="nombreRegistro"
                maxLength="30"
                value={formValues.nombreRegistro}
                onChange={handleChangeRegistro}
                required
              />
              <input
                type="text"
                placeholder='Apellido'
                name="apellido"
                maxLength="30"
                value={formValues.apellido}
                onChange={handleChangeRegistro}
                required
              />
              <input
                type="text"
                placeholder='Nombre de Usuario'
                name="nombreUsuarioRegistro"
                maxLength="40"
                value={formValues.nombreUsuarioRegistro}
                onChange={handleChangeRegistro}
                required
              />
              <input
                type="email"
                placeholder='Correo Electronico'
                name="correoElectronico"
                maxLength="40"
                value={formValues.correoElectronico}
                onChange={handleChangeRegistro}
                required
              />
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Contraseña'
                  name="contrasenaRegistro"
                  maxLength="20"
                  value={formValues.contrasenaRegistro}
                  onChange={handleChangeRegistro}
                  required
                />
                <i
                  className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                  id="ojoRegistro"
                  onClick={() => togglePasswordVisibility('password')}
                  style={{ cursor: 'pointer' }}
                ></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Confirmar Contraseña'
                  name="confirmarContrasena"
                  maxLength="20"
                  value={formValues.confirmarContrasena}
                  onChange={handleChangeRegistro}
                  required
                />
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                  id="ojitoConfirm"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  style={{ cursor: 'pointer' }}
                ></i>
              </div>
              <button>Registrarse</button>
            </form>
          </div>

          <div className='contenedor-formulario inicio-sesion'>
            <form onSubmit={handleSubmit}>
              <h1>Iniciar sesión</h1>
              <input
                type="text"
                name="nombreUsuario"
                placeholder="Usuario"
                maxLength="30"
                value={credentials.nombreUsuario} onChange={handleChange}
                require />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña" name="contrasenia"
                maxLength="30"
                value={credentials.contrasenia} onChange={handleChange} required />
              <div>
                <i
                  className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                  id="ojo"
                  onClick={togglePasswordVisualizar}
                />
              </div>
              <a href="#" onClick={toggleRecuperar}>¿Olvidaste tu contraseña?</a>
              <button>Iniciar sesión</button>
            </form>
          </div>
          <div className="contenedor-toggle">
            <div className="toggle">
              <div className="panel-toggle panel-izquierda">
                <img src={Mapa} className="imagen-panel-inicio" alt="portada" />
                <h1>¿Eres nuev@?</h1>
                <button className="oculto" id="iniciar-sesion">Inicia sesión</button>
              </div>
              <div className="panel-toggle panel-derecha">
                <img src={Personas} className="imagen-panel-registro" alt="portada" />
                <h1>¡Bienvenid@ de vuelta!</h1>
                <button className="oculto" id="registrarse">Registrate</button>
              </div>
            </div>
          </div>
        </div >
      </div >
      {isRecuperarOpen && (
        <Recuperar isOpen={isRecuperarOpen} onClose={toggleRecuperar} />
      )}
      {isModalOpenR && (
        <Modal
          show={isModalOpenR}
          onClose={closeModalR}
          message={message}
          actions={modalActions}
        />
      )}
      {error && <ModalLogin isOpen={isModalOpen} onClose={closeModal} message={error} />}
    </>
  );
};
export default Login;