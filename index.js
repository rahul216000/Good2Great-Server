const express = require('express');
const app = express();
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');
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

        let { email, ValuesArr } = req.body;

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
      background-color: #6454d0;
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
    // Send User Email to Client
    let UserEmail = `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      width: 100%;
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #0073e6;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content-block {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .content-block:last-child {
      border-bottom: none;
    }
    .content-block h2 {
      margin-top: 0;
      color: #333333;
    }
    .content-block p {
      margin: 0;
      color: #666666;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #999999;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100%;
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Good2Great</h1>
    </div>
    <div class="content-block">
      <h2>User Email</h2>
    </div>
    <div class="content-block">
      <h2>${email}</h2>
    </div>
    <div class="footer">
      <p>© 2024 Good2Great. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`
    await SendEmailModel(sender, "rahul.rastogi.216000@gmail.com", `You got a New User`, UserEmail, attachmentContent)

}

async function BuildPdf(ProcessID, ValuesArr) {

    const tables = [
        {
            title: 'Your Last Year’s Data',
            rows: [
                ['Net Profit Last Year', ValuesArr[0]],
                ['Average Revenue per Client Last Year', ValuesArr[1]],
                ['Net Profit per Client Last Year', ValuesArr[2]],
            ],
        },
        {
            title: 'You can get',
            rows: [
                ["Number of new clients", ValuesArr[3]],
                ["Net Profit per New Client", ValuesArr[4]],
                ["New Clients Contribution", ValuesArr[5]],
                ["Projected Net Profit This Year", ValuesArr[6]]
            ],
        },
        {
            title: 'Conclusion',
            rows: [
                ["Last year, you invested in attracting new clients", ValuesArr[7]],
                ["and the cost of getting that client was", ValuesArr[8]],
                ["with that, your net profit was", ValuesArr[9]]

            ],
        },
        {
            title: 'But...',
            rows: [
                ["if you invest", ValuesArr[10]],
                ["You can earn approximately", ValuesArr[11]],
                ["Which means that you might earn", ValuesArr[12]],
                ["more, only by investing", ValuesArr[13]],
                ["in our", ValuesArr[14]]

            ],
        },
    ];

    await createPDF(tables, `./Reports/${ProcessID}.pdf`)

}

async function DeleteReportPDF(ProcessID) {
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


// Function to write the PDF file
function writePDF(doc, filePath) {
    return new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
}

// Function to draw a table with a rounded border for the entire table
async function drawTable(doc, table, startX, startY) {
    const rowHeight = 30;
    const colWidth = doc.page.width / 2.2;
    const tableWidth = colWidth * 2;

    // Center the table on the page
    const pageWidth = doc.page.width;
    const centeredStartX = (pageWidth - tableWidth) / 2;

    // Draw title
    doc
        .fontSize(18)
        .fillColor('black')
        .text(table.title, centeredStartX, startY, { width: tableWidth, align: 'center' });

    startY += rowHeight;

    // Draw rows
    table.rows.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            const cellX = centeredStartX + colWidth * cellIndex;
            const cellY = startY + rowHeight * rowIndex;

            // Set background color for the cell with border radius
            doc
                .roundedRect(cellX, cellY, colWidth, rowHeight, 2)
                .fill('#6454d0')
                .stroke();

            // Draw the border of the cell with border radius
            doc
                .roundedRect(cellX, cellY, colWidth, rowHeight, 2)
                // .fill('white')
                .stroke();

            // Set white color for the text
            doc
                .fillColor('white')
                .fontSize(12)
                .text(cell, cellX + 10, cellY + 10, {
                    width: colWidth - 20,
                    align: 'center',
                });
        });
    });

    return startY + rowHeight * table.rows.length;
}

// Main function to create the PDF
async function createPDF(tables, fileAddress) {
    const doc = new PDFDocument({ margin: 50 });

    // Define table data


    // Add a title
    doc
        .fontSize(24)
        .text('Report', {
            align: 'center',
        });

    // Draw each table with spacing
    let currentY = doc.y;
    for (const table of tables) {
        currentY = await drawTable(doc, table, 50, currentY + 20);
    }

    // Finalize PDF file
    await writePDF(doc, fileAddress);
}
