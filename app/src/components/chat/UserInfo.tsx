import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';
import {Button} from '../ui/button';
import {LogIn} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

const UserInfo: React.FC = () => {
    const {user} = useAuth();
    const navigate = useNavigate();

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

    if (!user) {
        return (
            <Button
                onClick={() => navigate('/signin')}
                variant="ghost"
                className="w-full text-gray-100 hover:bg-[#27242C] justify-start"
            >
                <LogIn className="mr-2 h-4 w-4"/>
                <span>Se connecter</span>
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2 py-1 px-1 rounded hover:bg-[#27242C] cursor-pointer">
            <div className="relative">
                <Avatar className="h-7 w-7">
                    <AvatarImage src={`https://avatar.vercel.sh/${user.id}`}/>
                    <AvatarFallback className="bg-[#1164A3] text-white">
                        {getInitials(user.email)}
                    </AvatarFallback>
                </Avatar>
                <span
                    className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border-[1px] border-[#19171D]"></span>
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium text-white">
                    {user.email.split('@')[0]}
                </div>
                <div className="text-xs text-[#ABABAD]">Actif</div>
            </div>
        </div>
    );
};

export default UserInfo;
