export default function sendSMS(title, message) {
    try {
        if ((process.env.ENABLE_SMS && process.env.ENABLE_SMS.toLowerCase()) === 'true') {
        }
    }
    catch (ex) {
        console.log('Error Sending Email: ', ex);
    }
}
;
