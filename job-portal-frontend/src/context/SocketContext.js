import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Conectar al servidor de Socket.IO
        const newSocket = io('http://localhost:3000', {
            withCredentials: true, // Enviar credenciales (cookies)
        });

        setSocket(newSocket);

        // Limpiar la conexión al desmontar el componente
        return () => newSocket.disconnect();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);