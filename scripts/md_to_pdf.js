const fs = require('fs');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js');
const puppeteer = require('puppeteer');

async function convertMarkdownToPDF(inputFile, outputFile) {
    const mdContent = fs.readFileSync(inputFile, 'utf-8');

    const md = new MarkdownIt({
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return `<pre><code class="hljs">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
                } catch (__) { }
            }
            return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
        }
    });

    const htmlContent = md.render(mdContent);

    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; background-color: #ffffff; color: #000000; }
          h1, h2, h3 { color: #000000; }
          pre { padding: 10px; border-radius: 5px; overflow-x: auto; background-color: #f6f8fa; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({ path: outputFile, format: 'A4', printBackground: true });
    await browser.close();

    console.log(`PDF généré avec succès : ${outputFile}`);
}

// Utilisation
convertMarkdownToPDF('endpoints.md', 'endpoints-file.pdf');
