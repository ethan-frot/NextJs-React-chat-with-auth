import React, {useEffect, useRef} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {messageService, Message} from '@/services/messageService.ts';
import {Heart} from 'lucide-react';
import {useAuth} from '@/contexts/AuthContext';
import {useSocket} from '@/contexts/SocketContext';

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
        return <div className="text-center">Loading messages...</div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-600">
                Error loading messages. Please try again.
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

    return (
        <div className="space-y-4">
            {messages?.map((message) => {
                const hasLiked =
                    (user && message.likedBy?.some((like) => like.id === user.id)) ??
                    false;

                return (
                    <div key={message.id} className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-gray-800">{message.text}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500/60 mt-4">
                            <div className="flex items-center gap-2">
                                <p>{message?.user?.email}</p>
                                <button
                                    onClick={() => handleLike(message)}
                                    className={`flex items-center gap-1 transition-colors ${
                                        hasLiked
                                            ? 'text-red-500'
                                            : 'text-gray-400 hover:text-red-500'
                                    }`}
                                    disabled={!user}
                                >
                                    <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'}/>
                                    <span>{message.likesCount ?? 0}</span>
                                </button>
                            </div>
                            <p>{new Date(message.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef}/>
        </div>
    );
};

export default MessageList;
