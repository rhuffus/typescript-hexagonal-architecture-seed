export interface IUser {
  _id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
  updatedAt: Date
  readonly createdAt: Date
}

interface IIdentifiedDomainObject {
  readonly _id: string
}

export class User implements IUser, IIdentifiedDomainObject {
  readonly _id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
  updatedAt: Date
  readonly createdAt: Date

  constructor({ _id, firstName, lastName, phone, email, password, updatedAt, createdAt }: IUser) {
    this._id = _id
    this.firstName = firstName
    this.lastName = lastName
    this.phone = phone
    this.email = email
    this.password = password
    this.updatedAt = updatedAt
    this.createdAt = createdAt
  }
}
