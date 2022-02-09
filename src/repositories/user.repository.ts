import { Optional } from '@common/types/optional'
import { User } from '@entities/user'

export interface IUserRepository {
  save(user: User): Promise<void>
  getByEmail(email: string): Promise<Optional<User>>
}
