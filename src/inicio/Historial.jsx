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

import './Historial.css';


const Historial = () => {
    const navegacion = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    


    useEffect(() => {
        const obtenerLibros = async () => {
            try {
                const response = await getBooks();
                if (response.status !== 200) {
                    throw new Error('Error en la carga de datos');
                }
                console.log(response.data)
                setBooks(response.data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); // Finalizar carga
            }
        };
        obtenerLibros();
    }, []);
    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;
    return (

        <>

        <div className="contenedor-flecha" >
          <div className='row'>
            <i className="bi bi-arrow-left" id="otro" onClick={() => navegacion(-1)}></i>
          </div>
         
          </div>

        <div className='contenedor-historial'>
            <h4 className='heading'>CONTINUAR LEYENDO</h4>
            <div className='contenedor-carrusel'>
            <div className="swiper-button-prev slider-arrow">
                    <ion-icon name="arrow-back-outline"></ion-icon>
                </div>
                <>
                <Swiper
                    effect={'coverflow'}
                    grabCursor={true}
                    centeredSlides={true}
                    loop={true}
                    slidesPerView={'auto'}
                    coverflowEffect={{
                        rotate: 0,
                        stretch: 0,
                        depth: 100,
                        modifier: 2.5,
                    }}
                    pagination={{ el: '.swiper-pagination', clickable: true }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
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
                <div className="swiper-button-next slider-arrow" style={{ background: 'blue' }}>
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

export default Historial
