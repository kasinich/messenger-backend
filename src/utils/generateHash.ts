import bcrypt from "bcrypt";

export default (data: string | number = "") => {
  const dataString = String(data);
  return new Promise((resolve, reject) => {
    bcrypt.hash(dataString, 10, function (err, hash: string) {
      if (err) return reject(err);

      resolve(hash);
    });
  });
};
