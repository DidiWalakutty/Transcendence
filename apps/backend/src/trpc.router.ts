import { z } from 'zod';
import { Router, Query, Mutation, Input } from 'nestjs-trpc';
import { userSchema } from '@repo/schemas';
import type { UserDto } from '@repo/schemas';

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
];

let users: UserDto[] = [];

@Router({ alias: 'example' })
export class ExampleRouter {
  @Query({ output: z.array(z.object({ id: z.number(), name: z.string() })) })
  getTodos() {
    return todos;
  }

  @Mutation({ input: userSchema, output: userSchema })
  createUser(@Input() input: UserDto) {
    users.push(input);
    return input;
  }

  @Query({ output: z.array(userSchema) })
  getUsers() {
    return users;
  }
}
