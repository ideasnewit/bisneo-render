import nodemailer from "nodemailer";
export default function sendEmail(subject, html) {
    try {
        if ((process.env.ENABLE_EMAIL && process.env.ENABLE_EMAIL.toLowerCase()) === 'true') {
            var transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    // pass: process.env.EMAIL_PASSWORD,
                    clientId: process.env.EMAIL_CLIENT_ID,
                    clientSecret: process.env.EMAIL_CLIENT_SECRETE,
                    refreshToken: process.env.EMAIL_REFRESH_TOKEN
                }
            });
            var mailOptions = {
                from: process.env.EMAIL_FROM,
                to: process.env.EMAIL_TO,
                subject: subject,
                html
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('Error Sending Email: ', error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    }
    catch (ex) {
        console.log('Error Sending Email: ', ex);
    }
}
;
