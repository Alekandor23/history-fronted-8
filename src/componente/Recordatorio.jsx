import React, { useState, useEffect } from 'react';
import './Recordatorio.css';
import { obtenerRecordatorio, guardarRecordatorio, borrarRecordatorio, modificarRecordatorio } from '../service/api';
import { useUser } from '../contexts/userContext';
import ModalMs from './ModalMensaje'
import { Eliminar } from "./Redirigir";

function Recordatorio({ isOpen, onClose, bookID }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('00:00');
  const [message, setMessage] = useState('');
  const [messagel, setMessagel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recordatorio, setRecordatorio] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isModalE, setModalE] = useState(false);
  const [modalAbierto, setmodalAbierto] = useState(false);
  const [isAbiero, setAbierto] = useState(false);
  const [isCompleto, setCompleto] = useState(false);

  if (!isOpen) return null;

  const handleModify = () => {
    setIsEditing(true);
  };

  const openModal = () => { setModalE(true); };

  useEffect(() => {
    obtenerDatos();
  }, [user.id, bookID]);

  const obtenerDatos = async () => {
    setLoading(true);
    try {
      const recordatorioResponse = await obtenerRecordatorio(user.id, bookID);
      console.log('Recordatorio:', recordatorioResponse);
      if (recordatorioResponse.response.status !== 200) {
        throw new Error('Error al buscar recordatorio');
      };

      setRecordatorio(recordatorioResponse.response.data);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    };
  };

  const formatFecha = (fecha) => {
    const [day, month, year] = fecha.split('/');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !hora || !descripcion) {
      setMessage('Se requiere fecha, hora y descripción.');
      setmodalAbierto(true);
      return;
    }

    const formattedFecha = formatFecha(fecha);
    const formattedHora = `${hora}:00`;

    console.log('Fecha:', formattedFecha);
    console.log('Hora:', formattedHora);
    console.log('Descripción:', descripcion);

    try {
      const response = await guardarRecordatorio(user.id, bookID, descripcion, formattedFecha, formattedHora);
      console.log('Recordatorio guardado exitosamente:', response.response.data);
      if (response.response.status === 200) {
        setMessage(response.response.data.message);
        setAbierto(true);
      } else {
        setMessage(response.response.data.message);
        setmodalAbierto(true);
      }
    } catch (error) {
      console.error('Error al guardar el recordatorio:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.error : 'Error al guardar el recordatorio');
      setmodalAbierto(true);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await borrarRecordatorio(user.id, bookID);
      console.log('Recordatorio eliminado exitosamente:', response.response);
      setMessage(response.response.message);
      setAbierto(true);
    } catch (error) {
      console.error('Error al borrar el recordatorio:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.error : 'Error al borrar el recordatorio');
      setmodalAbierto(true);
    }
  };

  const handleModificar = async (e) => {
    e.preventDefault();
    if (!fecha || !hora || !descripcion) {
      setMessage('Se requiere fecha, hora y descripción.');
      setmodalAbierto(true);
      return;
    }

    const formattedFecha = formatFecha(fecha);
    const formattedHora = `${hora}:00`;

    console.log('Fecha:', formattedFecha);
    console.log('Hora:', formattedHora);
    console.log('Descripción:', descripcion);

    try {
      const response = await modificarRecordatorio(user.id, bookID, descripcion, formattedFecha, formattedHora);
      console.log('Recordatorio modificado exitosamente:', response.response.data);
      if (response.response.status === 200) {
        setMessage(response.response.data.message);
        setAbierto(true);
        setIsEditing(false);
      } else {
        setError(response.response.data.message);
        setmodalAbierto(true);
      }

    } catch (error) {
      console.error('Error al modificar el recordatorio:', error.response ? error.response.data : error.message);
      setError(error.response ? error.response.data.error : 'Error al modificar el recordatorio');
      setmodalAbierto(true);
    }
  };

  useEffect(() => {
    if (descripcion && fecha && hora) {
      setCompleto(true);
    } else {
      setCompleto(false);
    }
  }, [descripcion, fecha, hora]);

  return (
    <div className="modal-recordatorio">
      {recordatorio ? (
        isEditing ? (
          <div className="modal-modif-recordatorio">
            <h2>Modificar Recordatorio</h2>
            <span id="cerrar-recordatorio" onClick={() => setIsEditing(false)}>&times;</span>
            <form onSubmit={handleModificar}>
              <label>Descripción</label>
              <input
                type="text"
                value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                maxLength={80}
              />
              <label>Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <label>Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
              <button type="submit">Guardar cambios</button>
            </form>
          </div >
        ) : (
          <div className='modal-elim-recordatorio'>
            <div className='modal-eliminar-recodatorio'>
              <h3 className='nombre-elim'>Recordatorio</h3>
              <span id="cerrar-recordatorio" onClick={onClose}>&times;</span>
              <h2>Descripción</h2>
              <input
                type="text"
                value={recordatorio.descripcion}
                disabled className="bloqueado-elim"
              />
              <h2>FechaHora</h2>
              <input type="text"
                value={recordatorio.fechaHora}
                disabled className="bloqueado-elim" />
              <div className='btn-recordatorio-eliminar'>
                <button onClick={openModal}>Eliminar</button>
                <button onClick={handleModify}>Modificar</button>
              </div>
            </div>
          </div>
        )

      ) : (
        <div className="modal-agregar-recordatorio">
          <h2>Establecer recordatorios de lectura</h2>
          <span id="cerrar-recordatorio" onClick={onClose}>&times;</span>
          <label>Nombre del recordatorio</label>
          <form onSubmit={handleSubmit} className='form-agregar-recordatorio'>
            <input
              type="text"
              placeholder="Nombre del recordatorio"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={80}
            />
            <label>Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <label>Hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
            <button type="submit" disabled={!isCompleto} >Agregar recordatorio</button>
          </form>
        </div>
      )
      }
      {isModalE && (
        <Eliminar
          isOpen={isModalE}
          onClose={() => setModalE(false)}
          onDelete={handleDelete}
          mensaje="¿Está seguro de eliminar su recordatorio?"
        />
      )}
      <ModalMs
        isOpen={modalAbierto}
        onClose={() => setmodalAbierto(false)}
        message={error}
        nomBtn="Cerrar"
      />
      <ModalMs
        isOpen={isAbiero}
        onClose={() => setAbierto(false)}
        message={message}
        nomBtn="Ir al Home" />
    </div >
  );
}

export default Recordatorio;
