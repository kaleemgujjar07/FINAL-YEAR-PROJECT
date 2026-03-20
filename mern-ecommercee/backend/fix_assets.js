const fs = require('fs');
const path = require('path');

const artifactDir = 'C:\\Users\\Kaleem Gujjar\\.gemini\\antigravity\\brain\\4644084d-286d-4935-8689-7738615849c2';
const targetDir = path.resolve(__dirname, 'public/assets/products');

const filesToCopy = [
    { src: 'luxury_red_dress_png_1774535213326.png', dest: 'luxury_red_dress.png' },
    { src: 'blue_summer_dress_png_1774535228925.png', dest: 'blue_summer_dress.png' },
    { src: 'mens_formal_shirt_png_1774535246477.png', dest: 'mens_formal_shirt.png' },
    { src: 'mens_casual_tee_png_1774535266078.png', dest: 'mens_casual_tee.png' },
    { src: 'designer_handbag_brown_png_1774535283782.png', dest: 'designer_handbag_brown.png' },
    { src: 'gold_watch_women_png_1774535301998.png', dest: 'gold_watch_women.png' },
    { src: 'pearl_necklace_png_1774535320769.png', dest: 'pearl_necklace.png' },
    { src: 'stylish_sunglasses_black_png_1774535340554.png', dest: 'stylish_sunglasses_black.png' },
    { src: 'modern_work_desk_png_1774535359999.png', dest: 'modern_work_desk.png' },
    { src: 'green_potted_plant_png_1774535377156.png', dest: 'green_potted_plant.png' }
];

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

filesToCopy.forEach(file => {
    const srcPath = path.join(artifactDir, file.src);
    const destPath = path.join(targetDir, file.dest);
    
    if (fs.existsSync(srcPath)) {
        try {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Successfully copied ${file.src} to ${file.dest}`);
        } catch (err) {
            console.error(`Failed to copy ${file.src}: ${err.message}`);
        }
    } else {
        console.error(`Source file not found: ${srcPath}`);
    }
});
