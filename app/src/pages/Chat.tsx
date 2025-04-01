import {useState, useEffect} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import MessageForm from '../components/chat/MessageForm';
import MessageList from '../components/chat/MessageList';
import UserInfo from '../components/chat/UserInfo';
import LogoutButton from '../components/LogoutButton';
import OnlineUserList from '@/components/chat/OnlineUserList.tsx';
import {useSocket} from '@/contexts/SocketContext';
import {Users} from 'lucide-react';

interface ConnectedUser {
    userId: string;
    email: string;
    lastSeen: string;
    status: 'online' | 'offline';
}

const Chat = () => {
    const {user} = useAuth();

    return (
        <div className="flex h-screen overflow-hidden bg-[#1a1d21]">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 bg-[#19171D] text-white flex flex-col overflow-y-auto">

                {/* Channel list */}
                <div className="flex-1 p-3 space-y-4 overflow-y-auto">
                    <div>
                        <p className="text-xs text-[#ABABAD] font-medium px-2 mb-1">
                            CANAUX
                        </p>
                        <ul className="space-y-0.5">
                            <li className="px-2 py-1 rounded bg-[#1164A3] font-medium flex items-center">
                                <span className="mr-2">#</span>
                                général
                            </li>
                            <li className="px-2 py-1 rounded hover:bg-[#27242C]/70 cursor-pointer flex items-center">
                                <span className="mr-2">#</span>
                                autre
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs text-[#ABABAD] font-medium px-2 mb-1 flex items-center">
                            MEMBRES EN LIGNE
                            <span className="ml-2 bg-[#1164A3] text-white text-xs px-1.5 py-0.5 rounded-full">
                {/* Dynamique */}
                                <OnlineUserCount/>
              </span>
                        </p>
                        <div className="px-2">
                            <OnlineUserList/>
                        </div>
                    </div>
                </div>

                {/* User profile */}
                <div className="p-3 border-t border-[#2c2c2e]">
                    <UserInfo/>
                    <div className="mt-2">
                        <LogoutButton/>
                    </div>
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Channel header */}
                <div
                    className="h-14 border-b border-[#2c2c2e] flex items-center justify-between px-4 bg-[#1a1d21] shadow-sm">
                    <div className="flex items-center space-x-2">
                        <h2 className="font-bold text-lg text-white"># général</h2>
                        <span className="text-[#ABABAD] text-sm">|</span>
                        <button className="text-[#ABABAD] hover:text-white flex items-center text-sm">
                            <Users size={16} className="mr-1"/>
                            <span>
                <OnlineUserCount/> membres
              </span>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-[#1a1d21]">
                    <MessageList/>
                </div>

                {/* Message input */}
                {user && (
                    <div className="p-4 border-t border-[#2c2c2e] bg-[#1a1d21]">
                        <MessageForm/>
                    </div>
                )}
            </div>
        </div>
    );
};

const OnlineUserCount = () => {
    const {socket} = useSocket();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!socket) return;

        const handleConnectedUsers = (users: ConnectedUser[]) => {
            const onlineCount = users.filter(
                (user) => user.status === 'online',
            ).length;
            setCount(onlineCount);
        };

        socket.on('connectedUsers', handleConnectedUsers);

        return () => {
            socket.off('connectedUsers', handleConnectedUsers);
        };
    }, [socket]);

    return count;
};

export default Chat;
