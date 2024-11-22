import { FaStar } from 'react-icons/fa';
import { postUserReview, getUserReview, getReviews, deleteUserReview } from '../service/api';
import { useState, useEffect } from 'react';
import React from 'react';
import './Comentario.css';
import { useUser } from '../contexts/userContext';
import { Eliminar } from "./Redirigir";

const Comentario = ({ isOpen, onClose, bookID }) => {
    if (!isOpen) return null;
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState('');
    const [reviewText, setReviewText] = useState(''); // Estado para el contenido de la reseña
    const { user } = useUser();
    const [userReview, setReview] = useState(null);
    const [userReviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [restriccionAbierta, setRestriccionAbierta] = useState(false);
    const [showMore, setShowMore] = useState(false); // Estado para "Ver más/Ver menos"
    const [visible, setVisible] = useState(true);
    const [showMoreMap, setShowMoreMap] = useState({});
    const [isPublished, setIsPublished] = useState(false);

    console.log('Usuario utilizado desde el modal de resenias', user);

    // Función para manejar la cancelación
    const Cancelar = () => {
        setRating(0);
        setReviewText('');
        setMessage('');
    };

    const obtenerDatos = async () => {
        setLoading(true); //Cargamos las resenias 
        try {
            const [userReviewResponse, reviewsResponse] = await Promise.all([
                getUserReview(user.id, bookID),
                getReviews(bookID)
            ]);

            //Respuestas de las solicitudes a los APIs
            console.log('User Review Response: ', userReviewResponse);
            console.log('Reviews Response: ', reviewsResponse);

            // Comprobar que todas las respuestas son satisfactorias
            if (userReviewResponse.status !== 200 || reviewsResponse.status !== 200) {
                throw new Error('Error en la carga de datos');
            }
            // Establecer los datos en el estado
            setReview(userReviewResponse.data);
            setReviews(reviewsResponse.data || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        };
    };

    console.log('User Reviews', userReviews);
    useEffect(() => {
        obtenerDatos();
    }, [user.id, bookID]);

    useEffect(() => {
        if (isPublished && visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isPublished, visible]);
    const handleRatingClick = (index) => {
        setRating(index); setIsPublished(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setMessage('Por favor, selecciona una calificación de estrellas.');
            setVisible(true);
            return;
        }
        try {
            const respuesta = await postUserReview(user.id, bookID, reviewText, rating);
            setMessage(respuesta.response.data.message || 'Reseña creada exitosamente');
            console.log('Reseña Creada:', respuesta);
            obtenerDatos();
            setIsPublished(true);
        } catch (error) {
            setMessage('Error al crear reseña');
            console.error('Error al escribir reseña:', error.response ? error.response.data : error.message);
        }
    };

    const formatearFecha = (fecha) => {
        const fecha_publicacion = new Date(fecha);
        const anio = fecha_publicacion.getUTCFullYear();
        const mes = String(fecha_publicacion.getUTCMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const dia = String(fecha_publicacion.getUTCDate()).padStart(2, '0');
        return `${dia}/${mes}/${anio}`;
    }

    const EliminarReseña = async () => {
        try {
            const respuesta = await deleteUserReview(user.id, bookID);
            setMessage(respuesta.response.data.message || 'Reseña eliminada exitosamente');
            console.log('Reseña Eliminada:', respuesta);
            setReviewText('');
            setRating(0);
            obtenerDatos();
        } catch (error) {
            setMessage('Error al eliminar la reseña');
            console.error('Error al eliminar reseña:', error.response ? error.response.data : error.message);
        }
    };

    const toggleModal = () => {
        user ? setModalOpen(!isModalOpen) : setRestriccionAbierta(!restriccionAbierta);
    };

    const toggleMore = (reviewId) => {
        setShowMoreMap((prevState) => ({
            ...prevState,
            [reviewId]: !prevState[reviewId],
        }));
    };

    const toggleShowMore = (text) => {
        if (text.length > 150) {
            return showMore ? text : `${text.substring(0, 150)}...`;
        }
        return text;
    };

    useEffect(() => {
        const timer = setTimeout(() => { setVisible(false); }, 3000); return () => clearTimeout(timer);
    }, []);


    return (
        <div className="comentario-overlay" onClick={onClose}>

            <div className={`comentario-content ${userReviews.length > 2 ? 'scroll-activo' : ''}`} onClick={(e) => e.stopPropagation()}>

                <span id="cerrar-comentario" onClick={onClose}>&times;</span>
                {/* Reseña del Usuario */}
                <div className="comentario-principal">
                    <h1 className="titulo-reseña">Tu reseña</h1>
                    <div className="usuario-comentario">
                        <i className="bi bi-person-circle" id="circulo-user"></i>
                        <p>{user.nombreUsuario}</p>
                        <p>{userReview ? formatearFecha(userReview.fecha_publicacion) : "Fecha de hoy"}</p>
                        <div className="rating">
                            {[...Array(5)].map((_, index) => (
                                <label key={index}>
                                    <input
                                        type="radio"
                                        name="rating"
                                        value={index + 1}
                                        onClick={() => handleRatingClick(index + 1)}
                                        style={{ display: 'none' }} // Oculta el input radio
                                    />
                                    <FaStar
                                        className="star"
                                        color={(index + 1) <= (userReview ? userReview.calificacion : rating) ? "gold" : "darkgray"}
                                        size={24}
                                    />
                                </label>
                            ))}
                            {message && visible && (<p className={`message ${!visible ? 'ocultar' : ''}`}>{message}</p>)}
                        </div>
                    </div>

                    {/* Texto de la Reseña */}
                    <div className="escribir-contenedor px-3">
                        {userReview ? (
                            <p className="escribir-control" style={{ whiteSpace: "pre-wrap" }}>
                                {showMore ? userReview.descripcion : `${userReview.descripcion.slice(0, 150)}`}
                                {userReview.descripcion.length > 150 && (
                                    <span>
                                        {!showMore && "..."}
                                        <span onClick={toggleShowMore} className="ver-mas-link">
                                            {showMore ? " Ver menos" : " Ver más"}
                                        </span>
                                    </span>
                                )}
                            </p>
                        ) : (
                            <textarea
                                className="escribir-control"
                                placeholder="Escribir Reseña (Opcional)"
                                value={reviewText}
                                maxLength="500"
                                onChange={(e) => setReviewText(e.target.value)}
                            />
                        )}
                        <div className="botones-contenedor">
                            {userReview ? (
                                <button className="btn-eliminar-com" onClick={toggleModal}>Eliminar</button>
                            ) : (
                                <>
                                    <button className="btn-publicar" onClick={Cancelar}>Cancelar</button>
                                    <button className="btn-publicar" onClick={handleSubmit}>Publicar</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Otras Reseñas */}
                {userReviews
                    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)) // Ordenar por fecha de publicación más reciente
                    .map((review) => {
                        if (userReview && userReview.id === review.id) {
                            return null;
                        }
                        return (
                            <div className="comentario-contenedor" key={review.id}>
                                <div className="usuario-comentario">
                                    <i className="bi bi-person-circle" id="circulo-user"></i>
                                    <p>{review.usuario.nombreUsuario}</p>
                                    <p>{formatearFecha(review.fecha_publicacion)}</p>
                                    <div className="rating">
                                        {[...Array(5)].map((_, index) => (
                                            <FaStar
                                                key={index}
                                                className="star"
                                                color={(index + 1) <= review.calificacion ? "gold" : "darkgray"}
                                                size={24} />
                                        )
                                        )}
                                    </div>
                                </div>
                                <div className="escribir-contenedor px-3">
                                    <p className="escribir-control" style={{ whiteSpace: "pre-wrap" }}>
                                        {showMoreMap[review.id] ? review.descripcion : `${review.descripcion.slice(0, 150)}`}
                                        {review.descripcion.length > 150 && (
                                            <span>
                                                {!showMoreMap[review.id] && "..."}
                                                <span onClick={() => toggleMore(review.id)} className="ver-mas-link">
                                                    {showMoreMap[review.id] ? " Ver menos" : " Ver más"}
                                                </span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    }
                    )}
                {/* Modal de confirmación de eliminación */}
                {isModalOpen && (
                    <Eliminar
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                        onDelete={EliminarReseña}
                        mensaje="¿Está seguro de eliminar su comentario?"
                    />
                )}
            </div>


        </div>
    );
};

export default Comentario;