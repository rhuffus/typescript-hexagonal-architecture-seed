/* eslint-disable @typescript-eslint/no-unused-vars */

import { INotification } from '@ports/notification'

export class FakeNotification implements INotification {
  notify(userId: string, message: string): Promise<string> {
    return Promise.resolve('')
  }
}
