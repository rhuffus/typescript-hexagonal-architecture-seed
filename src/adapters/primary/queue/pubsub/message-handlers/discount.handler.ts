import { Message } from '@google-cloud/pubsub'
import { GiveWelcomeDiscountToNewUserUseCase } from '@use-cases/giveWelcomeDiscountToNewUser'
import { MessageAtributes } from '@ports/queue'

export class DiscountHandler {
  private readonly giveWelcomeDiscountToNewUserUseCase: GiveWelcomeDiscountToNewUserUseCase

  constructor(giveWelcomeDiscountToNewUserUseCase: GiveWelcomeDiscountToNewUserUseCase) {
    this.giveWelcomeDiscountToNewUserUseCase = giveWelcomeDiscountToNewUserUseCase
  }

  giveWelcomeDiscountToNewUserUseCaseHandler = async (message: Message): Promise<void> => {
    try {
      const messageAttributes = message.attributes as MessageAtributes
      this.giveWelcomeDiscountToNewUserUseCase.logger.setCorrelationId(messageAttributes.correlationId)
      const messageData = JSON.parse(message.data.toString())
      await this.giveWelcomeDiscountToNewUserUseCase.execute({ userId: messageData._id })
      message.ack()
    } catch (error) {
      this.giveWelcomeDiscountToNewUserUseCase.logger.error(error.stack)
    }
  }
}
