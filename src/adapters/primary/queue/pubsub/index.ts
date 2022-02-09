import { PubSub } from '@google-cloud/pubsub'
import { GiveWelcomeDiscountToNewUserUseCase } from '@use-cases/giveWelcomeDiscountToNewUser'
import { ILogger } from '@ports/logger'
import { Config } from '@app/config'
import { Subscription } from '@adapters/primary/queue/pubsub/subscription'
import { DiscountHandler } from '@adapters/primary/queue/pubsub/message-handlers/discount.handler'

export class GooglePubSub {
  private readonly giveWelcomeDiscountToNewUserUseCase: GiveWelcomeDiscountToNewUserUseCase
  private readonly logger: ILogger
  private readonly pubSubClient: PubSub

  constructor(
    projectId: string,
    giveWelcomeDiscountToNewUserUseCase: GiveWelcomeDiscountToNewUserUseCase,
    logger: ILogger
  ) {
    this.giveWelcomeDiscountToNewUserUseCase = giveWelcomeDiscountToNewUserUseCase
    this.logger = logger
    this.pubSubClient = new PubSub({ projectId })
  }

  async startSubscriptions(): Promise<void> {
    const discountHandler = new DiscountHandler(this.giveWelcomeDiscountToNewUserUseCase)

    await new Subscription(
      this.pubSubClient,
      discountHandler.giveWelcomeDiscountToNewUserUseCaseHandler,
      this.logger,
      Config.SUBSCRIPTION_NAME
    ).initSubscription()
  }
}
