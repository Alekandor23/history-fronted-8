import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

// Función para validar JSON almacenado
const getValidStoredUser = () => {
    const storedUser = localStorage.getItem('user');
    try {
        // Intenta analizar el JSON almacenado
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.warn('Datos inválidos encontrados en localStorage para "user". Reiniciando...', error);
        localStorage.removeItem('user'); // Elimina datos corruptos
        return null;
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(getValidStoredUser);

    // Sincroniza con localStorage cuando el usuario cambie
    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error al guardar el usuario en localStorage:', error);
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);