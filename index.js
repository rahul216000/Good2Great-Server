const express = require('express');
const app = express();
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const fs = require('fs');
const pdf = require("pdf-creator-node");
const crypto = require('crypto');


dotenv.config({ path: './config.env' });

app.use(cors({
    origin: [
        // 'http://127.0.0.1:5500',
        'https://good2great.netlify.app',
    ]
}));

const SendEmailModel = require("./Messages/SendEmail")
app.use(express.json())

app.get("/", async (req, res) => {
    res.send("Running")
})

app.post("/request-quote", async (req, res) => {

    try {

        let {email, ValuesArr} = req.body;

        let ProcessID = generateSecureString()
        let GeneratePdf = await BuildPdf(ProcessID, ValuesArr)
        await SendEmailWithAttachment(email, ProcessID)
        await DeleteReportPDF(ProcessID)

        res.send("Sent")

    } catch (error) {
        console.log(error);
        res.send("Error")
    }


})


async function SendEmailWithAttachment(email, ProcessID) {

    const sender = {
        email: 'info@good2great.marketing',
        name: `Report - Good2Great`,
    }

    let attachmentContent = fs.readFileSync(`./Reports/${ProcessID}.pdf`).toString('base64');
    attachmentContent = [{ content: attachmentContent, name: 'Report.pdf' }];

    let content = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .email-container {
      width: 100%;
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #6252CE;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      color: #6252CE;
      font-size: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
    }
    .report-section {
      margin-top: 20px;
      padding: 10px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .report-section h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    .footer {
      background-color: #f1f1f1;
      text-align: center;
      padding: 10px;
      font-size: 14px;
      color: #888;
    }
    .footer a {
      color: #6252CE;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Your Report is Ready</h1>
    </div>
    <div class="content">
      <h2>Hello,</h2>
      <p>
        We are pleased to inform you that your report is now ready. You can find the details below.
      </p>
      <div class="report-section">
        <h3>Report</h3>
        <p>
          You can find your Report in attachment.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>
        If you have any questions, feel free to contact us</a>.
      </p>
      <p>
      Copyright © 2024 GOOD2GREATMARKETING
      </p>
    </div>
  </div>
</body>
</html>
`
    await SendEmailModel(sender, email, `Your Report from Good2Great is here`, content, attachmentContent)
    await SendEmailModel(sender, "rahul.rastogi.216000@gmail.com", `Your Report from Good2Great is here`, content, attachmentContent)

}

async function BuildPdf(ProcessID, ValuesArr) {

    var html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stylish Web Page</title>
    <style>
        :root {
    --purple: #6454d0;
    --pink:#DD7AA2;
    --blue:#20194D;
}

.text-center {
    text-align: center !important;
}

.mb-3 {
    margin-bottom: 1rem !important;
}

.mb-4 {
    margin-bottom: 1.5rem !important;
}

.mb-2 {
    margin-bottom: 0.5rem !important;
}

.mt-4 {
    margin-top: 1.5rem !important;
}

.mt-2 {
    margin-top: 0.5rem !important;
}

.mt-3 {
    margin-top: 1rem !important;
}

.mt-5 {
    margin-top: 2rem !important;
}

.inputBox {
    width: 100%;
    border: 2px solid var(--blue);
    margin: 3px;
    padding: 8px !important;
    padding-left: 10px !important;
    border-radius: 8px;
    font-size: 18px;
    background: white;
    color: var(--purple);
    cursor: pointer;
}

.MainBox{
    border: 2px solid #f2f5f9;
    width: 55%;
    margin-right: 20%;
    margin-left: 20%;
    text-align: center;
    border: 2px solid var(--white);
    padding: 3%;
    border-radius: 10px;
    background-color: var(--white);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);

}

.DivHeadings {
    font-size: 18px;
    margin: 3px;
    padding: 5px;
    font-weight: 700;
    padding-left: 2px;
    color: var(--blue);
}

.TextHeading{
    font-size: 1.5rem;
    margin: 3px;
    padding: 5px;
    font-weight: 700;
    padding-left: 2px;
    color: var(--blue);
}

.center {
    display: flex;
    justify-content: center;
}

.tableOnly{
    display: inline-block;
    text-align: center;
    justify-content: center;
}

.calculator-table {
    border-collapse: collapse;
    margin-bottom: 20px;
    background: #6252CE;
    border-radius: 8px
}

.calculator-table td {
    font-size: 19px;
    text-align: center;
    border: 1px solid #ddd;
    padding: 18px;
    color: white;
}

.btn {
    border: 2px solid;
    background: linear-gradient(207deg, #6252CE 0%, #DD7AA2 100%);
    color: var(--pink);
    padding: 10px 20px;
    font-size: 25px;
    font-weight: bold;
    border-radius: 8px;
    width: 100%;
    cursor: pointer;
}

.btn-outline-secondary {
    border-color: linear-gradient(207deg, #6252CE 0%, #DD7AA2 100%);
    color: white;
}

.btn-outline-secondary:hover {
    background: linear-gradient(207deg, var(--pink) 0%, var(--purple) 100%);
    color: white;
}

.btn-center {
    text-align: center;
}

.ResultHeadings {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    color: var(--blue);
    box-shadow: 0 0px 0px 0 var(--blue), 0 3px 2px 0 var(--blue);
    border: 2px solid;
    padding: 10px;
    border-radius: 13px;
}

.selectBox{
    text-align: center;
}

@media only screen and (max-width: 530px) {
    .MainBox{
        width: 86%;
        margin-right: 0px;
        margin-left: 0px;
        padding-left: 7%;
        padding-right: 7%;
    }

    .calculator-table td {
        padding: 8px;
    }
}
    </style>
</head>
<body>



    <div class="MainBox d-none" id="LastYearDataBlock">

        <div class="center ResultHeadings mt-1">
            Your Last Year’s Data
        </div>

        <div class="tableOnly mt-5">
            <table class="calculator-table" id="1stTable"><tbody>

    <tr>
        <td>Net Profit Last Year</td>
        <td>${ValuesArr[0]}</td>
    </tr>

    <tr>
        <td>Average Revenue per Client Last Year</td>
        <td>${ValuesArr[1]}</td>
    </tr>

    <tr>
        <td>Net Profit per Client Last Year</td>
        <td>${ValuesArr[2]}</td>
    </tr>



</tbody></table>
        </div>

    </div>


    <div class="MainBox mt-3 d-none" id="ResultBlock" style="display: block;">

        <div class="center ResultHeadings mt-1">
            You can get
        </div>

        <div class="tableOnly mt-5 mb-2">
            <table class="calculator-table" id="2ndTable">
    <tbody>

                    <tr>
                        <td>Number of new clients</td>
                        <td>${ValuesArr[3]}</td>
                    </tr>

                    <tr>
                        <td>Net Profit per New Client</td>
                        <td>${ValuesArr[4]}</td>
                    </tr>

                    <tr>
                        <td>New Clients Contribution</td>
                        <td>${ValuesArr[5]}</td>
                    </tr>

                    <tr>
                        <td>Projected Net Profit This Year</td>
                        <td>${ValuesArr[6]}</td>
                    </tr>



                </tbody></table>

        </div>

        <div class="center ResultHeadings mt-5">
            Conclusion
        </div>

        <div class="tableOnly mt-5">
            <table class="calculator-table" id="3rdTable">
    <tbody>

                    <tr>
                        <td>Last year, you invested in attracting new clients </td>
                        <td>${ValuesArr[7]}</td>
                    </tr>

                    <tr>
                        <td>and the cost of getting that client was</td>
                        <td>${ValuesArr[8]}</td>
                    </tr>

                    <tr>
                        <td>with that, your net profit was</td>
                        <td>${ValuesArr[9]}</td>
                    </tr>


                </tbody></table>

        </div>

        <div class="TextHeading">
            But....
        </div>

        <div class="tableOnly mt-2">
            <table class="calculator-table" id="4thTable">
    <tbody>

                    <tr>
                        <td>if you invest</td>
                        <td>${ValuesArr[10]}</td>
                    </tr>

                    <tr>
                        <td>You can earn approximately</td>
                        <td>${ValuesArr[11]}</td>
                    </tr>

                    <tr>
                        <td>Which means that you might earn</td>
                        <td>${ValuesArr[12]}</td>
                    </tr>

                    <tr>
                        <td>more, only by investing </td>
                        <td>${ValuesArr[13]}</td>
                    </tr>

                    <tr>
                        <td>in our</td>
                        <td>${ValuesArr[14]}</td>
                    </tr>

                </tbody></table>

        </div>

    </div>


</body>
</html>
`
    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
    };

    var users = [
        {
            name: "Shyam",
            age: "26",
        }
    ];

    var document = {
        html: html,
        data: {
            users: users,
        },
        path: `./Reports/${ProcessID}.pdf`,
        type: "",
    };

    await pdf.create(document, options)

}

async function DeleteReportPDF(ProcessID){
    fs.unlinkSync(`./Reports/${ProcessID}.pdf`);
}

function generateSecureString(length = 32) {
    const buffer = crypto.randomBytes(length);
    return buffer.toString('hex').slice(0, length);
}


app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    } else {
        console.log('Server not started ' + error);
    }

});