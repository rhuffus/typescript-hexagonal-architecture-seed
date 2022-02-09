import { Optional } from '@common/types/optional'
import { Discount } from '@entities/discount'

export interface IDiscountRepository {
  getById(id: string): Promise<Optional<Discount>>

  save(discount: Discount): Promise<void>

  update(discount: Discount): Promise<void>
}
