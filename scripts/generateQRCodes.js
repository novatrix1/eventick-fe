const fs = require("fs");
const QRCode = require("qrcode");
const path = require("path");

const dbFile = path.join(__dirname, "../qrcodes.json");
const qrFolder = path.join(__dirname, "../qrcodes");

if (!fs.existsSync(qrFolder)) fs.mkdirSync(qrFolder);

async function generateQRCodes(count = 5) {
  let codes = [];
  if (fs.existsSync(dbFile)) {
    codes = JSON.parse(fs.readFileSync(dbFile));
  }

  for (let i = 0; i < count; i++) {
    const codeValue = `ticket-${Date.now()}-${i}`;
    const qrImagePath = path.join(qrFolder, `${codeValue}.png`);

    await QRCode.toFile(qrImagePath, codeValue);

    codes.push({ id: codeValue, used: false, file: qrImagePath });
  }

  fs.writeFileSync(dbFile, JSON.stringify(codes, null, 2));
  console.log(`${count} QR Codes générés ✅`);
}

generateQRCodes(5);
