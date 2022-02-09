import expect from 'expect'
import sinon, { SinonFakeTimers } from 'sinon'
import { FakeIdGenerator } from '@mocks/ports/id-generator'
import { FakeQueue } from '@mocks/ports/queue'
import { FakeLogger } from '@mocks/ports/logger'
import { FakeNotification } from '@mocks/ports/notification'
import { FakeDiscountRepository } from '@mocks/repositories/disocunt.repository'
import { UpdateDiscountPercentageUseCase } from '@use-cases/updateDiscountPercentage/index'
import { Discount } from '@entities/discount'
import { NotFoundError } from '@exceptions/not-found'
import { Config } from '@app/config'

describe('update discount percentage use-case', () => {
  const now = new Date('2000-01-01')
  let clock: SinonFakeTimers
  let fakeDiscountRepositoryUpdate: any
  let fakeDiscountRepositoryGetById: any
  let fakeIdGenerator: any
  let fakeQueue: any
  let fakeLogger: any
  let fakeNotification: any
  let updateDiscountPercentageUseCase: UpdateDiscountPercentageUseCase
  const discountInput = {
    userId: 'DlDZjzleJ2SMFJugqitGY',
    percentage: 20.33,
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
    fakeDiscountRepositoryUpdate = sinon.stub(FakeDiscountRepository.prototype, 'update')
    fakeDiscountRepositoryGetById = sinon.stub(FakeDiscountRepository.prototype, 'getById')
    fakeIdGenerator = sinon.stub(FakeIdGenerator.prototype, 'generate')
    fakeQueue = sinon.stub(FakeQueue.prototype, 'publish')
    fakeLogger = sinon.stub(FakeLogger.prototype, 'info')
    fakeNotification = sinon.stub(FakeNotification.prototype, 'notify')
    updateDiscountPercentageUseCase = new UpdateDiscountPercentageUseCase(
      new FakeDiscountRepository(),
      new FakeLogger(),
      new FakeNotification()
    )
  })

  afterEach(() => {
    clock.restore()
    fakeDiscountRepositoryUpdate.restore()
    fakeDiscountRepositoryGetById.restore()
    fakeIdGenerator.restore()
    fakeQueue.restore()
    fakeLogger.restore()
    fakeNotification.restore()
  })

  it('should update an existing discount', async () => {
    fakeDiscountRepositoryUpdate.restore()
    fakeDiscountRepositoryUpdate = sinon
      .stub(FakeDiscountRepository.prototype, 'update')
      .returns(Promise.resolve(undefined))
    fakeDiscountRepositoryGetById.restore()
    fakeDiscountRepositoryGetById = sinon
      .stub(FakeDiscountRepository.prototype, 'getById')
      .returns(Promise.resolve(new Discount(discountOutput)))
    const result = await updateDiscountPercentageUseCase.execute(discountInput.userId, discountInput.percentage)
    expect(result).toBeUndefined()
  })

  it('should throw NotFoundError if discount is not found', async () => {
    fakeDiscountRepositoryUpdate.restore()
    fakeDiscountRepositoryUpdate = sinon
      .stub(FakeDiscountRepository.prototype, 'update')
      .returns(Promise.resolve(undefined))
    try {
      await updateDiscountPercentageUseCase.execute(discountInput.userId, discountInput.percentage)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError)
    }
  })
})
