export interface INotification {
  notify(userId: string, message: string): Promise<string>
}
