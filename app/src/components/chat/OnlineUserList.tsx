import {useState, useEffect} from 'react';
import {UserRound, Clock} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Socket} from 'socket.io-client';
import {formatDistanceToNow, parseISO} from 'date-fns';
import {fr} from 'date-fns/locale';

interface ConnectedUser {
    userId: string;
    email: string;
    lastSeen: string;
    status: 'online' | 'offline';
}

interface OnlineUserListProps {
    socket: Socket | null;
}

const OnlineUserList = ({socket}: OnlineUserListProps) => {
    const [showUsersList, setShowUsersList] = useState(false);
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
        <div
            className="flex -space-x-2 items-center cursor-pointer group"
            onMouseEnter={() => setShowUsersList(true)}
            onMouseLeave={() => setShowUsersList(false)}
        >
            {onlineUsers.length > 0 ? (
                <>
                    {onlineUsers.slice(0, 3).map((connectedUser, index) => (
                        <Avatar
                            key={connectedUser.userId}
                            className="h-8 w-8 ring-2 ring-background transition-all duration-300"
                            style={{zIndex: 10 - index}}
                        >
                            <AvatarImage
                                src={`https://avatar.vercel.sh/${connectedUser.userId}`}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials(connectedUser.email)}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {onlineUsers.length > 3 && (
                        <div
                            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-background text-xs">
                            +{onlineUsers.length - 3}
                        </div>
                    )}
                </>
            ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-background">
                    <UserRound size={16}/>
                </div>
            )}

            {showUsersList && (
                <div
                    className="absolute top-full left-0 mt-2 bg-card rounded-lg shadow-lg py-2 px-3 w-64 z-50 transform origin-top-left transition-all duration-200">
                    <div className="mb-3">
                        <p className="text-xs font-medium text-green-500 mb-2 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                            En ligne ({onlineUsers.length})
                        </p>
                        {onlineUsers.length > 0 ? (
                            <div className="space-y-1.5">
                                {onlineUsers.map((user) => (
                                    <div
                                        key={user.userId}
                                        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={`https://avatar.vercel.sh/${user.userId}`}
                                            />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                                {getInitials(user.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm truncate flex-1">
                      {user.email}
                    </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic px-2">
                                Aucun utilisateur en ligne
                            </p>
                        )}
                    </div>

                    {offlineUsers.length > 0 && (
                        <div className="h-px bg-border my-2"></div>
                    )}

                    {offlineUsers.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
                                <span className="h-2 w-2 rounded-full bg-muted mr-1.5"></span>
                                Hors ligne ({offlineUsers.length})
                            </p>
                            <div className="space-y-1.5">
                                {offlineUsers.map((user) => (
                                    <div
                                        key={user.userId}
                                        className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/50"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={`https://avatar.vercel.sh/${user.userId}`}
                                            />
                                            <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                                                {getInitials(user.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-sm truncate">{user.email}</div>
                                            <div className="flex items-center text-[10px] text-muted-foreground">
                                                <Clock size={9} className="mr-0.5"/>
                                                <span className="truncate">
                          {getTimeAgo(user.lastSeen)}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OnlineUserList;
