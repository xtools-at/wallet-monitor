import cron from 'node-cron';
import { config } from './config';
import { handler } from './handler';
import { log } from './utils/utils';

const main = () => {
  log(`Starting wallet balance monitor, cron interval: ${config.cronSchedule}\n`, true);
  // start cronjob
  cron.schedule(config.cronSchedule, () => {
    handler();
  });
};

main();
