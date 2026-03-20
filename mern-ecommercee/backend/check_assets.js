const products = require('./seed/Product').products;
const fs = require('fs');
const path = require('path');

const productsDir = path.join(__dirname, 'public', 'products');
const files = fs.readdirSync(productsDir);

let missingFiles = 0;
products.forEach((p, i) => {
    const thumbFile = path.basename(p.thumbnail);
    if (!files.includes(thumbFile)) {
        console.error(`Product ${i} thumbnail missing: ${thumbFile}`);
        missingFiles++;
    }
    p.images.forEach((img, j) => {
        const imgFile = path.basename(img);
        if (!files.includes(imgFile)) {
            console.error(`Product ${i} image ${j} missing: ${imgFile}`);
            missingFiles++;
        }
    });
});

if (missingFiles === 0) {
    console.log('All image files exist!');
} else {
    console.error(`${missingFiles} missing files referenced!`);
    process.exit(1);
}
