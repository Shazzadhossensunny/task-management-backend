// import nodemailer from 'nodemailer';
// import config from '../config';

// export const sendResetEmail = async (to: string, html: string) => {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com.',
//     port: 587,
//     secure: config.NODE_ENV === 'production',
//     auth: {
//       user: config.smtp_user,
//       pass: config.smtp_pas,
//     },
//   });

//   await transporter.sendMail({
//     from: 'shazzadhossensunny@gamil.com', // sender address
//     to, // list of receivers
//     subject: 'Reset your password within ten mins!', // Subject line
//     text: '', // plain text body
//     html, // html body
//   });
// };

// email.ts
import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'shazzadhossensunny@gmail.com',
      pass: 'slwi xamj jkkp boiw', // Use App Password, not your Gmail password
    },
  });

  await transporter.sendMail({
    from: '"TaskMaster" <shazzadhossensunny@gmail.com>',
    to,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You've requested to reset your password for your TaskMaster account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
            style="display: inline-block; padding: 12px 24px; background-color: #60E5AE; color: white;
                   text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777;">
          This link will expire in 10 minutes for security reasons.
        </p>
      </div>
    `,
  });
};
