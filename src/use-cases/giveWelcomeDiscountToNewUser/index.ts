import { IDiscountRepository } from '@repositories/discount.repository'
import { ILogger } from '@ports/logger'
import { IIDGenerator } from '@ports/id-generator'
import { IQueue, MessageAttributeOperation } from '@ports/queue'
import { Discount } from '@entities/discount'
import { Config } from '@app/config'
import { PropertyRequiredError } from '@exceptions/property-required'

export class GiveWelcomeDiscountToNewUserUseCase {
  private readonly repository: IDiscountRepository
  public readonly logger: ILogger
  private readonly idGenerator: IIDGenerator
  private readonly queue: IQueue

  constructor(repository: IDiscountRepository, logger: ILogger, idGenerator: IIDGenerator, queue: IQueue) {
    this.repository = repository
    this.logger = logger
    this.idGenerator = idGenerator
    this.queue = queue
  }

  async execute({ userId }: { userId: string }): Promise<Discount> {
    this.logger.info('Creating a new discount')
    if (!userId) throw new PropertyRequiredError('name')

    const newDiscount = new Discount({
      _id: this.idGenerator.generate(),
      userId,
      percentage: Config.WELCOME_DISCOUNT_PERCENTAGE,
      updatedAt: new Date(),
      createdAt: new Date(),
    })

    await this.repository.save(newDiscount)

    this.logger.info('New discount created successfully')

    this.queue.publish(JSON.stringify(newDiscount), {
      version: '1',
      companyId: '1',
      collection: 'discount',
      operation: MessageAttributeOperation.CREATE,
    })

    return newDiscount
  }
}
