import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { getAutoresFavoritosByUserID, removeFavoritoAutor,addFavoritoAutor } from '../service/api';
import { useUser } from "../contexts/userContext";
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Detalles = ({ details }) => {
  const { id } = useParams(); // Obtén el ID del libro de la URL
  const { user } = useUser();
  const [isAutorFavorito, setIsAutorFavorito] = useState(false);
  
  const fecha_publicacion = new Date(`${details.fecha_publicacion}`);
  const anio = fecha_publicacion.getUTCFullYear();
  const mes = String(fecha_publicacion.getUTCMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  const dia = String(fecha_publicacion.getUTCDate()).padStart(2, '0');

 

  useEffect(() => {
    const verificarSiEsautorFavorito = async () => {
      try {
        const response = await getAutoresFavoritosByUserID(user.id);
        const favoritos = response.data;

        // Verificar si este libro ya está en la lista de favoritos
        const esFavorito = favoritos.some((favorito) => favorito.id === parseInt(details.autor.id));
        setIsAutorFavorito(esFavorito);
      } catch (error) {
        console.error('Error al verificar si es favorito:', error);
      }
    };

    verificarSiEsautorFavorito();
  }, [user.id, id]);
 


  const handleFavoriteAutorClick = async() => {
    try{
      console.log('Llamada a favoritos:', isAutorFavorito ? 'Eliminar' : 'Agregar');
      if(isAutorFavorito){
        await removeFavoritoAutor(user.id, details.autor.id);
      }else{  
        await addFavoritoAutor(user.id, details.autor.id);
      }

       setIsAutorFavorito(!isAutorFavorito);
    }catch(error){
      console.error('Error al agregar a favoritos:', error);
    } 
   
  };






  const fecha_publicacion_formateada = `${dia}/${mes}/${anio}`;

  console.log('Fecha formateada', fecha_publicacion_formateada)

  return (
    <div className="contenedor-detalle">
      
        <div className="contenedor-title-detalles">
        <h1 >Detalles del libro</h1>
        </div>

        <div className="contenedor-de-detalles" >


          <div className="detalles-box1">
            <h6>Autor:  {details.autor.nombre}</h6>

            <button className="btn-leer" type="button" onClick={handleFavoriteAutorClick}>
                <FontAwesomeIcon
                  icon={faHeart}
                  className="autor-favorito"
                  color={isAutorFavorito ? "red" : "darkgray"}
                  size="2x"
                />
              </button>
          </div>

          <div className="detalles-box">
            <h6>Editorial: {details.editorial.nombre}</h6>
          </div>

          <div className="detalles-box">
            <h6>Número de páginas: {details.numero_paginas}</h6>
          </div>

          <div className="detalles-box">
            <h6>Fecha de publicación: {fecha_publicacion_formateada}</h6>
          </div>

          <div className="detalles-box">
            <h6>Categoria: {details.categoria.nombre}</h6>
          </div>

        </div>
      </div>
    
  )
}

export default Detalles
