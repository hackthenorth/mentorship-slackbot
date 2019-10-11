import config from "config";

const start = new Date(config.EVENT_START);
const end = new Date(config.EVENT_END);

export const runnable = () => {
  const date = new Date();
  const output = start <= date && date <= end;
  if (!output) {
    console.log(
      `${start} <= ${date} && ${date} <= ${end} is false, not running`
    );
  }
  return output;
};

export const interval = (fn: () => void, ms: number) =>
  setInterval(() => {
    if (new Date() <= end) fn();
  }, ms);
