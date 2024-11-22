import { useState, useEffect } from 'react'
import { getBooks } from "../service/api";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules'; // Importar el efecto de coverflow
import 'swiper/swiper-bundle.css'; // Estilos de Swiper
import {useNavigate} from 'react-router-dom';

// Importar los estilos de Swiper
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './Favoritos.css';
import { getFavoritosByUserID, getAutoresFavoritosByUserID} from "../service/api";
import { useUser } from "../contexts/userContext";

const Favoritos = () => {
    
    const navegacion = useNavigate();
    const [books, setBooks] = useState([]);
    const [autores, setAutores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAutores, setLoadingAutores] = useState(true);
    const [isInfinite, setIsInfinite] = useState(false);
    const [isInfiniteAutores, setIsInfiniteAutores] = useState(false);


    const [error, setError] = useState(null);
    const { user } = useUser();


    useEffect(() => {
        const obtenerLibrosFavoritos = async () => {
            try {
                const response = await getFavoritosByUserID(user.id);
                setBooks(response.data);
                

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); // Finalizar carga
            }
        };
        obtenerLibrosFavoritos();
    }, [user.id]);



    useEffect(() => {   
        if (!user?.id) return; // Evitar ejecutar si user.id no existe


        const obtenerAutoresFavoritos = async () => {
            try {
                const response = await getAutoresFavoritosByUserID(user.id);
                console.log('Datos de autores favoritos:', response.data);

                setAutores(response.data);
            } catch (err) {
                console.error('Error al obtener autores favoritos:', err.message);
                setError(err.message);
            } finally {
                setLoadingAutores(false);
            }
        };
        obtenerAutoresFavoritos();
    }, [user.id]);
    console.log(autores);


                





    if (loading || loadingAutores) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (

        <>

         <div className="contenedor-flecha" >
          <div className='row'>
            <i className="bi bi-arrow-left" id="otro" onClick={() => navegacion(-1)}></i>
          </div>
         
          </div>
            

            <div className='contenedor-favoritos'>
                <h4 className='heading'>MIS FAVORITOS</h4>

                <div className='contenedor-carrusel'>
                    <div id="swiper-button-prev-books" className="swiper-button-prev slider-arrow" style={{ background: 'blue' }} >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                    </div>

                    <>

                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            loop={isInfinite}
                            slidesPerView={3} // Mostrar tres elementos visibles
                            spaceBetween={25} // Espacio entre slides
                            coverflowEffect={{
                                rotate: 0,
                                stretch: 50,
                                depth: 200,
                                modifier: 1.5,
                            }}
                            pagination={{ el: '#swiper-pagination-books', clickable: true }}
                            navigation={{
                                nextEl: '#swiper-button-next-books',
                                prevEl: '#swiper-button-prev-books',
                                clickable: true,
                            }}
                            modules={[EffectCoverflow, Pagination, Navigation]}
                            className="swiper_container"
                        >
                            {books.map((book, index) => (
                                <SwiperSlide key={index}>
                                    <div className="carrusel-image">
                                        <img src={book.portada} alt={book.titulo} />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </>
                    <div  id="swiper-button-next-books" className="swiper-button-next slider-arrow" style={{ background: 'blue' }}  onClick={() => setIsInfinite(true)}>
                        <ion-icon name="arrow-forward-outline"></ion-icon>
                    </div>
                </div>
                <div className="slider-controler">
                    <div className="swiper-pagination"></div>
                </div>
            </div>

            <div className='contenedor-autores'>
                <h4 className='heading'>AUTOR FAVORITO</h4>

                <div className='contenedor-carrusel'>
                    <div  id="swiper-button-prev-autores" className="swiper-button-prev slider-arrow" style={{ background: 'blue' }} >
                        <ion-icon name="arrow-back-outline"></ion-icon>
                    </div>

                    <>

                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            loop={isInfiniteAutores}
                            slidesPerView={3} // Mostrar tres elementos visibles
                            spaceBetween={30} // Espacio entre slides
                            coverflowEffect={{
                                rotate: 0,
                                stretch: 50,
                                depth: 200,
                                modifier: 1.5,
                            }}
                            pagination={{ el: '#swiper-pagination-autores', clickable: true }}
                            navigation={{
                                nextEl: '#swiper-button-next-autores',
                                prevEl: '#swiper-button-prev-autores',
                                clickable: true,
                            }}
                            modules={[EffectCoverflow, Pagination, Navigation]}
                            className="swiper_container"
                        >
                            {autores.length === 0 ?(  
                                <p>No hay autores favoritos.</p>
                            ):(
                            autores.map((autor, index) => (
                                <SwiperSlide key={index}>
                                    <div className="carrusel-image">
                                        <img src={autor.fotoPerfil} alt={autor.nombre} />
                                        <p>{autor.nombre}</p>
                                    </div>
                                </SwiperSlide>
                            )))}
                        </Swiper>
                    </>
                    <div id="swiper-button-next-autores" className="swiper-button-next slider-arrow" style={{ background: 'blue' }} onClick={() => setIsInfiniteAutores(true)}>
                        <ion-icon name="arrow-forward-outline"></ion-icon>
                    </div>
                </div>
                <div className="slider-controler">
                    <div className="swiper-pagination"></div>
                </div>
            </div>


        </>



    )
}

export default Favoritos
