const fs = require('fs');
const path = require('path');
const axios = require('axios');

const productSeedPath = path.resolve(__dirname, 'seed/Product.js');

const localImagesMap = {
    "iPhone 9": "smartphone.png",
    "Fog Scent Xpressio": "cologne.png",
    "MacBook Pro": "laptop.png",
    "Infinix INBOOK": "ultrabook.png",
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

async function smartRestore() {
    try {
        console.log('Fetching fresh product data from DummyJSON...');
        const response = await axios.get('https://dummyjson.com/products?limit=100');
        const remoteProducts = response.data.products;
        
        let content = fs.readFileSync(productSeedPath, 'utf8');

        // We'll iterate through the products in the seed file and match them with remote ones by index or title
        // The seed file has 100 products in order.
        const productsRegex = /\{[\s\S]*?title: "(.*?)"[\s\S]*?thumbnail: ".*?"[\s\S]*?images: \[[\s\S]*?\][\s\S]*?\}/g;

        let index = 0;
        const newContent = content.replace(productsRegex, (match, title) => {
            const remoteProduct = remoteProducts[index];
            index++;

            let finalThumbnail = remoteProduct ? remoteProduct.thumbnail : "https://via.placeholder.com/150";
            let finalImages = remoteProduct ? remoteProduct.images : [finalThumbnail];

            // Check if we have a local premium match
            for (const [key, localImg] of Object.entries(localImagesMap)) {
                if (title.toLowerCase().includes(key.toLowerCase())) {
                    finalThumbnail = `/assets/products/${localImg}`;
                    finalImages = [finalThumbnail];
                    break;
                }
            }

            match = match.replace(/thumbnail: ".*?"/, `thumbnail: "${finalThumbnail}"`);
            match = match.replace(/images: \[[\s\S]*?\]/, `images: [\n      "${finalImages[0]}",\n    ]`); // Keep it simple for one image in array or use first one
            
            return match;
        });

        fs.writeFileSync(productSeedPath, newContent);
        console.log(`Successfully updated ${index} products with unique images!`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to restore images:', err.message);
        process.exit(1);
    }
}

smartRestore();
