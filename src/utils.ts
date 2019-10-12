import * as Message from "actions/message";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function report(e: any) {
  Message.Mentors.reportError(e);
  console.error(e);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handle<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return function(...args: T) {
    try {
      return fn(...args).catch(report);
    } catch (e) {
      report(e);
    }
    return Promise.resolve(null);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function swallow<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return function(...args: T) {
    fn(...args);
    return;
  };
}
