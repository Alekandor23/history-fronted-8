import React, { useState, useEffect } from 'react';
import './Editar.css';
import { obtenerPerfilUsuario, editarPerfil, resetPasssword, nuevaContrasena} from '../service/api';
import { useUser } from '../contexts/userContext';
import Modal from './Modal';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const Editar = ({ onCancel }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('DatosPersonales');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showActualPassword, setShowActualPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActions, setModalActions] = useState([]);
  const [message, setMessage] = useState('');
  const [usuario, setUsuario] = useState(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nombreUsuario: '',
    fechaNacimiento: '',
    imagenPerfil: ''
  });
  const [formValues, setFormValues] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasena: ''
  });

  const [isEditable, setIsEditable] = useState({
    nombre: false,
    apellido: false, nombreUsuario: false,
    fechaNacimiento: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      setLoading(true);
      try {
        const response = await obtenerPerfilUsuario(user.id);
        console.log("AAAAAAA", response);
        setUsuario(response.data);
        const fechaSeparada = transformarFecha(new Date(response.data.fechaNacimiento));
        setFormData({
          nombre: response.data.nombre,
          apellido: response.data.apellido,
          nombreUsuario: response.data.nombreUsuario,
          fechaNacimiento: `${fechaSeparada.anio}-${fechaSeparada.mes}-${fechaSeparada.dia}`,
          imagenPerfil: response.data.imagenPerfil
        });
      } catch (error) {
        setError(error.message || error.data.message);
        console.error('Error al obtener el perfil del usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [user.id]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };


  // Manejar la selección de la imagen
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(file);
      setFormData({
        ...formData,
        imagenPerfil: imageUrl,
      });
    };
  };

  const togglePasswordVisibility = (type) => {
    if (type === 'password') {
      setShowPassword(!showPassword);
    } else if (type === 'confirmPassword') {
      setShowConfirmPassword(!showConfirmPassword);
    } else {
      setShowActualPassword(!showActualPassword);
    }
  };

  function transformarFecha(dateTime) {
    // Asegurarse de que dateTime es una instancia de Date
    if (!(dateTime instanceof Date)) {
      throw new Error('El argumento debe ser un objeto Date');
    }

    // Extraer año, mes (añadir 1 porque los meses son indexados desde 0) y día
    const anio = dateTime.getFullYear();
    const mes = (dateTime.getMonth() + 1).toString().padStart(2, '0'); // getMonth() devuelve el mes de 0 a 11
    const dia = dateTime.getDate().toString().padStart(2, '0');

    // Devolver un objeto con año, mes y día
    return {
      anio,
      mes,
      dia
    };
  };

  const saveChanges = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('apellido', formData.apellido);
    formDataToSend.append('nombreUsuario', formData.nombreUsuario);
    formDataToSend.append('fechaNacimiento', formData.fechaNacimiento);
    if (selectedImage) {
      formDataToSend.append('imagen', selectedImage);
    }

    try {
      await editarPerfil(usuario.id, formDataToSend);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };


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
  const handleContrasenia = async (e) => {
    e.preventDefault();
    const { contrasenaNueva, contrasenaActual, confirmarContrasena } = formValues;

    if (contrasenaNueva !== confirmarContrasena) {
      setMessage('Las contraseñas no coinciden');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpen(false) }]);
      setIsModalOpen(true);
      return;
    }

    if (!validatePassword(contrasenaNueva)) {
      setMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial');
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpen(false) }]);
      setIsModalOpen(true);
      return;
    }

    try {
      // Redefinir
      const newPassswordResponse = await nuevaContrasena(usuario.id, contrasenaActual, contrasenaNueva);
      console.log("newPasswordPresonse",newPassswordResponse);
      setMessage(newPassswordResponse.response.data.message);
      setModalActions([{ label: 'Ir al login', onClick: () => navigate('/login') }]);
      setIsModalOpen(true);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.message);
      } else {
        setMessage(error.message);
      }
      setModalActions([{ label: 'Cerrar', onClick: () => setIsModalOpen(false) }]);
      setIsModalOpen(true);
    }
  };

  const toggleEditable = (field) => {
    setIsEditable((prevEditable) =>
    ({
      ...prevEditable, [field]: !prevEditable[field],
    }));
  };
  return (
    <div className="edit-profile-container">
      <h2>Editar Perfil</h2>

      {/* Tabs */}
      <div className="tabs-edit">
        <button
          className={`tab-edit ${activeTab === 'DatosPersonales' ? 'active' : ''}`}
          onClick={() => handleTabClick('DatosPersonales')}
        >
          <p>Datos Personales</p>
        </button>
        <button
          className={`tab-edit ${activeTab === 'CambioContraseña' ? 'active' : ''}`}
          onClick={() => handleTabClick('CambioContraseña')}
        >
          <p>Cambio de Contraseña</p>
        </button>
      </div>

      {/* Contenido de la pestaña "Datos Personales" */}
      {activeTab === 'DatosPersonales' && (
        <div className="user-info-E">
          {/* Avatar */}
          <div className='container-foto'>
            <div className="user-avatar">
              {usuario && formData.imagenPerfil !== '' ? (
                <img src={formData.imagenPerfil} alt="Avatar" className="avatar-preview" />
              ) : (
                <span className="default-avatar">
                  <i className="bi bi-person-circle"></i>
                </span>
              )}
            </div>
            <div className="Foto-perfil">
              <label htmlFor="avatar-upload" className="upload-avatar-button">
                <i className="bi bi-card-image"></i>
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          {/* Campos de edición */}
          <form className='form-datos-personales'>

            <label>Nombre:</label>
            <input
              type="text-E"
              value={formData.nombre}
              placeholder="Nombre"
              name="nombre"
              onChange={handleInputChange}
              disabled={!isEditable.nombre}
            />
            <div className='modcampoP'>
              <a href="#" className="modify-link" onClick={() => toggleEditable('nombre')}>Editar nombre</a>
            </div>
            <label>Apellido:</label>
            <input type="text-E" value={formData.apellido} placeholder="Apellido" name="apellido"
              onChange={handleInputChange} disabled={!isEditable.apellido} />
            <div className='modcampoP'>
              <a href="#" className="modify-link" onClick={() => toggleEditable('apellido')}>Editar apellido</a>
            </div>
            <label>Nombre de usuario:</label>
            <input type="text-E" value={formData.nombreUsuario} placeholder="Nombre de usuario" name="nombreUsuario"
              onChange={handleInputChange} disabled={!isEditable.nombreUsuario} />
            <div className='modcampoP'>
              <a href="#" className="modify-link" onClick={() => toggleEditable('nombreUsuario')}>Editar nombre de usuario</a>
            </div>
            <label>Fecha de Nacimiento:</label>
            <input type="date" value={formData.fechaNacimiento} name="fechaNacimiento" onChange={handleInputChange} disabled={!isEditable.fechaNacimiento} />
            <div className='modcampoP'>
              <a href="#" className="modify-link" onClick={() => toggleEditable('fechaNacimiento')}>Editar fecha de nacimiento</a>
            </div>
          </form>
          {/* Botones */}
          <div className='btn-editar-perfil'>
            <button className="btn-guardarP" onClick={saveChanges}>Guardar cambios</button>
            <button className="btn-cancelarP" onClick={onCancel}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Contenido de la pestaña "Cambio de Contraseña" */}
      {activeTab === 'CambioContraseña' && (
        <div className="cambio-contraseña-tab">
          <h1>Cambio de Contraseña</h1>
          <p>
            Asegúrate de que tu nueva contraseña tenga 8 caracteres o más. Intenta que incluya
            números, letras mayúsculas y signos de puntuación para que sea una contraseña segura.
          </p>

          {/* Contraseña actual */}
          <form onSubmit={handleContrasenia}>
            <div className="input-container-camContra">
              <input
                type={showActualPassword ? 'text' : 'password'}
                value={formValues.contrasenaActual}
                placeholder="Contraseña Actual"
                onChange={handleChange}
                name="contrasenaActual"
                required
              />
              <i
                className={`bi ${showActualPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                id="ojitoActual"
                onClick={() => togglePasswordVisibility('ActualContrasena')}
              ></i>
            </div>

            {/* Nueva contraseña */}
            <div className="input-container-camContra">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nueva Contraseña"
                name="contrasenaNueva"
                value={formValues.contrasenaNueva}
                onChange={handleChange}
                required
              />
              <i
                className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                id="ojitoNuevaContraseña"
                onClick={() => togglePasswordVisibility('password')}
              ></i>
            </div>

            {/* Confirmar nueva contraseña */}
            <div className="input-container-camContra">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar Nueva Contraseña"
                value={formValues.confirmarContrasena}
                name="confirmarContrasena"
                onChange={handleChange}
                required
              />
              <i
                className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}
                onClick={() => togglePasswordVisibility('confirmPassword')}
              ></i>
            </div>

            {/* Botones */}
            <div className="con-btn-cambio">
              <button className="btn-cambiar-p" onClick={handleContrasenia}>Guardar Cambios</button>
              <button className="btn-cambiar-p" onClick={onCancel}>Cancelar</button>
            </div>
          </form>
        </div>
      )
      }
      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={message}
        actions={modalActions}
      />
    </div >

  );
};

export default Editar;

