const Sib = require('sib-api-v3-sdk')
console.log('Send mail');
const client = Sib.ApiClient.instance
const MyapiKey = client.authentications['api-key']
MyapiKey.apiKey = process.env.EMAIL_API_KEY;

async function SendMail(sender, email, subject, content, attachmentContent) {
    const tranEmailApi = new Sib.TransactionalEmailsApi()

    const receivers = [
        {
            email: email
        }
    ]

   await tranEmailApi
        .sendTransacEmail({
            sender,
            to: receivers,
            subject: subject,
            htmlContent: `${content}`,
            attachment: attachmentContent
        })
        .then(console.log)
        .catch(console.log)
}

module.exports = SendMail;