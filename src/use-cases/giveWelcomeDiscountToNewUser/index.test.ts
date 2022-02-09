import expect from 'expect'
import sinon, { SinonFakeTimers } from 'sinon'
import { FakeIdGenerator } from '@mocks/ports/id-generator'
import { FakeQueue } from '@mocks/ports/queue'
import { FakeLogger } from '@mocks/ports/logger'
import { FakeDiscountRepository } from '@mocks/repositories/disocunt.repository'
import { GiveWelcomeDiscountToNewUserUseCase } from '@use-cases/giveWelcomeDiscountToNewUser/index'
import { Config } from '@app/config'

describe('give welcome discount to new user use-case', () => {
  const now = new Date('2000-01-01')
  let clock: SinonFakeTimers
  let fakeDiscountRepositorySave: any
  let fakeIdGenerator: any
  let fakeQueue: any
  let fakeLogger: any
  let giveWelcomeDiscountToNewUserUseCase: GiveWelcomeDiscountToNewUserUseCase
  const discountInput = {
    userId: 'DlDZjzleJ2SMFJugqitGY',
    percentage: Config.WELCOME_DISCOUNT_PERCENTAGE,
  }

  const discountOutput = {
    _id: '123',
    userId: 'DlDZjzleJ2SMFJugqitGY',
    percentage: Config.WELCOME_DISCOUNT_PERCENTAGE,
    createdAt: new Date('2000-01-01'),
    updatedAt: new Date('2000-01-01'),
  }

  beforeEach(() => {
    clock = sinon.useFakeTimers(now.getTime())
    fakeDiscountRepositorySave = sinon.stub(FakeDiscountRepository.prototype, 'save')
    fakeIdGenerator = sinon.stub(FakeIdGenerator.prototype, 'generate')
    fakeQueue = sinon.stub(FakeQueue.prototype, 'publish')
    fakeLogger = sinon.stub(FakeLogger.prototype, 'info')
    giveWelcomeDiscountToNewUserUseCase = new GiveWelcomeDiscountToNewUserUseCase(
      new FakeDiscountRepository(),
      new FakeLogger(),
      new FakeIdGenerator(),
      new FakeQueue()
    )
  })

  afterEach(() => {
    clock.restore()
    fakeDiscountRepositorySave.restore()
    fakeIdGenerator.restore()
    fakeQueue.restore()
    fakeLogger.restore()
  })

  it('should create a new discount successfully', async () => {
    fakeIdGenerator.restore()
    fakeIdGenerator = sinon.stub(FakeIdGenerator.prototype, 'generate').returns('123')
    const result = await giveWelcomeDiscountToNewUserUseCase.execute({ ...discountInput })
    expect({ ...result }).toStrictEqual({ ...discountOutput })
  })
})
