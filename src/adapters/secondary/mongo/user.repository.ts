import { MongoClient } from 'mongodb'
import { IUserRepository } from '@repositories/user.repository'
import { ILogger } from '@ports/logger'
import { Optional } from '@common/types/optional'
import { User } from '@entities/user'

export class MongoUserRepository implements IUserRepository {
  private readonly client: MongoClient
  private readonly logger: ILogger
  private readonly COLLECTION = 'user'

  constructor(client: MongoClient, logger: ILogger) {
    this.client = client
    this.logger = logger
  }

  async save(user: User): Promise<void> {
    this.logger.info('Saving entity user in the database')
    await this.client.db().collection(this.COLLECTION).insertOne(user)
  }

  async getByEmail(email: string): Promise<Optional<User>> {
    this.logger.info('Retrieving user entity by email from the database')
    const result = await this.client.db().collection(this.COLLECTION).findOne({ email })
    return result ? new User(result) : undefined
  }
}
