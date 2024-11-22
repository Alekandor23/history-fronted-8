import { useEffect, useState, useRef } from "react"
import Descripcion from "./Descripcion";
import Detalles from "./Detalles";
import Resumen from "./Resumen";
import Comentario from './Comentario';
import { useNavigate, useParams } from 'react-router-dom'
import './Libro.css'
import { getBookByID, getDetailsByID, getDescriptionsByID, getSummaryByID,addFavorito, removeFavorito,getFavoritosByUserID} from "../service/api";
import { useUser } from "../contexts/userContext";
import { Redirigir } from "./Redirigir";
import usePlayerStore from '../PlayerStore';
import Recordatorio from "./Recordatorio";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Libro = () => {

  const navegacion = useNavigate();

  const { id } = useParams(); // Obtén el ID del libro de la URL
  const [book, setBook] = useState(null);
  const [details, setDetails] = useState(null);
  const [descriptions, setDescriptions] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const { showPlayer } = usePlayerStore();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [books, setBooks] = useState([]);

  //aqui esta  el estado de  las  pantallas 


  const [cambio, setCambio] = useState('DETALLES');

  const [isModalOpen, setModalOpen] = useState(false);
  const [restriccionAbierta, setRestriccionAbierta] = useState(false);
  const [isRecordatorioOpen, setRecordatorioOpen] = useState(false);



  const detailsRef = useRef(null);
  const descriptionRef = useRef(null);
  const resumenRef = useRef(null);


  console.log('Usuario utilizado desde el libro.jsx', user);
  const toggleModal = () => {
    user ? setModalOpen(!isModalOpen) : setRestriccionAbierta(!restriccionAbierta);
  };

  const toggleRecordatorio = () => {
    user ? setRecordatorioOpen(!isRecordatorioOpen) : setRestriccionAbierta(!restriccionAbierta);
  };

  useEffect(() => {
    obtenerDatos();
  }, [id]);


  useEffect(() => {
    const verificarSiEsFavorito = async () => {
      try {
        const response = await getFavoritosByUserID(user.id);
        const favoritos = response.data;

        // Verificar si este libro ya está en la lista de favoritos
        const esFavorito = favoritos.some((favorito) => favorito.id === parseInt(id));
        setIsFavorite(esFavorito);
      } catch (error) {
        console.error('Error al verificar si es favorito:', error);
      }
    };

    verificarSiEsFavorito();
  }, [user.id, id]);



  const handleFavoriteClick = async() => {
    try{
      if(isFavorite){
        await removeFavorito(user.id, id);
      }else{  
        await addFavorito(user.id, id);
      }

       // Volver a cargar los favoritos actualizados
       const response = await getFavoritosByUserID(user.id);
       setBooks(response.data);

  


      setIsFavorite(!isFavorite);
    }catch(error){
      console.error('Error al agregar a favoritos:', error);
    }
   
  };

  const obtenerDatos = async () => {
    setLoading(true); // Iniciar carga
    try {
      const [bookResponse, detailsResponse, descriptionsResponse, summaryResponse] = await Promise.all([
        getBookByID(id),
        getDetailsByID(id),
        getDescriptionsByID(id),
        getSummaryByID(id),
      ]);

      // Imprimir las respuestas para depuración
      console.log('Book Response:', bookResponse);
      console.log('Details Response:', detailsResponse);
      console.log('Descriptions Response:', descriptionsResponse);
      console.log('Summary Response:', summaryResponse);

      // Comprobar que todas las respuestas son satisfactorias
      if (bookResponse.status !== 200 || detailsResponse.status !== 200 || descriptionsResponse.status !== 200 || summaryResponse.status !== 200) {
        throw new Error('Error en la carga de datos');
      }

      // Establecer los datos en el estado
      setBook(bookResponse.data);
      setDetails(detailsResponse.data);
      setDescriptions(descriptionsResponse.data);
      setSummary(summaryResponse.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Finalizar carga
    }
  };
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;



  const botones = () => {
    if (cambio === 'DETALLES') {
      return <Detalles details={details} />;
    } else if (cambio === 'DESCRIPCION') {
      return <Descripcion descriptions={descriptions} />;
    } else {
      return <Resumen summary={summary} />;
    }
  };



  const handleIconClick = () => {
    const paragraphs = summary.resumen.split(/(?:\n| {2,})/).filter(parrafo => parrafo.trim() !== "");
    navigate(`/Libro/${id}/Audiotex`); // Cambia '/ruta-deseada' a la ruta que desees
    //showPlayer(paragraphs);
  };

  const scrollToContent = (contentRef) => {
    contentRef.current.scrollIntoView({ behavior: 'smooth' });
  };



  return (

    <>
      <div className="contenedor-flecha-navbar2" >
        <div className="contenedor-flecha" >
          <div className='row'>
            <i className="bi bi-arrow-left" id="otro" onClick={() => navegacion(-1)}></i>
          </div>
          <div className='row-campana'>
            <i class="bi bi-bell" onClick={toggleRecordatorio}></i>
          </div>
        </div>

        <div className='container' id='navbar12'>
          <div className='contenedor-botones'>

            <button type="button"
              className={`boton-navbar ${cambio === 'DETALLES' ? 'active' : ''}`}
              onClick={() => { setCambio('DETALLES'); scrollToContent(detailsRef); }}>Detalles</button>

            <button
              type="button"
              className={`boton-navbar ${cambio === 'DESCRIPCION' ? 'active' : ''}`}
              onClick={() => { setCambio('DESCRIPCION'); scrollToContent(descriptionRef); }}>Descripción</button>
            <button
              type="button"
              className={`boton-navbar ${cambio === 'RESUMEN' ? 'active' : ''}`}
              onClick={() => { setCambio('RESUMEN'); scrollToContent(resumenRef); }}>Resumen</button>
          </div>
        </div>
      </div>





      <div className="contenedor-de-libros " >

        <div className="contenedor-completo">
          <div className="contenedor-portada">

            <img className="imagen-portada" src={book.portada} alt={book.titulo} />
          </div>
          <div className="contenetor-titulo">
            <h5 className="contedor-titulo-hoy">{book.titulo}</h5>
            <div className="libro-audio">

              <button className="btn-leer" type="button" onClick={handleIconClick}>
                <i className="bi bi-headphones" id="otro1"></i>
              </button>
              <button className="btn-leer" type="button" onClick={toggleModal}>
                <i className="bi bi-chat-square-text"></i>
              </button>

              <button className="btn-leer" type="button" onClick={handleFavoriteClick}>
                <FontAwesomeIcon
                  icon={faHeart}
                  className="heart"
                  color={isFavorite ? "red" : "darkgray"}
                  size="2x"
                />
              </button>


            </div>
          </div>
        </div>

        <div className="contenedor-DDR">

          <div ref={detailsRef}>
            {cambio === 'DETALLES'}
          </div>
          <div ref={descriptionRef}>
            {cambio === 'DESCRIPCION'}
          </div>
          <div ref={resumenRef}>
            {cambio === 'RESUMEN'}
          </div>



          {botones()}
          {isModalOpen && (
            <Comentario isOpen={isModalOpen} bookID={id} onClose={toggleModal} />
          )}
          {isRecordatorioOpen && (
            <Recordatorio isOpen={isRecordatorioOpen} bookID={id} onClose={toggleRecordatorio} />
          )}

          <Redirigir
            isOpen={restriccionAbierta}
            onClose={() => setRestriccionAbierta(false)}
          />
        </div>
      </div>

    </>
  )
}

export default Libro