import React, {KeyboardEvent} from 'react';
import {useForm} from 'react-hook-form';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {messageService, CreateMessageDto} from '@/services/messageService';
import {
    SendHorizontal,
    Plus,
    Bold,
    Italic,
    List,
    LinkIcon,
    AtSign,
    Smile,
} from 'lucide-react';
import {useSocket} from '@/contexts/SocketContext';

const MessageForm: React.FC = () => {
    const {register, handleSubmit, reset, watch} = useForm<CreateMessageDto>();
    const queryClient = useQueryClient();
    const messageText = watch('text', '');
    const {socket} = useSocket();

    const allowToSend = messageText.trim() !== '';

    const mutation = useMutation({
        mutationFn: (data: CreateMessageDto) => messageService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['messages']});
            reset();
            if (!socket) return;
            socket.emit('message', 'newMessage');
        },
    });

    const onSubmit = (data: CreateMessageDto) => {
        mutation.mutate(data);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Envoyer le message lorsque l'utilisateur appuie sur Entrée sans la touche Shift
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (allowToSend) {
                handleSubmit(onSubmit)();
            }
        }
    };

    return (
        <div className="rounded-lg border border-[#393939] overflow-hidden">
            {/* Message input toolbar */}
            <div className="bg-[#222529] px-3 py-2 flex items-center border-b border-[#393939]">
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <Bold size={16}/>
                </button>
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <Italic size={16}/>
                </button>
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <List size={16}/>
                </button>
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <LinkIcon size={16}/>
                </button>
                <div className="h-5 w-px bg-[#393939] mx-2"></div>
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <AtSign size={16}/>
                </button>
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <Smile size={16}/>
                </button>
                <div className="flex-1"></div>
                <button className="text-[#ABABAD] hover:text-white p-1 rounded hover:bg-[#2c2c2e]">
                    <Plus size={16}/>
                </button>
            </div>

            {/* Message input */}
            <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <textarea
            {...register('text', {required: true})}
            placeholder="Envoyer un message dans #général"
            className="w-full px-4 py-3 resize-none focus:outline-none bg-[#222529] text-white placeholder-[#6b6f76] leading-5"
            rows={2}
            onKeyDown={handleKeyPress}
        />

                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    {mutation.isPending ? (
                        <div className="text-sm text-[#1d9bd1]">Envoi en cours...</div>
                    ) : (
                        <button
                            type="submit"
                            disabled={!allowToSend}
                            className={`flex items-center justify-center h-8 w-8 rounded-full ${
                                allowToSend
                                    ? 'bg-[#1164A3] text-white hover:bg-[#0b5a92]'
                                    : 'bg-[#2c2c2e] text-[#6b6f76]'
                            } transition-colors duration-200`}
                        >
                            <SendHorizontal size={16}/>
                        </button>
                    )}
                </div>
            </form>

            {mutation.isError && (
                <p className="px-4 py-2 text-sm text-red-400 bg-red-900/20">
                    Erreur lors de l'envoi du message. Veuillez réessayer.
                </p>
            )}

            <div className="px-4 py-2 text-xs text-[#ABABAD] bg-[#222529]">
                Appuyez sur{' '}
                <kbd className="px-1.5 py-0.5 bg-[#2c2c2e] rounded border border-[#393939]">
                    Entrée
                </kbd>{' '}
                pour envoyer,{' '}
                <kbd className="px-1.5 py-0.5 bg-[#2c2c2e] rounded border border-[#393939]">
                    Maj+Entrée
                </kbd>{' '}
                pour sauter une ligne
            </div>
        </div>
    );
};

export default MessageForm;
