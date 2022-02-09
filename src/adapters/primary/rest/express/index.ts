import express, { Express } from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import { StatusCodes } from 'http-status-codes'
import { CreateUserUseCase } from '@use-cases/createUser'
import { UpdateDiscountPercentageUseCase } from '@use-cases/updateDiscountPercentage'
import { ILogger } from '@ports/logger'
import { IAuth } from '@ports/auth'
import { DiscountController } from '@adapters/primary/rest/express/controllers/discount.controller'
import { AuthenticationMiddleware } from '@adapters/primary/rest/express/middlewares/authentication'
import { UserController } from '@adapters/primary/rest/express/controllers/user.controller'

/*
 * Express configuration
 */
export class ExpressApi {
  private readonly CreateUserUseCaseUseCase: CreateUserUseCase
  private readonly updateDiscountPercentageUseCase: UpdateDiscountPercentageUseCase
  private readonly logger: ILogger
  private readonly app: Express
  private readonly auth: IAuth
  private readonly authMiddleware: AuthenticationMiddleware

  constructor(
    CreateUserUseCaseUseCase: CreateUserUseCase,
    updateDiscountPercentageUseCase: UpdateDiscountPercentageUseCase,
    logger: ILogger,
    auth: IAuth
  ) {
    this.CreateUserUseCaseUseCase = CreateUserUseCaseUseCase
    this.updateDiscountPercentageUseCase = updateDiscountPercentageUseCase
    this.auth = auth
    this.logger = logger
    this.app = express()
    this.authMiddleware = new AuthenticationMiddleware(this.auth)
    this.serverConfiguration()
    this.setupRoutes()
  }

  /**
   * Start the express server api
   *
   * @param port - Public port on serve the api
   */
  start(port: string): void {
    this.app.listen(port, () => {
      this.logger.info(`App listening on port ${port} `)
    })
  }

  /**
   * Setup server configuration middlewares
   */
  private serverConfiguration(): void {
    this.app.use(express.json())
    this.app.use(helmet())
    this.app.use(
      morgan('combined', {
        stream: {
          write: text => {
            this.logger.info(text)
          },
        },
      })
    )
  }

  /**
   * Setup server routes
   */
  private setupRoutes() {
    const router = express.Router()

    // Ping route
    router.route('/ping').get((req, res) => {
      res.status(StatusCodes.OK).end()
    })

    const userController = new UserController(this.CreateUserUseCaseUseCase)
    router.route('/user').post(userController.create)

    const discountController = new DiscountController(this.updateDiscountPercentageUseCase)
    router.route('/discount/:id').put(discountController.updatePercentage)

    this.app.use(router)
  }
}
