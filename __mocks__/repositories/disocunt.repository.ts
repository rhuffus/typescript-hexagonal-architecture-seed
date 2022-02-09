/* eslint-disable @typescript-eslint/no-unused-vars */
import { Optional } from '@common/types/optional'
import { IDiscountRepository } from '@repositories/discount.repository'
import { Discount } from '@entities/discount'

export class FakeDiscountRepository implements IDiscountRepository {
  getById(id: string): Promise<Optional<Discount>> {
    return Promise.resolve(undefined)
  }

  save(discount: Discount): Promise<void> {
    return Promise.resolve(undefined)
  }

  update(discount: Discount): Promise<void> {
    return Promise.resolve(undefined)
  }
}
