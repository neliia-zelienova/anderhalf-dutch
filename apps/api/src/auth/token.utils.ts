import { randomBytes, createHash } from 'crypto';

export const generateToken = () => randomBytes(32).toString('base64url');
export const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex');
};
