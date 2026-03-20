const products = require('./seed/Product').products;
const mongoose = require('mongoose');

let errors = 0;
products.forEach((p, i) => {
    if (!p.title) { console.error(`Product ${i} missing title`); errors++; }
    if (!p.description) { console.error(`Product ${i} missing description`); errors++; }
    if (!p.price) { console.error(`Product ${i} missing price`); errors++; }
    if (!p.stockQuantity) { console.error(`Product ${i} missing stockQuantity`); errors++; }
    if (!p.thumbnail) { console.error(`Product ${i} missing thumbnail`); errors++; }
    if (!p.images || !Array.isArray(p.images) || p.images.length === 0) { console.error(`Product ${i} missing images`); errors++; }
    
    if (!p.brand || p.brand.length !== 24) { console.error(`Product ${i} has invalid brand ID: ${p.brand}`); errors++; }
    if (!p.category || p.category.length !== 24) { console.error(`Product ${i} has invalid category ID: ${p.category}`); errors++; }
});

if (errors === 0) {
    console.log('All products valid!');
} else {
    console.error(`${errors} errors found`);
    process.exit(1);
}
