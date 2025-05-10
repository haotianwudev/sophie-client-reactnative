const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ASSETS_DIR = path.join(__dirname, '../assets');
const TEMP_DIR = path.join(os.tmpdir(), 'sophie-icons');

// Ensure the output directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function resizeIcons() {
  try {
    // Get the source icon path
    const sourceIcon = path.join(ASSETS_DIR, 'icon.png');
    
    if (!fs.existsSync(sourceIcon)) {
      console.error('Source icon not found! Please place your icon.png in the assets directory.');
      return;
    }

    console.log('Starting icon resizing...');

    // 1. Main app icon (1024x1024)
    const iconTemp = path.join(TEMP_DIR, 'icon-temp.png');
    await sharp(sourceIcon)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(iconTemp);
    fs.copyFileSync(iconTemp, path.join(ASSETS_DIR, 'icon.png'));

    // 2. Adaptive icon (1024x1024 with padding)
    const adaptiveTemp = path.join(TEMP_DIR, 'adaptive-temp.png');
    await sharp(sourceIcon)
      .resize(614, 614, { // 60% of 1024 to leave padding
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 205,
        bottom: 205,
        left: 205,
        right: 205,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(adaptiveTemp);
    fs.copyFileSync(adaptiveTemp, path.join(ASSETS_DIR, 'adaptive-icon.png'));

    // 3. Splash screen icon (1242x2436)
    const splashTemp = path.join(TEMP_DIR, 'splash-temp.png');
    await sharp(sourceIcon)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 706,
        bottom: 706,
        left: 109,
        right: 109,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(splashTemp);
    fs.copyFileSync(splashTemp, path.join(ASSETS_DIR, 'splash-icon.png'));

    // 4. Favicon (196x196)
    const faviconTemp = path.join(TEMP_DIR, 'favicon-temp.png');
    await sharp(sourceIcon)
      .resize(196, 196, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(faviconTemp);
    fs.copyFileSync(faviconTemp, path.join(ASSETS_DIR, 'favicon.png'));

    // Clean up temp files
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });

    console.log('Icon resizing completed successfully!');
    console.log('Generated files:');
    console.log('- icon.png (1024x1024)');
    console.log('- adaptive-icon.png (1024x1024 with padding)');
    console.log('- splash-icon.png (1242x2436)');
    console.log('- favicon.png (196x196)');

  } catch (error) {
    console.error('Error resizing icons:', error);
  }
}

resizeIcons(); 