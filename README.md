# 🚀 ChatApp - Clone de Slack

Une application de messagerie instantanée moderne inspirée de Slack, construite avec NestJS et React.

## ✨ Fonctionnalités

- 👤 **Authentification** - Inscription et connexion des utilisateurs
- 💬 **Messagerie en temps réel** - Communication instantanée entre utilisateurs
- 📢 **Canaux de discussion** - Organisation des conversations par thèmes
- 👀 **Statut de présence** - Visualisation des utilisateurs en ligne
- 🔔 **Notifications** - Alertes pour les nouveaux messages
- 🌈 **Interface utilisateur moderne** - Design inspiré de Slack, intuitif et réactif

## 🛠️ Technologies utilisées

### Backend

- **NestJS** - Framework Node.js
- **TypeORM** - ORM pour PostgreSQL
- **Socket.io** - Communication en temps réel
- **JWT** - Authentification sécurisée

### Frontend

- **React** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS

## 🚦 Démarrage rapide

### Prérequis

- Node.js (v18+)
- Docker et Docker Compose
- pnpm

### Installation et lancement

#### Backend

```sh
# Aller dans le dossier backend
cd api

# Lancer la base de données PostgreSQL avec Docker
docker compose up -d

# Installer les dépendances
pnpm install

# Démarrer le serveur en mode développement
pnpm start:dev
```

#### Frontend

```sh
# Aller dans le dossier frontend
cd app

# Installer les dépendances
pnpm install

# Démarrer l'application en mode développement
pnpm dev
```

## 📊 Base de données

Un service Adminer est inclus pour gérer facilement la base de données :

- **URL** : http://localhost:8080
- **Système** : PostgreSQL
- **Serveur** : database
- **Utilisateur** : postgres
- **Mot de passe** : postgres
- **Base de données** : chatapp

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.
