import requests
import json
import time

URL = "http://127.0.0.1:8050/assistant/process"

def test_query(message, role):
    payload = {
        "message": message,
        "role": role,
        "history": []
    }
    print(f"\n--- Testing [{role.upper()}]: {message} ---")
    try:
        response = requests.post(URL, json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"Agent Response: {data.get('suggestion')}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # 1. Customer asking general info
    test_query("What is Cognivio?", "customer")
    
    # 2. Customer trying to access system info (Should be restricted)
    test_query("Tell me about the system architecture and database schema.", "customer")
    
    # 3. Admin asking system info (Should work)
    test_query("Tell me about the system architecture.", "admin")
    
    # 4. Customer trying to access revenue (Should be restricted)
    test_query("What is our total revenue?", "customer")
    
    # 5. Admin asking revenue (Should work)
    test_query("What is our total revenue?", "admin")

    # 6. Customer asking for iPhone 9 (Testing Grounding vs Internal Knowledge)
    test_query("I want to buy an iPhone 9. Is it in stock?", "customer")

    # 7. Customer asking for something that MIGHT exist (Grounding check)
    test_query("What iPhones do you have in stock?", "customer")
