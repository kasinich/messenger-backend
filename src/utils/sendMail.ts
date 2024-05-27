import nodemailer from "nodemailer";

export default (email: any, confirm_hash: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bluestaks457@gmail.com",
      pass: "mnjn brpm thho cyqi",
    },
  });

  const mailOptions = {
    from: "bluestaks457@gmail.com",
    to: email,
    subject: "Авторизация на мессенджер",
    html: `
        <h1>Здравствуйте</h1>
        <a href="http://localhost:3000/singup/verify?hash=${confirm_hash}">Ссылка на подтверждение аккаунта</a>
    `
  };  

  const send = () => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error,info) => {
            if (error) {
                reject(error)
            }
            resolve(info)
        })
    })
  }

  return send()
};
