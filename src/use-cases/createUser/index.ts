import { IUserRepository } from '@repositories/user.repository'
import { ILogger } from '@ports/logger'
import { IIDGenerator } from '@ports/id-generator'
import { IQueue, MessageAttributeOperation } from '@ports/queue'
import { INotification } from '@ports/notification'
import { PropertyRequiredError } from '@exceptions/property-required'
import { AlreadyExistsError } from '@exceptions/already-exists'
import { User } from '@entities/user'

export class CreateUserUseCase {
  private readonly repository: IUserRepository
  public readonly logger: ILogger
  private readonly idGenerator: IIDGenerator
  private readonly queue: IQueue
  private readonly notification: INotification

  constructor(
    repository: IUserRepository,
    logger: ILogger,
    idGenerator: IIDGenerator,
    queue: IQueue,
    notification: INotification
  ) {
    this.repository = repository
    this.logger = logger
    this.idGenerator = idGenerator
    this.queue = queue
    this.notification = notification
  }

  async execute({
    firstName,
    lastName,
    phone,
    email,
    password,
  }: {
    firstName: string
    lastName: string
    phone: string
    email: string
    password: string
  }): Promise<User> {
    this.logger.info('Creating a new user')

    if (!firstName) throw new PropertyRequiredError("Property 'firstName' is required")
    if (!lastName) throw new PropertyRequiredError("Property 'lastName' is required")
    if (!email) throw new PropertyRequiredError("Property 'email' is required")
    if (!password) throw new PropertyRequiredError("Property 'password' is required")

    const emailAlreadyExists = await this.repository.getByEmail(email)
    if (emailAlreadyExists) throw new AlreadyExistsError()

    const now = new Date()
    const newUser = new User({
      _id: this.idGenerator.generate(),
      firstName,
      lastName,
      phone,
      email,
      password,
      updatedAt: now,
      createdAt: now,
    })

    await this.repository.save(newUser)

    this.logger.info('New user created successfully')

    this.queue.publish(JSON.stringify(newUser), {
      version: '1',
      companyId: '1',
      collection: 'user',
      operation: MessageAttributeOperation.CREATE,
    })

    // This also could be implemented using a separate use-case and subscribing
    // to USER_CREATED_EVENT events. I don't have enough domain context information, so I decided to implement it
    // on this way for simplicity.
    this.notification.notify(newUser._id, 'Your account has been created successfully.')

    return newUser
  }
}
