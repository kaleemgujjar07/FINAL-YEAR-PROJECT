import http.server
import json
import socketserver
import re
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# 1. Scikit-Learn Demand Forecasting
def sklearn_linear_regression(y, steps=1):
    """
    Predicts the next N values in a sequence using sklearn LinearRegression.
    """
    n = len(y)
    if n < 2:
        return [y[-1]] * steps, 0
    
    # Reshape for sklearn
    X = np.array(range(n)).reshape(-1, 1)
    y_target = np.array(y)
    
    # Train actual ML Model
    model = LinearRegression()
    model.fit(X, y_target)
    
    # Predict future steps
    future_X = np.array(range(n, n + steps)).reshape(-1, 1)
    predictions = model.predict(future_X)
    
    return [max(0.0, float(f"{p:.2f}")) for p in predictions], float(model.coef_[0])

# 2. Scikit-Learn NLP Intent Classifier
corpus = [
    "show me sales revenue", "what is my profit", "show invoice", "total money earned", "sale",
    "how much stock is left", "inventory status", "product quantity available", "items in stock", "product",
    "employee attendance", "staff payroll", "who is present today", "hr summary", "member",
    "monthly expenses", "how much cost spend", "total utility bill paid", "spend", "cost"
]
labels = [
    "get_sales_summary", "get_sales_summary", "get_sales_summary", "get_sales_summary", "get_sales_summary",
    "get_inventory_status", "get_inventory_status", "get_inventory_status", "get_inventory_status", "get_inventory_status",
    "get_hr_summary", "get_hr_summary", "get_hr_summary", "get_hr_summary", "get_hr_summary",
    "get_expense_summary", "get_expense_summary", "get_expense_summary", "get_expense_summary", "get_expense_summary"
]

# Train the NLP model on startup
vectorizer = TfidfVectorizer()
X_nlp = vectorizer.fit_transform(corpus)
classifier = MultinomialNB()
classifier.fit(X_nlp, labels)

def classify_intent_ml(message):
    message_vec = vectorizer.transform([message.lower()])
    probs = classifier.predict_proba(message_vec)[0]
    max_prob = np.max(probs)
    
    if max_prob < 0.15: # Low confidence fallback
        return "unknown"
    return classifier.predict(message_vec)[0]

class AIServiceHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        response = {}
        
        if self.path == '/assistant/process':
            message = data.get('message', '')
            intent = classify_intent_ml(message)
            
            # Simple Entity Extraction for Date/Month
            month_map = {
                "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
                "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12,
                "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12
            }
            
            found_month = None
            found_year = None
            
            message_lower = message.lower()
            for m_name, m_val in month_map.items():
                if m_name in message_lower:
                    found_month = m_val
                    break
                    
            year_match = re.search(r'\b(202\d)\b', message)
            if year_match:
                found_year = int(year_match.group(1))
            
            response = {
                "intent": intent,
                "entities": {
                    "month": found_month,
                    "year": found_year
                },
                "suggestion": f"I think you are asking about {intent.replace('_', ' ')}" if intent != "unknown" else "I'm not sure what you mean.",
                "ml_confidence_achieved": True
            }
            
        elif self.path == '/forecast/series':
            historical = data.get('historical_data', [])
            steps = data.get('steps', 6)
            if len(historical) < 2:
                response = {"error": "Need at least 2 data points for ML forecast"}
            else:
                forecasts, slope = sklearn_linear_regression(historical, steps)
                response = {
                    "forecasts": forecasts,
                    "trend": "increasing" if slope > 0 else "decreasing",
                    "slope": float(f"{float(slope):.4f}"),
                    "model": "sklearn.linear_model.LinearRegression"
                }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        # Handle CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "Cognivio AI Service is Online", "engine": "Scikit-Learn ML Logic"}).encode('utf-8'))

PORT = 8050
with socketserver.TCPServer(("", PORT), AIServiceHandler) as httpd:
    print(f"Cognivio AI Service running on port {PORT} with Scikit-learn backend.")
    httpd.serve_forever()
