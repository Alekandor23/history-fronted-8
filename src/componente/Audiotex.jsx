import { useNavigate, useParams } from "react-router-dom";
import { getSummaryByID, getBookByID, calculateTimestamps } from "../service/api";
import { useEffect, useState, useRef } from "react";
import Reproductor from "./Reproductor";

const Audiotex = () => {
  const navegacion = useNavigate();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paragraphs, setParagraphs] = useState([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [timestamps, setTimestamps] = useState([]); // Para almacenar los timestamps

  const updateAudioTimeRef = useRef(null); // Referencia para almacenar la función

  const handleUpdateAudioTime = (newTime) => {
    console.log("Referencia actual:", updateAudioTimeRef.current);
    if (updateAudioTimeRef.current && updateAudioTimeRef.current.updateAudioTime) {
      waitForAudioInitialization().then(() => {
        updateAudioTimeRef.current.updateAudioTime(newTime); // Llamar a la función del Reproductor
        console.log('Actualizando tiempo ... :', newTime);
      }).catch((error) => {
        console.log("Error esperando la inicialización del audio:", error);
      });
    }
  };

  const waitForAudioInitialization = () => {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(() => {
        if (updateAudioTimeRef.current && updateAudioTimeRef.current.audio) {
          const audioElement = updateAudioTimeRef.current.audio;
          if (audioElement.readyState >= 1) { // Si el audio está listo (metadata cargada)
            clearInterval(intervalId);
            resolve();
          } else {
            console.log("El audio aún no está inicializado, reintentando...");
          }
        } else {
          clearInterval(intervalId);
          reject("La referencia del audio no está disponible");
        }
      }, 100); // Verificamos cada 100 ms
    });
  };

  // Obtener los datos del resumen y del libro
  useEffect(() => {
    const obtenerDatos = async () => {
      setLoading(true);
      try {
        const [summaryResponse, bookResponse] = await Promise.all([
          getSummaryByID(id),
          getBookByID(id),
        ]);
        if (summaryResponse.status !== 200 || bookResponse.status !== 200) {
          throw new Error("Error al obtener los datos");
        }
        setSummary(summaryResponse.data);
        setBook(bookResponse.data);

        // Dividir el resumen en párrafos
        const parrafos = summaryResponse.data.resumen.split(/(?:\n| {2,})/).filter(parrafo => parrafo.trim() !== "");
        setParagraphs(parrafos);

        // Obtener los timestamps
        const timestampsResponse = await calculateTimestamps(summaryResponse.data.resumen);
        setTimestamps(timestampsResponse);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    obtenerDatos();
  }, [id]);

  // Si los datos están cargando o hay un error, se muestra un mensaje
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  // Función para renderizar los párrafos con el estilo de karaoke
const renderTextoKaraoke = () => {
  if (!paragraphs.length) return null;

  return paragraphs.map((parrafo, index) => (
    <div
      key={index}
      className={`parrafo ${index === currentParagraphIndex ? 'active' : ''}`}
      onClick={() => {
        setCurrentParagraphIndex(index);
        // Encuentra el timestamp asociado al párrafo y ajusta el tiempo del audio
        const timestampsResponse = timestamps.timestamps || [];
        const timestamp = timestampsResponse.find((timestamp) => timestamp.paragraph === index + 1);
        console.log('párrafo seleccionado:', timestamp);
        if (timestamp) {
          if (timestampsResponse.length && updateAudioTimeRef.current) {
            handleUpdateAudioTime(timestamp.start);
          } else {
            console.log("Referencia o timestamps no inicializados aún.");
          }
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {parrafo}
    </div>
  ));
};


  return (
    <div className="contenedor-audiotex">
      <div className="contenedor-flecha">
        <div className="row">
          <i className="bi bi-arrow-left" id="otro" onClick={() => navegacion(-1)}></i>
        </div>
      </div>
      <div className="contenedor-textoaudio">
        {book && (
          <div className='titulo-del-audiolibro'>
            <h1>{book.titulo}</h1>
          </div>
        )}
        <div
          data-bs-spy="scroll"
          data-bs-target="#navbar-example2"
          data-bs-root-margin="0px 0px -40%"
          data-bs-smooth-scroll="true"
          className="scrollspy-textoaudio bg-body-tertiary p-3 rounded-2 texto-bonito"
          tabIndex="0"
        >
          {renderTextoKaraoke()}
        </div>
      </div>

      <Reproductor
        updateAudioTimeRef={updateAudioTimeRef} // Prop para establecer la referencia
        onClose={() => {}}
        resumen={summary ? summary.resumen : ''}
        timestamps={timestamps} // Pasamos los timestamps al reproductor
        onTimeUpdate={(index) => setCurrentParagraphIndex(index)} // Actualiza el índice del párrafo
      />
      <style jsx>
  {`
    .parrafo {
      background-color: #add8e6; /* Color de fondo celeste para los párrafos no activos */
      color: white;              /* Color de texto blanco por defecto */
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 5px;
      transition: all 0.3s ease; /* Transición suave para todos los cambios de estilo */
      display: block;
      width: 100%; /* Asegurar que los párrafos ocupen todo el ancho disponible */
      box-sizing: border-box; /* Incluir padding y borde en el ancho total */
    }

    .active {
      background-color: #1e3d58; /* Azul marino o oscuro para el párrafo activo */
      color: black;               /* Color de texto negro en el párrafo activo */
      font-weight: bold;          /* Negrita para el párrafo activo */
      transform: scale(1.05);     /* Ligera escala para destacar el párrafo activo */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra suave alrededor */
      transition: all 0.3s ease;  /* Asegurar que la transición sea suave */
      width: 100%; /* Asegurar que el párrafo activo ocupe todo el ancho disponible */
      box-sizing: border-box; /* Incluir padding y borde en el ancho total */
    }
    
    /* Para mejorar la visibilidad del párrafo no activo */
    .parrafo:not(.active) {
      color: #bbbbbb; /* Gris claro para las líneas no activas */
    }
  `}
</style>


    </div>
  );
};

export default Audiotex;



