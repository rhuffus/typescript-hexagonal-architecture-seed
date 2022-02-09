import { IDiscountRepository } from '@repositories/discount.repository'
import { ILogger } from '@ports/logger'
import { INotification } from '@ports/notification'
import { NotFoundError } from '@exceptions/not-found'

export class UpdateDiscountPercentageUseCase {
  private readonly repository: IDiscountRepository
  public readonly logger: ILogger
  private readonly notification: INotification

  constructor(repository: IDiscountRepository, logger: ILogger, notification: INotification) {
    this.repository = repository
    this.logger = logger
    this.notification = notification
  }

  async execute(id: string, percentage: number): Promise<void> {
    this.logger.info(`Changing the percentage of the discount ${id} to ${percentage}`)

    const discount = await this.repository.getById(id)
    if (!discount) throw new NotFoundError()

    discount.setPercentage(percentage)
    discount.updatedAt = new Date()

    await this.repository.update(discount)

    this.logger.info(`Changed the percentage for the discount ${id} to ${percentage}`)

    await this.notification.notify(discount.userId, `Your discount has been changed to ${percentage}`)
  }
}
