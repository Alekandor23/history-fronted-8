import React from 'react';
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';

const Resultados = () => {
  const location = useLocation();
  const resultados = location.state?.results || []; // Accede a los resultados
  console.log("Resultados dado el componente resultados", resultados);
  return (
    <div>
      <h4 className='Titulo px-4'>Resultados de la Busqueda:</h4>

      <div className="contenedor-conciertos container">

        {resultados.length === 0 ? (

          <h2>Libro no encontrado</h2>

        ) : (
          resultados.map((resultado) => (
            <Link
              className="card menu-link"
              key={resultado.id}
              to={`/Libro/${resultado.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <img
                className="img"
                src={resultado.portada}
                alt={resultado.titulo}
              />
              <div className="textos">
                <h3>{resultado.titulo}</h3>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Resultados;