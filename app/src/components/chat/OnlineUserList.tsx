import {useState, useEffect} from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useSocket} from '@/contexts/SocketContext';
import {formatDistanceToNow, parseISO} from 'date-fns';
import {fr} from 'date-fns/locale';

interface ConnectedUser {
    userId: string;
    email: string;
    lastSeen: string;
    status: 'online' | 'offline';
}

const OnlineUserList = () => {
    const {socket} = useSocket();
    const [users, setUsers] = useState<ConnectedUser[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleConnectedUsers = (users: ConnectedUser[]) => {
            setUsers(users);
        };

        socket.on('connectedUsers', handleConnectedUsers);

        return () => {
            socket.off('connectedUsers', handleConnectedUsers);
        };
    }, [socket]);

    const onlineUsers = users.filter((user) => user.status === 'online');
    const offlineUsers = users.filter((user) => user.status === 'offline');

    const getInitials = (email: string): string => {
        if (!email) return '??';
        return email
            .split('@')[0]
            .split('.')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getTimeAgo = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: fr,
                includeSeconds: true,
            });
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error);
            return 'Date inconnue';
        }
    };

    return (
        <div className="text-sm">
            <div className="space-y-1">
                {onlineUsers.map((user) => (
                    <div
                        key={user.userId}
                        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#27242C] cursor-pointer"
                    >
                        <div className="relative">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.userId}`}/>
                                <AvatarFallback className="bg-[#1164A3] text-white text-[10px]">
                                    {getInitials(user.email)}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-500 border-[1px] border-[#19171D]"></div>
                        </div>
                        <span className="truncate flex-1 text-white">
              {user.email.split('@')[0]}
            </span>
                    </div>
                ))}
            </div>

            {offlineUsers.length > 0 && (
                <>
                    <p className="text-xs text-[#ABABAD] font-medium px-2 my-2">
                        HORS LIGNE
                    </p>
                    <div className="space-y-1">
                        {offlineUsers.map((user) => (
                            <div
                                key={user.userId}
                                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#27242C] cursor-pointer"
                            >
                                <div className="relative">
                                    <Avatar className="h-5 w-5 opacity-70">
                                        <AvatarImage
                                            src={`https://avatar.vercel.sh/${user.userId}`}
                                        />
                                        <AvatarFallback className="bg-[#4e4e50] text-white text-[10px]">
                                            {getInitials(user.email)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <span className="truncate flex-1 text-[#ABABAD] opacity-90">
                  {user.email.split('@')[0]}
                </span>
                                <span className="text-[10px] text-[#ABABAD] opacity-70">
                  {getTimeAgo(user.lastSeen)}
                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default OnlineUserList;
