import { randomBytes, pbkdf2 } from "node:crypto";

const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    const iterations = 100000;
    const keyLength = 64;
    const digest = "sha512";
    pbkdf2(password, salt, iterations, keyLength, digest, (err, derivedKey) => {
      if (err) return reject(err);
      const hashedPassword = `${salt}:${derivedKey.toString("hex")}`;
      resolve(hashedPassword);
    });
  });
};

export { hashPassword };
