import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    const user = await this.usersService.findOne(userId);
    const message = this.messagesRepository.create({
      ...createMessageDto,
      user,
    });
    return this.messagesRepository.save(message);
  }

  findAll(): Promise<Message[]> {
    return this.messagesRepository.find({
      relations: ['user', 'likedBy'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['user', 'likedBy'],
    });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateMessageDto: CreateMessageDto,
  ): Promise<Message> {
    await this.messagesRepository.update(id, updateMessageDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.messagesRepository.softDelete(id);
  }

  async likeMessage(messageId: string, userId: string): Promise<Message> {
    const message = await this.findOne(messageId);
    const user = await this.usersService.findOne(userId);

    if (!message.likedBy) {
      message.likedBy = [];
    }

    const hasLiked = message.likedBy.some((like) => like.id === userId);
    if (!hasLiked) {
      message.likedBy.push(user);
      message.likesCount = (message.likesCount || 0) + 1;
      await this.messagesRepository.save(message);
    }

    return this.findOne(messageId);
  }

  async unlikeMessage(messageId: string, userId: string): Promise<Message> {
    const message = await this.findOne(messageId);

    if (!message.likedBy) {
      message.likedBy = [];
    }

    const hasLiked = message.likedBy.some((like) => like.id === userId);
    if (hasLiked) {
      message.likedBy = message.likedBy.filter((like) => like.id !== userId);
      message.likesCount = Math.max(0, (message.likesCount || 0) - 1);
      await this.messagesRepository.save(message);
    }

    return this.findOne(messageId);
  }
}
