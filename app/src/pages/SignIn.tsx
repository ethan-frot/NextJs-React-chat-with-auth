import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import { AuthFormData } from '../services/authService';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: AuthFormData) => {
    await signIn(data);
    navigate('/');
  };

  return (
    <AuthForm
      title="Se connecter à Slack"
      submitButtonText="Se connecter avec email"
      onSubmit={handleSubmit}
      redirectText="Nouveau sur Slack ?"
      redirectLinkText="Créer un compte"
      redirectTo="/signup"
    />
  );
}
