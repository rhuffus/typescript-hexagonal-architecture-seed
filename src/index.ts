import { ExpressApi } from './adapters/primary/rest/express'
import { MongoManager } from './adapters/secondary/mongo'
import { install as installSourceMapSupport } from 'source-map-support'
import { GoogleWinstonLogger } from './adapters/secondary/google/logger'
import { GoogleCloudSecret } from './adapters/secondary/google/secret'
import { GoogleKMS } from './adapters/secondary/google/kms'
import { GoogleStorage } from './adapters/secondary/google/storage'
import { PubsubPublisher } from './adapters/secondary/google/queue'
import { NanoIdGenerator } from './adapters/secondary/nanoid-generator'
import { AxiosHttp } from './adapters/secondary/http/axios-http'
import { TrazableAuth } from './adapters/secondary/trazable/trazable-auth'
import {
  DATABASE_LOGGER,
  EXPRESS_API_LOGGER,
  PUBSUB_LOGGER,
  CREATE_USER_USE_CASE_LOGGER,
  USER_CREATED_EVENT,
  CREATE_DISCOUNT_USE_CASE_LOGGER,
  DISCOUNT_CREATED_EVENT,
} from './constants'
import { GooglePubSub } from './adapters/primary/queue/pubsub'
import { Config } from './config'
import { MongoUserRepository } from './adapters/secondary/mongo/user.repository'
import { GiveWelcomeDiscountToNewUserUseCase } from './use-cases/giveWelcomeDiscountToNewUser'
import { MongoDiscountRepository } from './adapters/secondary/mongo/discount.repository'
import { UpdateDiscountPercentageUseCase } from './use-cases/updateDiscountPercentage'
import { ExternalNotificationService } from './adapters/secondary/notification/external-notification.service'
import { CreateUserUseCase } from './use-cases/createUser'
;(async () => {
  installSourceMapSupport()

  const mongoManager = new MongoManager(
    new GoogleCloudSecret(new GoogleKMS(), new GoogleStorage()),
    new GoogleWinstonLogger(DATABASE_LOGGER)
  )

  const mongoClient = await mongoManager.connect()

  if (mongoClient) {
    const createUserUseCaseLogger = new GoogleWinstonLogger(CREATE_USER_USE_CASE_LOGGER)
    const createUserUseCase = new CreateUserUseCase(
      new MongoUserRepository(mongoClient, createUserUseCaseLogger),
      createUserUseCaseLogger,
      new NanoIdGenerator(),
      new PubsubPublisher(USER_CREATED_EVENT, Config.GCLOUD_PROJECT_ID || '', createUserUseCaseLogger),
      new ExternalNotificationService()
    )

    const giveWelcomeDiscountToNewUserUseCaseLogger = new GoogleWinstonLogger(CREATE_DISCOUNT_USE_CASE_LOGGER)
    const giveWelcomeDiscountToNewUserUseCase = new GiveWelcomeDiscountToNewUserUseCase(
      new MongoDiscountRepository(mongoClient, giveWelcomeDiscountToNewUserUseCaseLogger),
      giveWelcomeDiscountToNewUserUseCaseLogger,
      new NanoIdGenerator(),
      new PubsubPublisher(
        DISCOUNT_CREATED_EVENT,
        Config.GCLOUD_PROJECT_ID || '',
        giveWelcomeDiscountToNewUserUseCaseLogger
      )
    )

    const updateDiscountPercentageUseCaseLogger = new GoogleWinstonLogger(CREATE_DISCOUNT_USE_CASE_LOGGER)
    const updateDiscountPercentageUseCase = new UpdateDiscountPercentageUseCase(
      new MongoDiscountRepository(mongoClient, updateDiscountPercentageUseCaseLogger),
      updateDiscountPercentageUseCaseLogger,
      new ExternalNotificationService()
    )

    const api = new ExpressApi(
      createUserUseCase,
      updateDiscountPercentageUseCase,
      new GoogleWinstonLogger(EXPRESS_API_LOGGER),
      new TrazableAuth(new AxiosHttp(), Config.AUTH_URL)
    )
    api.start(Config.PORT || '8080')

    const googlePubSub = new GooglePubSub(
      Config.GCLOUD_PROJECT_ID || '',
      giveWelcomeDiscountToNewUserUseCase,
      new GoogleWinstonLogger(PUBSUB_LOGGER)
    )
    await googlePubSub.startSubscriptions()
  }
})()
