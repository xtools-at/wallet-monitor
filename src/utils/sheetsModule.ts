import { type DataInput } from '../types';

export const pushToDb = async (data: DataInput) => {
  const webhookUrl = `${process.env.MAKE_WEBHOOK_URL}`;
  if (!webhookUrl) throw new Error('no webhook url configured');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    body: new URLSearchParams(data as any as Record<string, string>),
  });

  if (!response.ok) throw new Error(`bad webhook response: \n${await response.text()}`);
};
