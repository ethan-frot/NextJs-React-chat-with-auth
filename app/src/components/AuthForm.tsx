import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AuthFormData } from '../services/authService';
import { Button } from './ui/button';
import logo from '../assets/logo.svg';

interface AuthFormProps {
  title: string;
  submitButtonText: string;
  onSubmit: (data: AuthFormData) => Promise<void>;
  redirectText: string;
  redirectLinkText: string;
  redirectTo: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  submitButtonText,
  onSubmit,
  redirectText,
  redirectLinkText,
  redirectTo,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>();

  const handleFormSubmit = async (data: AuthFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await onSubmit(data);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'authentification",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-[#1A1D21] text-white">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Slack Logo" className="h-10 w-auto" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>
        <p className="text-center text-gray-400 mb-8">
          Nous vous suggérons d'utiliser l'adresse email que vous utilisez au
          travail.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Adresse email
            </label>
            <input
              id="email"
              autoComplete="email"
              {...register('email', {
                required: "L'email est requis",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide',
                },
              })}
              className="block w-full rounded-md border border-[#424242] bg-[#222529] px-4 py-3 text-white placeholder-gray-400 focus:border-[#1264A3] focus:outline-none focus:ring-2 focus:ring-[#1264A3]"
              placeholder="name@work-email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Mot de passe
              </label>
            </div>
            <input
              id="password"
              type="password"
              autoComplete={
                redirectTo === '/signin' ? 'new-password' : 'current-password'
              }
              {...register('password', {
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message:
                    'Le mot de passe doit contenir au moins 6 caractères',
                },
              })}
              className="block w-full rounded-md border border-[#424242] bg-[#222529] px-4 py-3 text-white placeholder-gray-400 focus:border-[#1264A3] focus:outline-none focus:ring-2 focus:ring-[#1264A3]"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 p-4 rounded-md">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="w-full py-3 bg-[#1264A3] hover:bg-[#0b4c8c] text-white rounded-md font-medium cursor-pointer"
          >
            {isLoading ? 'Chargement...' : submitButtonText}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center">
          <span className="text-sm text-gray-400">{redirectText}</span>
          <Link
            to={redirectTo}
            className="ml-1 text-sm font-medium text-[#1264A3] hover:text-[#0b4c8c]"
          >
            {redirectLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
