const fs = require('fs');
const path = require('path');
const axios = require('axios');

const productSeedPath = path.resolve(__dirname, 'seed/Product.js');

const localImagesMap = {
    "iPhone 9": "smartphone.png",
    "iPhone X": "smartphone.png",
    "Samsung Universe 9": "smartphone.png",
    "Huawei P30": "smartphone.png",
    "Samsung Galaxy Book": "laptop.png",
    "Microsoft Surface Laptop 4": "laptop.png",
    "Infinix INBOOK": "ultrabook.png",
    "MacBook Pro": "laptop.png",
    "Fog Scent Xpressio": "cologne.png",
    "Hyaluronic Acid": "serum.png",
    "Oil Free Moisturizer": "moisturizer.png",
    "Daal Masoor": "lentils.png",
    "Elbow Macaroni": "pasta.png",
    "Mornadi Velvet Bed": "bed.png",
    "Sofa for Coffe": "sofa.png",
    "Sneaker shoes": "shoes.png",
    "Silver Ring Set": "diamond_ring.png",
    "Qualcomm original Car Charger": "car_charger.png",
    "Automatic Motor Gas Motorcycles": "motorcycle_racing.png",
    "new arrivals Fashion motocross goggles": "motocross_goggles.png",
    "Metal Ceramic Flower": "floral_chandelier.png",
    "American Vintage Wood": "pendant_light.png",
    "red dress": "luxury_red_dress.png",
    "summer dress": "blue_summer_dress.png",
    "formal shirt": "mens_formal_shirt.png",
    "casual shirt": "mens_casual_tee.png",
    "handbag": "designer_handbag_brown.png",
    "necklace": "pearl_necklace.png",
    "sunglasses": "stylish_sunglasses_black.png",
    "desk": "modern_work_desk.png",
    "plant": "green_potted_plant.png"
};

async function fixMismatches() {
    try {
        console.log('Fetching all 200 products from DummyJSON for comprehensive matching...');
        const response = await axios.get('https://dummyjson.com/products?limit=200');
        const remoteProducts = response.data.products;
        
        const remoteTitleMap = {};
        remoteProducts.forEach(p => {
            remoteTitleMap[p.title.toLowerCase().trim()] = p;
        });

        let content = fs.readFileSync(productSeedPath, 'utf8');
        const productsRegex = /\{[\s\S]*?title: "(.*?)"[\s\S]*?thumbnail: ".*?"[\s\S]*?images: \[[\s\S]*?\][\s\S]*?\}/g;

        let matchCount = 0;
        let localCount = 0;
        let fallbackCount = 0;

        const newContent = content.replace(productsRegex, (match, title) => {
            const cleanTitle = title.toLowerCase().trim();
            let finalThumbnail;
            let finalImages;

            // 1. Local/Manual Override
            let localMatch = false;
            for (const [key, localImg] of Object.entries(localImagesMap)) {
                if (cleanTitle.includes(key.toLowerCase())) {
                    finalThumbnail = `/assets/products/${localImg}`;
                    finalImages = [finalThumbnail];
                    localCount++;
                    localMatch = true;
                    break;
                }
            }

            if (!localMatch) {
                // 2. Exact or Fuzzy Remote Match
                let remoteMatch = remoteTitleMap[cleanTitle];
                
                if (!remoteMatch) {
                    for (const [rTitle, rProd] of Object.entries(remoteTitleMap)) {
                        if (cleanTitle.includes(rTitle) || rTitle.includes(cleanTitle)) {
                            remoteMatch = rProd;
                            break;
                        }
                    }
                }

                if (remoteMatch) {
                    finalThumbnail = remoteMatch.thumbnail;
                    finalImages = remoteMatch.images;
                    matchCount++;
                } else {
                    // 3. Last resort: Generic Category Image if we can guess the category
                    if (match.includes('/assets/products/')) {
                         // already mapped to something local, keep it
                    } else {
                        finalThumbnail = "https://via.placeholder.com/300?text=Product+Image";
                        finalImages = [finalThumbnail];
                        fallbackCount++;
                    }
                }
            }

            if (finalThumbnail) {
                match = match.replace(/thumbnail: ".*?"/, `thumbnail: "${finalThumbnail}"`);
                match = match.replace(/images: \[[\s\S]*?\]/, `images: [\n      "${finalImages[0]}",\n    ]`);
            }
            
            return match;
        });

        fs.writeFileSync(productSeedPath, newContent);
        console.log(`Final Report: Successfully mapped ${matchCount + localCount} / 100 products.`);
        console.log(`- Local/Manual: ${localCount}`);
        console.log(`- Remote Assets: ${matchCount}`);
        console.log(`- Placeholders: ${fallbackCount}`);
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err.message);
        process.exit(1);
    }
}

fixMismatches();
