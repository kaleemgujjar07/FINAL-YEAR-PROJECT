import requests
import json

URL = "http://127.0.0.1:8050/assistant/process"

def test_fuzzy_search():
    # Test 1: Infinix INBOOK via "infinix in book"
    msg1 = "add infinix in book into the cart"
    payload1 = {"message": msg1, "role": "customer", "history": []}
    print(f"\nUser: {msg1}")
    r1 = requests.post(URL, json=payload1).json()
    print(f"Agent Action: {r1['intent']}")
    print(f"Entities Found: {r1['entities']}")
    print(f"Agent Suggestion: {r1['suggestion']}")

    # Test 2: MacBook Pro
    msg2 = "add MacBook Pro into the cart"
    payload2 = {"message": msg2, "role": "customer", "history": []}
    print(f"\nUser: {msg2}")
    r2 = requests.post(URL, json=payload2).json()
    print(f"Agent Action: {r2['intent']}")
    print(f"Entities Found: {r2['entities']}")

if __name__ == "__main__":
    test_fuzzy_search()
