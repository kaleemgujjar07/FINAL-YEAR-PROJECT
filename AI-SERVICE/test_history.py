import requests
import json

URL = "http://127.0.0.1:8050/assistant/process"

def test_multi_turn():
    history = []
    
    # Turn 1
    msg1 = "add something Universe 9 into the card because I have to buy it"
    payload1 = {"message": msg1, "role": "customer", "history": history}
    print(f"\nUser: {msg1}")
    r1 = requests.post(URL, json=payload1).json()
    print(f"Agent Action: {r1['intent']}")
    print(f"Agent Suggestion: {r1['suggestion']}")
    
    history = r1['history']
    
    # Turn 2
    msg2 = "yes"
    payload2 = {"message": msg2, "role": "customer", "history": history}
    print(f"\nUser: {msg2}")
    r2 = requests.post(URL, json=payload2).json()
    print(f"Agent Action: {r2['intent']}")
    print(f"Agent Suggestion: {r2['suggestion']}")
    print(f"Entities Found: {r2['entities']}")

if __name__ == "__main__":
    test_multi_turn()
