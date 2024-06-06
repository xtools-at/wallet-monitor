export const DEBUG = process.env.DEBUG && Number(process.env.DEBUG) === 1;

export const log = (msg: string, force?: boolean) => {
  if (DEBUG || force) console.log(msg);
};

export const wait = async (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const round = (num: number, decimals: number) => {
  const p = Math.pow(10, decimals);
  return Math.round(num * p) / p;
};
