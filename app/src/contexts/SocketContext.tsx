import React, {createContext, useContext, useEffect, useState} from 'react';
import {io, Socket} from 'socket.io-client';
import {useAuth} from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({socket: null});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                            children,
                                                                        }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const {user} = useAuth();

    useEffect(() => {
        const socket = io('http://localhost:8000');

        socket.on('connect', () => {
            console.log('Connected to server');
            setSocket(socket);

            if (user && user.id) {
                socket.emit('register', {userId: user.id, email: user.email});
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket && user && user.id) {
            socket.emit('register', {userId: user.id, email: user.email});
        }
    }, [socket, user]);

    return (
        <SocketContext.Provider value={{socket}}>
            {children}
        </SocketContext.Provider>
    );
};
