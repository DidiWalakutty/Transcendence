export const APP_EVENTS = {
  userCreated: 'user.created',
  registrationCreated: 'registration.created',
  eventModified: 'event.modified',
  eventCancelled: 'event.cancelled',
  passwordResetRequested: 'password.reset.requested',
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

export function emitAppEvent(event: string, payload: unknown): boolean {
  return process.emit(event as never, payload as never);
}

export function onAppEvent(event: string, listener: (...args: never[]) => void): void {
  process.on(event as never, listener as never);
}

export function offAppEvent(event: string, listener: (...args: never[]) => void): void {
  process.off(event as never, listener as never);
}
