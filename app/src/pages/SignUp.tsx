import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import { AuthFormData } from '../services/authService';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: AuthFormData) => {
    await signUp(data);
    navigate('/');
  };

  return (
    <AuthForm
      title="Inscrivez-vous sur Slack"
      submitButtonText="Continuer avec email"
      onSubmit={handleSubmit}
      redirectText="Déjà sur Slack ?"
      redirectLinkText="Se connecter"
      redirectTo="/signin"
    />
  );
}
