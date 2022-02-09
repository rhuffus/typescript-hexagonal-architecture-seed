import { INotification } from '@ports/notification'

export class ExternalNotificationService implements INotification {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notify(userId: string, message: string): Promise<string> {
    return Promise.resolve('')
  }
}
