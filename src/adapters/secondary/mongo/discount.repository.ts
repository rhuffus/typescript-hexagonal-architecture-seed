import { MongoClient } from 'mongodb'
import { IDiscountRepository } from '@repositories/discount.repository'
import { ILogger } from '@ports/logger'
import { Optional } from '@common/types/optional'
import { Discount } from '@entities/discount'

export class MongoDiscountRepository implements IDiscountRepository {
  private readonly client: MongoClient
  private readonly logger: ILogger
  private readonly COLLECTION = 'discount'

  constructor(client: MongoClient, logger: ILogger) {
    this.client = client
    this.logger = logger
  }

  async getById(_id: string): Promise<Optional<Discount>> {
    this.logger.info('Retrieving discount entity by id from the database')
    const result = await this.client.db().collection(this.COLLECTION).findOne({ _id })
    return result ? new Discount(result) : undefined
  }

  async save(discount: Discount): Promise<void> {
    this.logger.info('Saving entity discount in the database')
    await this.client.db().collection(this.COLLECTION).insertOne(discount)
  }

  async update(discount: Discount): Promise<void> {
    this.logger.info('Update discount in the database')
    await this.client.db().collection(this.COLLECTION).updateOne({ _id: discount._id }, { $set: discount })
  }
}
