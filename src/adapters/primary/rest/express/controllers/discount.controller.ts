import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { UpdateDiscountPercentageUseCase } from '@use-cases/updateDiscountPercentage'
import { ManageError } from '@adapters/primary/rest/express/manage-error'

export class DiscountController {
  private readonly updateDiscountPercentageUseCase: UpdateDiscountPercentageUseCase

  constructor(updateDiscountPercentageUseCase: UpdateDiscountPercentageUseCase) {
    this.updateDiscountPercentageUseCase = updateDiscountPercentageUseCase
  }

  updatePercentage = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    const { percentage } = req.body
    try {
      this.updateDiscountPercentageUseCase.logger.setCorrelationId(req.headers?.['correlation-id'])
      await this.updateDiscountPercentageUseCase.execute(id, percentage)
      res.status(StatusCodes.OK).end()
    } catch (error) {
      ManageError(error, res, this.updateDiscountPercentageUseCase.logger)
    }
  }
}
