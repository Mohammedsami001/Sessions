const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimize() {
  const publicDir = path.join(__dirname, 'public');
  
  await sharp(path.join(publicDir, 'study_login_bg.png'))
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(path.join(publicDir, 'study_login_bg.webp'));
    
  console.log('Optimized login bg');

  await sharp(path.join(publicDir, 'study_signup_bg.png'))
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(path.join(publicDir, 'study_signup_bg.webp'));
    
  console.log('Optimized signup bg');
}

optimize().catch(console.error);
