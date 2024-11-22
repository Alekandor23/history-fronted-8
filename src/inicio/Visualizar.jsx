import React, {useState, useEffect} from 'react';
import { obtenerPerfilUsuario } from '../service/api';
import './Visualizar.css';
import { useUser } from '../contexts/userContext';

const Visualizar = ({ onEdit }) => { 
  const [usuario, setUsuario] = useState(null);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUsuario = async () => {
      setLoading(true);
      try {
        const usuario = await obtenerPerfilUsuario(user.id);
        console.log("AAAAAAA", usuario);
        setUsuario(usuario.data);
      } catch (error) {
        setError(error.message || error.data.message);
        console.error('Error al obtener el perfil del usuario:', error);
      }finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [user.id]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

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

  const fechaSeparada = transformarFecha(new Date(usuario.fechaNacimiento));
  return (

  <div className='Visualizar'>
    <div className="contenido-centro">
      <h2>Perfil de usuario</h2>
      <div className="centro">
        <div className="user-avatar">
          {usuario && usuario.imagenPerfil ? (
              <img src={usuario.imagenPerfil} alt="Perfil" className='user-avatar-foto' />
            ) : (
              <span className="default-avatar">
                <i className="bi bi-person-circle"></i>
              </span>
            )}
        </div>
        <div disabled className="bloqueado">{usuario.nombreUsuario}</div>
      </div>
      <div className="user-info">
        <label>Nombre:</label>
        <input type="text-V" value={usuario.nombre} disabled className="bloqueado" />
        <label>Apellido:</label>
        <input type="text-V" value={usuario.apellido} disabled className="bloqueado" />
        <label>Fecha de Nacimiento:</label>
        <input type="text-V" value={`${fechaSeparada.dia}/${fechaSeparada.mes}/${fechaSeparada.anio}`} disabled className="bloqueado" />
        <button className="btn-editarP" onClick={onEdit}>Editar perfil</button>
      </div>
    </div>
  </div>

  );
};

export default Visualizar;
