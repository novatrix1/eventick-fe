// generateQRCode.js
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// ID du ticket à transformer en QR code
const ticketId = 'ticket-1755664819103-ahm5dwyl6';

// Chemin de sortie pour l'image PNG
const outputPath = path.join(__dirname, `${ticketId}.png`);

QRCode.toFile(outputPath, ticketId, {
  color: {
    dark: '#000000',  // couleur du QR code
    light: '#FFFFFF'  // couleur de fond
  },
  width: 300 // largeur de l'image
}, function (err) {
  if (err) {
    console.error('Erreur lors de la génération du QR code:', err);
  } else {
    console.log(`QR code généré avec succès : ${outputPath}`);
  }
});
