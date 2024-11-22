import axios from 'axios'

const baseURL = 'http://localhost:3000'

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  responseType: 'json',
  withCredentials: true,
});


export const getBooks = () => api.get('/libros')
export const getBookByID = (id) => api.get(`/libros/titulo/${id}`)
export const getDetailsByID = (id) => api.get(`/libros/detalles/${id}`)
export const getDescriptionsByID = (id) => api.get(`/libros/descripcion/${id}`)
export const getSummaryByID = (id) => api.get(`/libros/resumen/${id}`)
export const getSearchByTittle = (titulo) => api.get(`/libros/busqueda?query=${titulo}`)

export const loginUser = async (nombreUsuario, contrasenia) => {
  try {
    const response = await api.post('/iniciarSesion', {
      nombreUsuarioI: nombreUsuario,
      contraseniaI: contrasenia
    });

    return {
      response: response
    };
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response.data);
    return {
      response: error.response
    };
  }
}

export const registerUser = async (nombreUsuario, nombre, apellido, correo, contrasenia) => {
  try {
    const response = await api.post('/registrar/usuario', {
      nombreUsuarioI: nombreUsuario,
      nombreI: nombre,
      apellidoI: apellido,
      correoI: correo,
      contraseniaI: contrasenia
    });
    console.log('Usuario:', response.data); // Asegúrate de acceder a response.data
    return {
      response: response
    };
  } catch (error) {
    console.error('Error al registrar usuario:', error.response ? error.response.data : error.message);
    return {
      response: error.response
    };
  };
};


export const getReviews = (bookID) => api.get(`/libros/${bookID}/resenias`)

export const getUserReview = (userID, bookID) => api.get(`/libros/${bookID}/resenias/${userID}`)

export const postUserReview = async (userID, bookID, descripcion, calificacion) => {
  try {
    const response = await api.post(`/libros/${bookID}/resenias/${userID}`, {
      descripcionI: descripcion,
      calificacionI: calificacion
    });
    console.log('Resenia Creada:', response.data);
    return {
      response: response
    };
  } catch (error) {
    console.error('Error al escribir resenia:', error.response.data);
    return {
      response: error.response
    };
  }
}

export const deleteUserReview = async (userID, bookID) => {
  try {
    const response = await api.delete(`/libros/${bookID}/resenias/${userID}`);
    console.log('Resenia ELiminada:', response.data);
    return {
      response: response
    };
  } catch (error) {
    console.error('Error al eliminar resenia:', error.response.data);
    return {
      response: error.response
    };
  }
}

export const getCategories = () => api.get(`/libros/categorias`)

export const getCountries = () => api.get(`/libros/paises`)

export const getBooksByCategory = (categoryID) => api.get(`/libros/categorias/${categoryID}`)

export const getBooksByCountry = (countryID) => api.get(`/libros/paises/${countryID}`)

export const generateSpeech = async(texto) => {
  try{
    const response = await api.post('generar/audio', 
      { textoI: texto },
      { responseType:'blob'}
    );

    return response; 
  }catch(error){
    console.error('Error al generar el audio', error);
  }
}

export const calculateTimestamps = async (texto) => {
  try {
    // Llamada al endpoint para calcular los timestamps
    const response = await api.post(
      'calcular/audio', // Ruta definida en el router
      { textoI: texto } // Enviar el texto como parte del cuerpo de la solicitud
    );

    // Retornar la respuesta del servidor
    return response.data; 
  } catch (error) {
    console.error('Error al calcular los timestamps:', error);
    throw error; // Propagar el error para manejo externo si es necesario
  }
};

export const requestPasswordEmail = async (correo) => {
  try {
    const response = await api.post('/recuperar/contrasenia', {
      correoI: correo,
    });
    console.log('Solicitamos contrasenia nueva:', response.data);
    return {
      response: response
    };
  } catch (error) {
    console.error('Error al solicitar contrsenia nueva:', error.response.data);
    return {
      response: error.response
    };
  }
}

export const resetPasssword = async (tokenI, contraseniaNuevaI) => {
  try {
    const response = await api.put('/restablecer/contrasenia', {
      token: tokenI,
      contraseniaNueva: contraseniaNuevaI
    });

    console.log('Restablecemos contrasenia:', response.data);
    return {
      response: response
    };
  } catch (error) {
    console.error('Error al restablecer cotrasenia:', error.response.data);
    return {
      response: error.response
    };
  }
}

export const obtenerRecordatorio = async (id_usuario, id_libro) => {
  try {
    const response = await api.get(`/usuarios/${id_usuario}/libros/${id_libro}/recordatorio`);
    console.log('Recordatorio:', response.data);
    return { response: response };
  } catch (error) {
    console.error('Error al obtener el recordatorio:', error.response.data);
    return {
      response: error.response
    };
  }
}

export const guardarRecordatorio = async (id_usuario, id_libro, data, fechaR, horaR) => {
  try {
    const response = await api.post(`/usuarios/${id_usuario}/libros/${id_libro}/recordatorio`, {
      descripcion: data,
      fecha: fechaR,
      hora: horaR,
    });
    console.log('Recordatorio guardado exitosamente:', response.data);
    return { response: response };
  } catch (error) {
    console.error('Error al guardar el recordatorio:', error.response.data);
    return {
      response: error.response
    };
  }
};

export const borrarRecordatorio = async (id_usuario, id_libro) => {
  try {
    const response = await api.delete(`/usuarios/${id_usuario}/libros/${id_libro}/recordatorio`);
    console.log('Recordatorio eliminado exitosamente:', response.data);
    return { response: response.data };
  } catch (error) {
    console.error('Error al borrar el recordatorio:', error.response ? error.response.data : error.message
    );
    return { response: error.response };
  }
};

export const modificarRecordatorio = async (id_usuario, id_libro, data, fechaR, horaR) => {
  try {
    const response = await api.put(`/usuarios/${id_usuario}/libros/${id_libro}/recordatorio`, {
      descripcion: data,
      fecha: fechaR,
      hora: horaR,
    });
    console.log('Recordatorio modificado exitosamente:', response.data);
    return { response: response };
  } catch (error) {
    console.error('Error al modificar el recordatorio:', error.response.data);
    return {
      response: error.response
    };
  }
};


/* APIs de libros favoritos */
export const getFavoritosByUserID = (id_usuario) => api.get(`/favoritos/${id_usuario}`);
export const addFavorito = (id_usuario, id_libro) => api.post(`/usuarios/${id_usuario}/favoritos/${id_libro}`);
export const removeFavorito = (id_usuario, id_libro) => api.delete(`/usuarios/${id_usuario}/favoritos/${id_libro}`);

/* APIs de autores favoritos*/

export const getAutoresFavoritosByUserID = (id_usuario) => api.get(`/autoresFavoritos/${id_usuario}`);
export const addFavoritoAutor = (id_usuario, id_autor) => api.post(`/usuarios/${id_usuario}/autorFavorito/${id_autor}`);
export const removeFavoritoAutor = (id_usuario, id_autor) => api.delete(`/usuarios/${id_usuario}/autorFavorito/${id_autor}`);

export const obtenerPerfilUsuario = async (id_usuarioP) => {
  try {
    const response = await api.get(`/usuarios/${id_usuarioP}/obtenerPerfil`);
    console.log('Perfil del usuario obtenido exitosamente:', response.data);
    return response;
  }
  catch (error) {
    console.error('Error al obtener el perfil del usuario:', error.response ? error.response.data : error.message);
    return error.response;
  }
};

export const editarPerfil = async (id_usuarioP, formData) => {
  try {
    const response = await api.put(`/usuarios/${id_usuarioP}/editarPerfil`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Perfil del usuario actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const nuevaContrasena = async (id_usuario, contraseniaActual, contraseniaNueva) => {
  try {
    const response = await api.put(`/nueva/contrasenia/${id_usuario}`, {
      contraseniaActual,
      contraseniaNueva,
    });
    console.log('Nueva contraseña actualizada exitosamente:', response.data);
    return {
      response: response
    }
  } catch (error) {
    console.error('Error al actualizar cotrasenia:', error.response.data);
    return {
      response: error.response
    };
  }
}
