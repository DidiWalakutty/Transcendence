import type { CreateUserDto, UpdateUserDto, UserDto } from '@repo/schemas/users';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<UserDto | undefined>;
  abstract findById(id: string): Promise<UserDto | undefined>;
  abstract findAll(): Promise<UserDto[]>;
  abstract create(data: CreateUserDto): Promise<UserDto>;
  abstract update(data: UpdateUserDto): Promise<UserDto | undefined>;
  abstract delete(id: string): Promise<UserDto | undefined>;
}
