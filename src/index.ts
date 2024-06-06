import http from 'http';
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

  // start dummy server to bind DO port
  if (config.managedApp) {
    const host = process.env.HOST || '0.0.0.0';
    const port = (process.env.PORT && Number(process.env.PORT)) || 8080;
    const server = http.createServer((req, res) => res.end());
    server.listen(port, host, () => console.log(`Server running on ${host}:${port}...\n`));
  }
};

main();
