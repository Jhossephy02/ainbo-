const nodemailer = require("nodemailer");

// crea el transporte SHTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// funcion para enviar el restablecimiento de contraseña
const sendPassword = (async (to, resetUrl) => {
    try {
        const mailOptions = {
            from: process.SMTP_USER,
            to: to,
            subject: "Restablecimiento de contraseña",
            html: `<b>Solicitaste el restablecimiento de contraseña?</b>
            <p>Haz click en el siguiente enlace para restablecer tu contraseña</p>
            <a href="${resetUrl}" target= "_blank" >Restablecer contraseña</a>
            <p>Este enlace expira en una 1 hora</p>
            <p>Si no fuiste tu ignoralo</p>

            `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente", info.messageId);
        return true;

    } catch (err) {
        console.error("Error al enviar el correo", err);
    }
});

module.exports = {
  transporter,
  sendPassword
}