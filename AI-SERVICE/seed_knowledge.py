from pymongo import MongoClient

MONGO_URI = "mongodb+srv://gujjarkaleem37_db_user:kaleem217@cluster0.jzi2xz0.mongodb.net/ecommerce?retryWrites=true&w=majority"

def seed_knowledge():
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_database("ecommerce")
        collection = db["knowledge"]
        
        # Tiered Knowledge Data
        data = [
            # PUBLIC / CONSUMER LEVEL (Available to Ecommerce)
            {
                "topic": "project goal",
                "content": "Cognivio is designed to make shopping easy and business management hands-free through advanced voice-activated intelligence.",
                "access_level": "public"
            },
            {
                "topic": "features",
                "content": "We offer a wide product catalog, fast checkout, and a smart voice assistant to help you find the best deals!",
                "access_level": "public"
            },
            
            # ADMIN / ADVANCED LEVEL (Reserved for ERP)
            {
                "topic": "system architecture",
                "content": "Cognivio is a distributed system with a Node.js/Express backend for business logic, a Python/Scikit-Learn service for ML intelligence, and a React frontend. All data is synchronized via MongoDB Atlas.",
                "access_level": "admin"
            },
            {
                "topic": "developer notes",
                "content": "The project was built by Kaleem Gujjar. Advanced features include custom-trained Naive Bayes intent classifiers and pattern-matching entity extraction for autonomous fulfillment.",
                "access_level": "admin"
            },
            {
                "topic": "database schema",
                "content": "We use a NoSQL MongoDB schema. Key collections are 'products', 'users', 'orders', 'expenses', and this 'knowledge' base for the agentic layer.",
                "access_level": "admin"
            },
            {
                "topic": "financial logic",
                "content": "ERP financial stats are calculated using server-side aggregations. Revenue and profit metrics are fetched in real-time, while demand forecasting is handled by the Python ML service via linear regression.",
                "access_level": "admin"
            }
        ]
        
        # Clear existing and insert
        collection.delete_many({})
        collection.insert_many(data)
        print("Successfully seeded Tiered Knowledge Base (Public + Admin) into MongoDB.")
    except Exception as e:
        print(f"Seeding Error: {e}")

if __name__ == "__main__":
    seed_knowledge()
