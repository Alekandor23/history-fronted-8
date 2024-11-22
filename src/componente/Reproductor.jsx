import { useEffect, useState, useRef } from 'react';
import { generateSpeech, calculateTimestamps } from "../service/api"; // Importa calculateTimestamps
import './Reproductor.css';

const Reproductor = ({ onClose, resumen, onTimeUpdate, updateAudioTimeRef }) => {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false); // Nuevo estado para el mute
  const [previousVolume, setPreviousVolume] = useState(1); // Estado para el volumen previo
  const [playbackRate, setPlaybackRate] = useState(1); // Estado para la velocidad de reproducción
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timestamps, setTimestamps] = useState([]);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const waitForAudioInitialization = (audio) => {
    return new Promise((resolve) => {
      if (audio.readyState >= 1) {
        resolve();
      } else {
        const onLoadedMetadata = () => {
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          resolve();
        };
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
      }
    });
  };

  useEffect(() => {
    if (audio) {
      waitForAudioInitialization(audio).then(() => {
        console.log("Audio inicializado.");
        setAudioInitialized(true);
        setTotalDuration(audio.duration);
        audio.playbackRate = playbackRate;
      });
    }
  }, [audio]);

  const generarAudio = async (texto) => {
    console.log("Generando audio desde el resumen:", texto);
    setLoading(true);
    try {
      const response = await generateSpeech(texto);
      console.log("Audio generado desde el front", response);

      if (response.data && response.data instanceof Blob) {
        const audioUrl = URL.createObjectURL(response.data);
        console.log('Audio URL:', audioUrl);
        const newAudio = new Audio(audioUrl);
        setAudio(newAudio);

        const timestampsResponse = await calculateTimestamps(texto);
        console.log("Timestamps generados:", timestampsResponse);
        setTimestamps(timestampsResponse.timestamps || []);
      } else {
        console.error('No se recibió un Blob válido:', response.data);
        throw new Error('La respuesta no es un Blob válido.');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('audio:', audio);
    console.log('array:', Array.isArray(timestamps));
    console.log('timestamps:', timestamps);

    if (audio && Array.isArray(timestamps) && timestamps.length > 0) {
      console.log('timestamps es un arreglo válido');
      const handleTimeUpdate = () => {
        const currentTime = audio.currentTime;
        console.log('currentTime:', currentTime);

        setElapsedTime(currentTime);

        const newProgress = (currentTime / totalDuration) * 100;
        setProgress(newProgress);

        const currentTimestamp = timestamps.find((timestamp) => {
          const isWithinTime = currentTime >= timestamp.start && currentTime < timestamp.end;
          console.log(`Comprobando timestamp:`, timestamp);
          console.log(`¿Es el currentTime dentro del rango?`, isWithinTime);
          return isWithinTime;
        });

        if (currentTimestamp) {
          console.log('Párrafo actual:', currentTimestamp.paragraph);
          onTimeUpdate(currentTimestamp.paragraph - 1);
        } else {
          console.log('No se encontró timestamp para el currentTime');
        }
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    } else {
      console.log('timestamps no está definido o no es un arreglo');
    }
  }, [audio, timestamps, onTimeUpdate]);

  useEffect(() => {
    generarAudio(resumen);
  }, [resumen]);

  const updateAudioTime = (newTime) => {
    if (audioInitialized && audio) {
      audio.currentTime = newTime;
      console.log(`Tiempo actualizado: ${newTime}`);
    } else {
      console.log("El audio aún no está inicializado.");
    }
  };

  useEffect(() => {
    if (updateAudioTimeRef) {
      updateAudioTimeRef.current = { updateAudioTime, audio };
      console.log("Referencia asignada correctamente:", updateAudioTimeRef.current);
    }
    return () => {
      if (updateAudioTimeRef) {
        updateAudioTimeRef.current = null;
      }
    };
  }, [updateAudioTimeRef, audioInitialized, audio]);

  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (audio) {
      audio.volume = value;
      if (value === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (audio) {
      if (audio.muted) {
        audio.muted = false;
        setIsMuted(false);
        setVolume(previousVolume);
        audio.volume = previousVolume;
      } else {
        setPreviousVolume(volume);
        audio.muted = true;
        setIsMuted(true);
        setVolume(0);
      }
    }
  };



  const handleSeek = (event) => {
    const newProgress = event.target.value;
    setProgress(newProgress);
    if (audio) {
      audio.currentTime = (newProgress / 100) * audio.duration;
      updateAudioTime(audio.currentTime);
    }
  };

  const handleRewind = () => {
    if (audio) {
      audio.currentTime = Math.max(audio.currentTime - 10, 0);
    }
  };

  const handleFastForward = () => {
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
    }
  };

  const handleClose = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    onClose();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleRateChange = (rate) => { 
    if (audio) { 
      setPlaybackRate(rate); 
      audio.playbackRate = rate; 
    } 
  };

  if (loading) return <div className="loading-message">Generando audio...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  return (
    <div className="player-container">
      {/* Encabezado */}
      <div className="player-header">

        <i
          className="bi bi-x-square"
          onClick={handleClose}
          title="Cerrar"
          style={{ cursor: "pointer" }}

        ></i>
      </div>

      {/* Controles principales */}
      <div className="contenedor-de-controles">
        <select value = {playbackRate} onChange={(e) => handleRateChange(parseFloat(e.target.value))}>
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>

        {/* Controles de reproducción */}
        <div className="player-controls">
          <i
            className="bi bi-rewind"
            onClick={handleRewind}
            title="Retroceder 10 segundos"
            style={{ cursor: "pointer" }}
          ></i>
          {isPlaying ? (
            <i
              className="bi bi-pause"
              onClick={togglePlay}
              title="Pausar"
              style={{ cursor: "pointer" }}
            ></i>
          ) : (
            <i
              className="bi bi-play-circle"
              onClick={togglePlay}
              title="Reproducir"
              style={{ cursor: "pointer" }}
            ></i>
          )}
          <i
            className="bi bi-fast-forward"
            onClick={handleFastForward}
            title="Adelantar 10 segundos"
            style={{ cursor: "pointer" }}
          ></i>
        </div>

        {/* Control de volumen */}
        <div className="volume-control">
        <i
            className={`bi ${isMuted ? "bi-volume-mute-fill" : "bi-volume-up-fill"}`}
            onClick={toggleMute}
            title={isMuted ? "Desmuteado" : "Muteado"}
            style={{ cursor: "pointer" }}
          ></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            title="Ajustar volumen"
          />
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="progress-container">
        <div className="time" style={{ color: 'white' }}>
          {formatTime(elapsedTime)}
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          title="Progreso del audio"
        />
        <div className="time" style={{ color: 'white' }}>
          {formatTime(totalDuration - elapsedTime)}
        </div>
      </div>
    </div>
  );
};

export default Reproductor;

