const fs = require('fs');
const path = require('path');

const productSeedPath = path.resolve(__dirname, 'seed/Product.js');

const categoryMapping = {
    "65a7e24602e12c44f599442c": ["smartphone.png"],
    "65a7e24602e12c44f599442d": ["laptop.png", "ultrabook.png"],
    "65a7e24602e12c44f599442e": ["cologne.png", "perfume.png", "serum.png"],
    "65a7e24602e12c44f599442f": ["moisturizer.png", "serum.png"],
    "65a7e24602e12c44f5994430": ["fruits.png", "lentils.png", "pasta.png", "bread.png", "bread_rolls.png", "pizza.png"],
    "65a7e24602e12c44f5994431": ["vase.png", "floral_chandelier.png", "pendant_light.png", "vintage_pendant.png", "green_potted_plant.png"],
    "65a7e24602e12c44f5994432": ["sofa.png", "bed.png", "office_chair.png", "bed_rolls.png", "modern_work_desk.png", "dining_table.png"],
    "65a7e24602e12c44f5994433": ["trench_coat.png", "leather_jacket.png", "mens_casual_tee.png"],
    "65a7e24602e12c44f5994434": ["trench_coat.png", "luxury_red_dress.png", "blue_summer_dress.png"],
    "65a7e24602e12c44f5994435": ["shoes.png"],
    "65a7e24602e12c44f5994436": ["leather_jacket.png", "mens_formal_shirt.png", "mens_casual_tee.png"],
    "65a7e24602e12c44f5994437": ["shoes.png"],
    "65a7e24602e12c44f59943f6": ["coffee.png", "sofa.png"], // coffee cafe brand
    "65a7e24602e12c44f5994438": ["gold_watch_women.png", "diamond_ring.png"],
    "65a7e24602e12c44f5994439": ["gold_watch_women.png"],
    "65a7e24602e12c44f599443a": ["designer_handbag_brown.png", "leather_jacket.png"],
    "65a7e24602e12c44f599443b": ["diamond_ring.png", "pearl_necklace.png"],
    "65a7e24602e12c44f599443c": ["motocross_goggles.png", "stylish_sunglasses_black.png"],
    "65a7e24602e12c44f599443d": ["car_charger.png"],
    "65a7e24602e12c44f599443e": ["motorcycle_racing.png", "motocross_goggles.png"],
    "65a7e24602e12c44f599443f": ["pendant_light.png", "vintage_pendant.png", "floral_chandelier.png"]
};

let content = fs.readFileSync(productSeedPath, 'utf8');
const productsRegex = /\{[\s\S]*?category: "(\w+)"[\s\S]*?\}/g;

let counterMap = {};
const newContent = content.replace(productsRegex, (match, catId) => {
    const images = categoryMapping[catId];
    if (images) {
        if (!counterMap[catId]) counterMap[catId] = 0;
        const selectedImage = images[counterMap[catId] % images.length];
        counterMap[catId]++;
        const imagePath = `/assets/products/${selectedImage}`;
        
        match = match.replace(/thumbnail: ".*?"/, `thumbnail: "${imagePath}"`);
        match = match.replace(/images: \[[\s\S]*?\]/, `images: [\n      "${imagePath}",\n    ]`);
    }
    return match;
});

fs.writeFileSync(productSeedPath, newContent);
console.log('Product.js finalized with verified asset paths.');
