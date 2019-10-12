import * as Message from "actions/message";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function report(e: any) {
  Message.Mentors.reportError(e);
  console.error(e);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handle<T extends any[], R>(fn: (...args: T) => Promise<R>) {
  return function(...args: T) {
    try {
      fn(...args).catch(report);
    } catch (e) {
      report(e);
    }
  };
}
