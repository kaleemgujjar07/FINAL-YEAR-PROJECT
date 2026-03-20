const fs = require('fs');
const path = require('path');

const productSeedPath = path.resolve(__dirname, 'seed/Product.js');
let content = fs.readFileSync(productSeedPath, 'utf8');

const categoryMapping = {
    "65a7e24602e12c44f599442b": ["smartphone.png"],
    "65a7e24602e12c44f599442c": ["laptop.png", "ultrabook.png"],
    "65a7e24602e12c44f599442d": ["cologne.png", "serum.png"],
    "65a7e24602e12c44f599442e": ["moisturizer.png", "serum.png"],
    "65a7e24602e12c44f5994430": ["fruits.png", "lentils.png", "pasta.png", "bread.png", "bread_rolls.png", "pizza.png"],
    "65a7e24602e12c44f5994431": ["vase.png", "floral_chandelier.png", "pendant_light.png", "vintage_pendant.png", "green_potted_plant.png"],
    "65a7e24602e12c44f5994432": ["sofa.png", "bed.png", "office_chair.png", "bed_rolls.png", "modern_work_desk.png"],
    "65a7e24602e12c44f5994433": ["trench_coat.png", "leather_jacket.png", "mens_casual_tee.png"],
    "65a7e24602e12c44f5994434": ["trench_coat.png", "luxury_red_dress.png", "blue_summer_dress.png"],
    "65a7e24602e12c44f5994435": ["shoes.png"],
    "65a7e24602e12c44f5994436": ["leather_jacket.png", "mens_formal_shirt.png", "mens_casual_tee.png"],
    "65a7e24602e12c44f5994437": ["shoes.png"],
    "65a7e24602e12c44f59943f6": ["sofa.png"],
    "65a7e24602e12c44f5994438": ["diamond_ring.png", "gold_watch_women.png"],
    "65a7e24602e12c44f5994439": ["gold_watch_women.png"],
    "65a7e24602e12c44f599443a": ["designer_handbag_brown.png", "leather_jacket.png"],
    "65a7e24602e12c44f599443b": ["diamond_ring.png", "pearl_necklace.png"],
    "65a7e24602e12c44f599443c": ["motocross_goggles.png", "stylish_sunglasses_black.png"],
    "65a7e24602e12c44f599443d": ["car_charger.png"],
    "65a7e24602e12c44f599443e": ["motorcycle_racing.png", "motocross_goggles.png"],
    "65a7e24602e12c44f599443f": ["pendant_light.png", "vintage_pendant.png", "floral_chandelier.png"]
};

// Map specific titles for better accuracy
const specificTitleMapping = {
    "iPhone 9": "smartphone.png",
    "MacBook Pro": "laptop.png",
    "red dress": "luxury_red_dress.png",
    "summer dress": "blue_summer_dress.png",
    "formal shirt": "mens_formal_shirt.png",
    "casual shirt": "mens_casual_tee.png",
    "T Shirt": "mens_casual_tee.png",
    "handbag": "designer_handbag_brown.png",
    "watch": "gold_watch_women.png",
    "necklace": "pearl_necklace.png",
    "sunglasses": "stylish_sunglasses_black.png",
    "desk": "modern_work_desk.png",
    "plant": "green_potted_plant.png",
    "Sofa": "sofa.png",
    "Bed": "bed.png"
};

const productsRegex = /\{[\s\S]*?title: "(.*?)"[\s\S]*?category: "(\w+)"[\s\S]*?\}/g;

let counterMap = {}; 
const newContent = content.replace(productsRegex, (match, title, catId) => {
    let selectedImage;

    // 1. Try specific title match
    for (const [key, img] of Object.entries(specificTitleMapping)) {
        if (title.toLowerCase().includes(key.toLowerCase())) {
            selectedImage = img;
            break;
        }
    }

    // 2. Fallback to category cycling
    if (!selectedImage) {
        const images = categoryMapping[catId];
        if (images) {
            if (!counterMap[catId]) counterMap[catId] = 0;
            selectedImage = images[counterMap[catId] % images.length];
            counterMap[catId]++;
        }
    }

    if (selectedImage) {
        const imagePath = `/assets/products/${selectedImage}`;
        match = match.replace(/thumbnail: ".*?"/, `thumbnail: "${imagePath}"`);
        match = match.replace(/images: \[[\s\S]*?\]/, `images: [\n      "${imagePath}",\n    ]`);
    }
    return match;
});

fs.writeFileSync(productSeedPath, newContent);
console.log('Product.js updated with diverse local images and smart title matching.');
