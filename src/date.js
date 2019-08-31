const start = new Date("2019-09-13T21:00:00-0400");
const end = new Date("2019-09-15T12:00:00-0400");

const runnable = () => {
  const date = new Date();
  const output = start <= date && date <= end;
  if (!output) {
    console.log(`${start} <= ${date} && ${date} <= ${end} is false, not running`);
  }
  return output;
};

const interval = (fn, ms) => setInterval(() => {
  if (new Date() <= end) fn();
}, ms);

module.exports = {runnable, interval};