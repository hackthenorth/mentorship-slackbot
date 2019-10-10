const start = new Date("2019-09-13T21:00:00-0400");
const end = new Date("2019-09-15T12:00:00-0400");

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
