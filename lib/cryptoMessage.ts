import crypto from 'crypto';

const MSG_KEY = Buffer.from(process.env.MSG_KEY!, 'hex'); // 32 bytes/64 hex

export function encryptMessage(content: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MSG_KEY, iv);
  const ct = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return (
    iv.toString('hex') + ':' + tag.toString('hex') + ':' + ct.toString('hex')
  );
}

export function decryptMessage(payload: string): string {
  const [ivHex, tagHex, ctHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const ct = Buffer.from(ctHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', MSG_KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ct, undefined, 'utf8') + decipher.final('utf8');
}
