import crypto from 'crypto';

//generating a random token using the random bytes from crypto
export const createRandomBytes: any = () =>
   new Promise((resolve, reject) => {
      crypto.randomBytes(37, (err, buff) => {
         if (err) {
            reject(err);
         } else {
            const token = buff.toString('hex');
            resolve(token);
         }
      });
   });
