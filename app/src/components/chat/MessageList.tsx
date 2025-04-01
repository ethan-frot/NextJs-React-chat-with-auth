import React, {useEffect, useRef} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {messageService, Message} from '@/services/messageService.ts';
import {Heart} from 'lucide-react';
import {useAuth} from '@/contexts/AuthContext';
import {useSocket} from '@/contexts/SocketContext';
import {format, isToday, parseISO, isSameDay} from 'date-fns';
import {fr} from 'date-fns/locale';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

interface MessagesByDate {
    [date: string]: Message[];
}

const MessageList: React.FC = () => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {user} = useAuth();
    const {socket} = useSocket();
    const queryClient = useQueryClient();

    const {
        data: messages,
        isLoading,
        error,
    } = useQuery<Message[]>({
        queryKey: ['messages'],
        queryFn: () => {
            return messageService.findAll();
        },
    });

    const likeMutation = useMutation({
        mutationFn: (messageId: string) => messageService.likeMessage(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['messages']});
        },
    });

    const unlikeMutation = useMutation({
        mutationFn: (messageId: string) => messageService.unlikeMessage(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['messages']});
        },
    });

    useEffect(() => {
        if (!socket) return;

        const handleMessageLiked = (data: {
            messageId: string;
            likesCount: number;
        }) => {
            queryClient.setQueryData<Message[]>(['messages'], (oldMessages) => {
                if (!oldMessages) return oldMessages;
                return oldMessages.map((message) => {
                    if (message.id === data.messageId) {
                        return {
                            ...message,
                            likesCount: data.likesCount,
                        };
                    }
                    return message;
                });
            });
        };

        socket.on('messageLiked', handleMessageLiked);

        return () => {
            socket.off('messageLiked', handleMessageLiked);
        };
    }, [socket, queryClient]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (isLoading) {
        return (
            <div className="text-center py-10 text-[#ABABAD]">
                Chargement des messages...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 py-10">
                Erreur lors du chargement des messages. Veuillez réessayer.
            </div>
        );
    }

    const handleLike = (message: Message) => {
        if (!user) return;

        const hasLiked =
            message.likedBy?.some((like) => like.id === user.id) ?? false;
        if (hasLiked) {
            unlikeMutation.mutate(message.id);
        } else {
            likeMutation.mutate(message.id);
        }
    };

    // Fonction pour obtenir les initiales à partir de l'email
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

    // Fonction pour formater le message avec mise en évidence des mentions
    const formatMessageText = (text: string) => {
        const mentionRegex = /@(\w+)/g;
        return text.split(mentionRegex).map((part, index) => {
            if (index % 2 === 1) {
                return (
                    <span
                        key={index}
                        className="bg-[#1164A3]/20 text-[#1d9bd1] px-1 rounded"
                    >
            @{part}
          </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Regrouper les messages par date
    const groupMessagesByDate = (): MessagesByDate => {
        if (!messages) return {};

        return messages.reduce((acc: MessagesByDate, message) => {
            const date = parseISO(message.createdAt.toString());
            const dateKey = format(date, 'yyyy-MM-dd');

            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }

            acc[dateKey].push(message);
            return acc;
        }, {});
    };

    // Formater l'en-tête de date
    const formatDateHeader = (dateStr: string) => {
        const date = new Date(dateStr);

        if (isToday(date)) {
            return "Aujourd'hui";
        }

        return format(date, 'EEEE d MMMM', {locale: fr});
    };

    const messagesByDate = groupMessagesByDate();
    const sortedDates = Object.keys(messagesByDate).sort();

    return (
        <div className="space-y-6 px-4 py-6">
            {sortedDates.map((dateKey) => (
                <div key={dateKey} className="space-y-2">
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#2c2c2e]"></div>
                        </div>
                        <div className="relative flex justify-center">
              <span className="bg-[#1a1d21] px-3 text-sm text-[#ABABAD] capitalize">
                {formatDateHeader(dateKey)}
              </span>
                        </div>
                    </div>

                    {messagesByDate[dateKey].map((message, idx) => {
                        const hasLiked =
                            (user && message.likedBy?.some((like) => like.id === user.id)) ??
                            false;
                        const prevMessage =
                            idx > 0 ? messagesByDate[dateKey][idx - 1] : null;
                        const showUserInfo =
                            !prevMessage ||
                            prevMessage.user.id !== message.user.id ||
                            !isSameDay(
                                parseISO(prevMessage.createdAt.toString()),
                                parseISO(message.createdAt.toString()),
                            );

                        return (
                            <div
                                key={message.id}
                                className={`${
                                    showUserInfo ? 'mt-4' : 'ml-10 mt-0.5'
                                } hover:bg-[#222529] rounded px-2 py-1 group relative`}
                            >
                                {showUserInfo && (
                                    <div className="flex items-center mb-1">
                                        <Avatar className="h-9 w-9 mr-2">
                                            <AvatarImage
                                                src={`https://avatar.vercel.sh/${message.user.id}`}
                                            />
                                            <AvatarFallback className="bg-[#1164A3] text-white">
                                                {getInitials(message.user.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex items-center">
                      <span className="font-bold text-white">
                        {message.user.email.split('@')[0]}
                      </span>
                                            <span className="text-xs text-[#ABABAD] ml-2">
                        {format(
                            parseISO(message.createdAt.toString()),
                            'HH:mm',
                        )}
                      </span>
                                        </div>
                                    </div>
                                )}

                                <div className={`${showUserInfo ? 'ml-11' : ''}`}>
                                    <p className="text-white break-words leading-snug">
                                        {formatMessageText(message.text)}
                                    </p>

                                    <div className="flex mt-1 space-x-2">
                                        {message.likesCount > 0 && (
                                            <button
                                                onClick={() => handleLike(message)}
                                                className={`flex items-center gap-1 py-0.5 rounded-full text-xs ${
                                                    hasLiked
                                                        ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                                        : 'bg-[#2c2c2e] text-[#ABABAD] hover:bg-[#393939]'
                                                } px-2 transition-colors duration-150`}
                                            >
                                                <Heart
                                                    size={12}
                                                    className="mr-0.5"
                                                    fill={hasLiked ? 'currentColor' : 'none'}
                                                />
                                                <span>{message.likesCount}</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Bouton de like qui n'apparaît qu'au survol si l'utilisateur n'a pas encore liké */}
                                    {user && !hasLiked && (
                                        <div
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleLike(message)}
                                                className="p-1.5 bg-[#2c2c2e] hover:bg-[#393939] rounded-full text-[#ABABAD] hover:text-white transition-colors shadow-md"
                                                title="J'aime"
                                            >
                                                <Heart size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
            <div ref={messagesEndRef}/>
        </div>
    );
};

export default MessageList;
