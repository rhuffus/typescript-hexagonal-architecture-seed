/* eslint-disable @typescript-eslint/no-unused-vars */
import { IUserRepository } from '@repositories/user.repository'
import { User } from '@entities/user'

export class FakeUserRepository implements IUserRepository {
  save(user: User): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getByEmail(id: string): Promise<User | undefined> {
    throw new Error('Method not implemented.')
  }
}
