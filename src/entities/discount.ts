export interface IDiscount {
  _id: string
  userId: string
  percentage: number
  updatedAt: Date
  readonly createdAt: Date
}

export class Discount implements IDiscount {
  readonly _id: string
  userId: string
  percentage: number
  updatedAt: Date
  readonly createdAt: Date

  constructor({ _id, userId, percentage, createdAt, updatedAt }: IDiscount) {
    this._id = _id
    this.userId = userId
    this.percentage = percentage
    this.updatedAt = updatedAt
    this.createdAt = createdAt
  }

  setPercentage(percentage: number): void {
    this.percentage = percentage
  }
}
