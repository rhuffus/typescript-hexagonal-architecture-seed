import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CreateUserUseCase } from '@use-cases/createUser'
import { ManageError } from '@adapters/primary/rest/express/manage-error'

export class UserController {
  private readonly createUserUseCase: CreateUserUseCase

  constructor(createUserUseCase: CreateUserUseCase) {
    this.createUserUseCase = createUserUseCase
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const user = req.body
    try {
      this.createUserUseCase.logger.setCorrelationId(req.headers?.['correlation-id'])
      await this.createUserUseCase.execute(user)
      res.status(StatusCodes.CREATED).end()
    } catch (error) {
      ManageError(error, res, this.createUserUseCase.logger)
    }
  }
}
