import {useAuth} from '../contexts/AuthContext';
import {Button} from './ui/button';
import {LogOut} from 'lucide-react';

const LogoutButton = () => {
    const {signOut} = useAuth();

    return (
        <Button
            onClick={signOut}
            variant="ghost"
            className="w-full text-gray-100 hover:bg-[#27242C] justify-start"
            size="sm"
        >
            <LogOut className="mr-2 h-4 w-4"/>
            <span>Déconnexion</span>
        </Button>
    );
};

export default LogoutButton;
