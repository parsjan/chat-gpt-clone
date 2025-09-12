// PDF Generation Script
// This script converts the markdown documentation to PDF format

const fs = require("fs")
const path = require("path")

async function generatePDF() {
  try {
    // Check if puppeteer is available
    let puppeteer
    try {
      puppeteer = require("puppeteer")
    } catch (error) {
      console.log("Installing puppeteer for PDF generation...")
      const { execSync } = require("child_process")
      execSync("npm install puppeteer", { stdio: "inherit" })
      puppeteer = require("puppeteer")
    }

    // Read the markdown file
    const markdownPath = path.join(__dirname, "../docs/TECHNICAL_DOCUMENTATION.md")
    const markdownContent = fs.readFileSync(markdownPath, "utf8")

    // Convert markdown to HTML
    let marked
    try {
      marked = require("marked")
    } catch (error) {
      console.log("Installing marked for markdown parsing...")
      const { execSync } = require("child_process")
      execSync("npm install marked", { stdio: "inherit" })
      marked = require("marked")
    }

    const htmlContent = marked.parse(markdownContent)

    // Create styled HTML document
    const styledHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>ChatGPT Clone - Technical Documentation</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #2563eb;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 10px;
            }
            h2 {
                color: #1e40af;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 5px;
                margin-top: 30px;
            }
            h3 {
                color: #1e3a8a;
                margin-top: 25px;
            }
            code {
                background-color: #f3f4f6;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.9em;
            }
            pre {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 15px;
                overflow-x: auto;
                margin: 15px 0;
            }
            pre code {
                background: none;
                padding: 0;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 15px 0;
            }
            th, td {
                border: 1px solid #e2e8f0;
                padding: 8px 12px;
                text-align: left;
            }
            th {
                background-color: #f8fafc;
                font-weight: 600;
            }
            blockquote {
                border-left: 4px solid #2563eb;
                margin: 15px 0;
                padding-left: 15px;
                color: #64748b;
            }
            .toc {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
            }
            .toc h2 {
                margin-top: 0;
                border-bottom: none;
            }
            .page-break {
                page-break-before: always;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 15px;
                }
                .page-break {
                    page-break-before: always;
                }
            }
        </style>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>
    `

    // Launch puppeteer and generate PDF
    console.log("Launching browser for PDF generation...")
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()
    await page.setContent(styledHTML, { waitUntil: "networkidle0" })

    // Generate PDF
    const pdfPath = path.join(__dirname, "../docs/ChatGPT_Clone_Technical_Documentation.pdf")

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          ChatGPT Clone - Technical Documentation
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    })

    await browser.close()

    console.log(`✅ PDF generated successfully: ${pdfPath}`)
    console.log(`📄 File size: ${(fs.statSync(pdfPath).size / 1024 / 1024).toFixed(2)} MB`)
  } catch (error) {
    console.error("❌ Error generating PDF:", error)
    process.exit(1)
  }
}

// Run the PDF generation
generatePDF()
