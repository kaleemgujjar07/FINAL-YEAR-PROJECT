const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Kaleem Gujjar\\.gemini\\antigravity\brain\\4644084d-286d-4935-8689-7738615849c2';
const targetDir = path.resolve(__dirname, 'public/assets/products');

const filesToCopy = [
    { src: 'vintage_pendant_png_1774542350436.png', dest: 'vintage_pendant.png' },
    { src: 'bed_rolls_png_1774542368942.png', dest: 'bed_rolls.png' },
    { src: 'pizza_png_1774542386531.png', dest: 'pizza.png' }
];

filesToCopy.forEach(file => {
    const srcPath = path.join(artifactDir, file.src);
    const destPath = path.join(targetDir, file.dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${file.src} to ${file.dest}`);
    }
});
