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

async function searchFix() {
    try {
        let content = fs.readFileSync(productSeedPath, 'utf8');
        const productsRegex = /\{[\s\S]*?title: "(.*?)"[\s\S]*?thumbnail: ".*?"[\s\S]*?images: \[[\s\S]*?\][\s\S]*?\}/g;
        
        const products_matches = [];
        let match;
        while ((match = productsRegex.exec(content)) !== null) {
            products_matches.push({ full: match[0], title: match[1] });
        }

        console.log(`Starting individual search for ${products_matches.length} products...`);
        let updatedCount = 0;

        for (let i = 0; i < products_matches.length; i++) {
            const p = products_matches[i];
            const cleanTitle = p.title.replace(/ Perfume custom/g, '').trim(); // clean some garbage I saw
            
            let finalThumbnail;
            let finalImages;

            // 1. Check Local Match
            for (const [key, localImg] of Object.entries(localImagesMap)) {
                if (cleanTitle.toLowerCase().includes(key.toLowerCase())) {
                    finalThumbnail = `/assets/products/${localImg}`;
                    finalImages = [finalThumbnail];
                    break;
                }
            }

            // 2. Search Remote if no local match
            if (!finalThumbnail) {
                try {
                    // Search for the first word or two to be less strict if exact fails?
                    // No, let's try the whole title first.
                    console.log(`Searching for: ${cleanTitle}...`);
                    const searchRes = await axios.get(`https://dummyjson.com/products/search?q=${encodeURIComponent(cleanTitle)}`);
                    const results = searchRes.data.products;
                    if (results && results.length > 0) {
                        finalThumbnail = results[0].thumbnail;
                        finalImages = results[0].images;
                    }
                } catch (e) {
                    console.log(`Error searching for ${cleanTitle}: ${e.message}`);
                }
            }

            if (finalThumbnail) {
                let updatedBlock = p.full.replace(/thumbnail: ".*?"/, `thumbnail: "${finalThumbnail}"`);
                updatedBlock = updatedBlock.replace(/images: \[[\s\S]*?\]/, `images: [\n      "${finalImages[0]}",\n    ]`);
                content = content.replace(p.full, updatedBlock);
                updatedCount++;
            }
            
            // Wait a bit to avoid rate limiting
            await new Promise(r => setTimeout(r, 100));
        }

        fs.writeFileSync(productSeedPath, content);
        console.log(`Done! Updated ${updatedCount} products with optimized images.`);
        process.exit(0);
    } catch (err) {
        console.error('Fatal Error:', err.message);
        process.exit(1);
    }
}

searchFix();
