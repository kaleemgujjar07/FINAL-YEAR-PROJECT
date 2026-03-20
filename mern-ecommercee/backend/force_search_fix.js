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

async function forceSearchFix() {
    try {
        let content = fs.readFileSync(productSeedPath, 'utf8');
        // regex to match full product block
        const productsRegex = /\{[\s\S]*?title: "(.*?)"[\s\S]*?thumbnail: ".*?"[\s\S]*?images: \[[\s\S]*?\][\s\S]*?\}/g;
        
        let match;
        const productsToUpdate = [];
        while ((match = productsRegex.exec(content)) !== null) {
            productsToUpdate.push({ full: match[0], title: match[1] });
        }

        console.log(`Forcing search for ${productsToUpdate.length} products...`);
        let updatedCount = 0;
        let localCount = 0;

        for (let i = 0; i < productsToUpdate.length; i++) {
            const p = productsToUpdate[i];
            const cleanTitleForSearch = p.title.replace(/ Perfume custom/g, '').replace(/30ml/g, '').replace(/500gm/g, '').replace(/\.\.\.\./g, '').trim();
            
            let finalThumbnail;
            let finalImages;

            // 1. Local Match check
            for (const [key, localImg] of Object.entries(localImagesMap)) {
                if (p.title.toLowerCase().includes(key.toLowerCase())) {
                    finalThumbnail = `/assets/products/${localImg}`;
                    finalImages = [finalThumbnail];
                    localCount++;
                    break;
                }
            }

            // 2. Search Remote
            if (!finalThumbnail) {
                try {
                    console.log(`Searching [${i+1}/100]: ${cleanTitleForSearch}...`);
                    const searchRes = await axios.get(`https://dummyjson.com/products/search?q=${encodeURIComponent(cleanTitleForSearch)}`);
                    const results = searchRes.data.products;
                    if (results && results.length > 0) {
                        finalThumbnail = results[0].thumbnail;
                        finalImages = results[0].images;
                    } else {
                        // try even broader search if exact-ish title fails
                        const words = cleanTitleForSearch.split(' ');
                        if (words.length > 2) {
                            const broadRes = await axios.get(`https://dummyjson.com/products/search?q=${encodeURIComponent(words[0] + ' ' + words[1])}`);
                            if (broadRes.data.products && broadRes.data.products.length > 0) {
                                finalThumbnail = broadRes.data.products[0].thumbnail;
                                finalImages = broadRes.data.products[0].images;
                            }
                        }
                    }
                } catch (e) {
                    console.log(`Search fail for ${cleanTitleForSearch}: ${e.message}`);
                }
            }

            if (finalThumbnail) {
                let updatedBlock = p.full.replace(/thumbnail: ".*?"/, `thumbnail: "${finalThumbnail}"`);
                updatedBlock = updatedBlock.replace(/images: \[[\s\S]*?\]/, `images: [\n      "${finalImages[0]}",\n    ]`);
                content = content.split(p.full).join(updatedBlock); // use split/join to replace ALL occurrences if any (safe)
                updatedCount++;
            }
            
            await new Promise(r => setTimeout(r, 100));
        }

        fs.writeFileSync(productSeedPath, content);
        console.log(`Success! Updated ${updatedCount} products.`);
        console.log(`- Local overrides: ${localCount}`);
        console.log(`- Remote corrected: ${updatedCount - localCount}`);
        process.exit(0);
    } catch (err) {
        console.error('Fatal:', err.message);
        process.exit(1);
    }
}

forceSearchFix();
