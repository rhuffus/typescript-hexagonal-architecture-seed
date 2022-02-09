import expect from 'expect'
import sinon, { SinonFakeTimers } from 'sinon'
import { CreateUserUseCase } from '@use-cases/createUser'
import { FakeUserRepository } from '@mocks/repositories/user.repository'
import { FakeIdGenerator } from '@mocks/ports/id-generator'
import { FakeQueue } from '@mocks/ports/queue'
import { FakeLogger } from '@mocks/ports/logger'
import { FakeNotification } from '@mocks/ports/notification'
import { AlreadyExistsError } from '@exceptions/already-exists'
import { PropertyRequiredError } from '@exceptions/property-required'

describe('create user use-case', () => {
  const now = new Date('2000-01-01')
  let clock: SinonFakeTimers
  let fakeUserRepositoryGetByEmail: any
  let fakeUserRepositorySave: any
  let fakeIdGenerator: any
  let fakeQueue: any
  let fakeLogger: any
  let fakeNotification: any
  let createUserUseCase: CreateUserUseCase
  const userInput = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '666 666 666',
    email: 'john.doe@example.com',
    password: 'mysecretpassword',
  }

  const userOutput = {
    _id: '123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '666 666 666',
    email: 'john.doe@example.com',
    password: 'mysecretpassword',
    createdAt: new Date('2000-01-01'),
    updatedAt: new Date('2000-01-01'),
  }

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime())
    fakeUserRepositoryGetByEmail = sinon.stub(FakeUserRepository.prototype, 'getByEmail')
    fakeUserRepositorySave = sinon.stub(FakeUserRepository.prototype, 'save')
    fakeIdGenerator = sinon.stub(FakeIdGenerator.prototype, 'generate')
    fakeQueue = sinon.stub(FakeQueue.prototype, 'publish')
    fakeLogger = sinon.stub(FakeLogger.prototype, 'info')
    fakeNotification = sinon.stub(FakeNotification.prototype, 'notify')
    createUserUseCase = new CreateUserUseCase(
      new FakeUserRepository(),
      new FakeLogger(),
      new FakeIdGenerator(),
      new FakeQueue(),
      new FakeNotification()
    )
  })

  afterEach(() => {
    clock.restore()
    fakeUserRepositoryGetByEmail.restore()
    fakeUserRepositorySave.restore()
    fakeIdGenerator.restore()
    fakeQueue.restore()
    fakeLogger.restore()
    fakeNotification.restore()
  })

  it('should create a new user successfully', async () => {
    fakeIdGenerator.restore()
    fakeIdGenerator = sinon.stub(FakeIdGenerator.prototype, 'generate').returns('123')
    const result = await createUserUseCase.execute({ ...userInput })
    expect({ ...result }).toStrictEqual({ ...userOutput })
  })

  it('should throw PropertyRequiredError if firstName is not provided', async () => {
    const { lastName, phone, email, password } = userInput
    await testNotProvidedProperty('firstName', { firstName: '', lastName, phone, email, password })
  })

  it('should throw PropertyRequiredError if lastName is not provided', async () => {
    const { firstName, phone, email, password } = userInput
    await testNotProvidedProperty('lastName', { lastName: '', firstName, phone, email, password })
  })

  it('should throw PropertyRequiredError if email is not provided', async () => {
    const { lastName, phone, firstName, password } = userInput
    await testNotProvidedProperty('email', { email: '', lastName, phone, firstName, password })
  })

  it('should throw PropertyRequiredError if password is not provided', async () => {
    const { lastName, phone, email, firstName } = userInput
    await testNotProvidedProperty('password', { password: '', lastName, phone, email, firstName })
  })

  it('should throw AlreadyExistsError if other user exists with same email', async () => {
    fakeUserRepositoryGetByEmail.restore()
    fakeUserRepositoryGetByEmail = sinon
      .stub(FakeUserRepository.prototype, 'getByEmail')
      .returns(Promise.resolve(userOutput))
    try {
      await createUserUseCase.execute(userInput)
    } catch (error) {
      expect(error).toBeInstanceOf(AlreadyExistsError)
    }
  })

  async function testNotProvidedProperty(
    notProvideProperty: string,
    userData: {
      firstName: string
      lastName: string
      phone: string
      email: string
      password: string
    }
  ) {
    try {
      await createUserUseCase.execute(userData)
    } catch (error) {
      expect(error).toBeInstanceOf(PropertyRequiredError)
      expect(error.message).toEqual(`Property '${notProvideProperty}' is required`)
    }
  }
})
