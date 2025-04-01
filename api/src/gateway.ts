import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io-client';

enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

interface ConnectedUser {
  socketId: string;
  userId?: string;
  email?: string;
  lastSeen: Date;
  status: UserStatus;
}

type UsersMap = Map<string, ConnectedUser>;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  private connectedUsersBySocketId: UsersMap = new Map();
  private connectedUsersByUserId: Map<string, ConnectedUser> = new Map();

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('register')
  handleRegister(
    client: Socket,
    payload: { userId: string; email: string },
  ): void {
    if (!client.id) return;

    const user = this.connectedUsersBySocketId.get(client.id);
    if (user) {
      const updatedUser = {
        ...user,
        userId: payload.userId,
        email: payload.email,
        lastSeen: new Date(),
        status: UserStatus.ONLINE,
      };

      this.connectedUsersBySocketId.set(client.id, updatedUser);
      this.connectedUsersByUserId.set(payload.userId, updatedUser);
    }

    this.updateConnectedUsersList();
  }

  handleConnection(client: Socket) {
    if (!client.id) return;

    this.connectedUsersBySocketId.set(client.id, {
      socketId: client.id,
      lastSeen: new Date(),
      status: UserStatus.ONLINE,
    });

    this.updateConnectedUsersList();
  }

  handleDisconnect(client: Socket) {
    if (!client.id) return;

    const user = this.connectedUsersBySocketId.get(client.id);

    this.connectedUsersBySocketId.delete(client.id);

    if (user && user.userId && user.email) {
      const updatedUser = {
        ...user,
        status: UserStatus.OFFLINE,
        lastSeen: new Date(),
      };

      this.connectedUsersByUserId.set(user.userId, updatedUser);
    }

    this.updateConnectedUsersList();
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    if (!client.id) return;

    const user = this.connectedUsersBySocketId.get(client.id);
    if (user) {
      user.lastSeen = new Date();
      this.connectedUsersBySocketId.set(client.id, user);

      if (user.userId) {
        this.connectedUsersByUserId.set(user.userId, user);
      }
    }

    this.server.emit('messageFromBack', payload);

    this.updateConnectedUsersList();
  }

  @SubscribeMessage('messageLiked')
  handleMessageLiked(payload: { messageId: string }): void {
    this.server.emit('messageLiked', payload.messageId);
  }

  private updateConnectedUsersList(): void {
    const usersToSendMap = new Map<string, ConnectedUser>();

    Array.from(this.connectedUsersByUserId.values()).forEach((user) => {
      if (user.userId) {
        usersToSendMap.set(user.userId, user);
      }
    });

    Array.from(this.connectedUsersBySocketId.values())
      .filter((user) => user.userId && user.email)
      .forEach((user) => {
        if (user.userId) {
          usersToSendMap.set(user.userId, user);
        }
      });

    const usersToSend = Array.from(usersToSendMap.values()).map((user) => ({
      userId: user.userId,
      email: user.email,
      lastSeen: user.lastSeen.toISOString(),
      status: user.status,
    }));

    this.server.emit('connectedUsers', usersToSend);
  }
}
