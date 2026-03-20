import http.server
import json
import socketserver
import sys
import os
from pymongo import MongoClient
from groq import Groq
import logging
import traceback
import inspect

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY not found in environment variables!")

client_groq = Groq()

VERSION = "Grounded-v2.1"
print(f"--- COGNIVIO AGENT STARTING VERSION: {VERSION} ---")

# MongoDB Connection
MONGO_URI = "mongodb+srv://gujjarkaleem37_db_user:kaleem217@cluster0.jzi2xz0.mongodb.net/ecommerce?retryWrites=true&w=majority"
try:
    client_db = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client_db.get_database("ecommerce")
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"MongoDB Error: {e}")
    db = None

# --- TOOLS ---

def get_sales_summary(period="total"):
    """Fetches sales data from MongoDB."""
    if db is None: return "Database offline."
    try:
        pipeline = [
            {"$group": {"_id": None, "totalRevenue": {"$sum": "$totalPrice"}, "count": {"$sum": 1}}}
        ]
        result = list(db.orders.aggregate(pipeline))
        if result:
            return f"Total Revenue: ${result[0]['totalRevenue']:.2f} from {result[0]['count']} orders."
        return "No sales data found."
    except Exception as e:
        return f"Error fetching sales: {str(e)}"

def get_inventory_status(product_name=None):
    """Checks inventory in MongoDB with robust matching."""
    if db is None: return "Database offline."
    try:
        coll = db["products"]
        if product_name:
            p_name = str(product_name).strip()
            query = {"title": {"$regex": p_name, "$options": "i"}}
            product = coll.find_one(query)
            
            if not product:
                stop_words = {"in", "the", "and", "book", "of", "within"}
                words = [w.lower() for w in p_name.split() if w.lower() not in stop_words and len(w) > 1]
                if words:
                    word_query = {"$and": [{"title": {"$regex": w, "$options": "i"}} for w in words]}
                    product = coll.find_one(word_query)

            if product:
                return f"Found '{product['title']}': Stock is {product.get('quantity', product.get('stockQuantity', 'N/A'))}."
            return f"Product '{p_name}' not found in our inventory."
        else:
            count = coll.count_documents({})
            return f"Total Products: {count}."
    except Exception as e:
        logger.error(f"Inventory Tool Error: {e}")
        return f"Error checking inventory: {str(e)}"

def get_user_profile(user_id):
    """Fetches the user's basic profile details from MongoDB."""
    if db is None: return {"status": "error", "message": "Database offline."}
    if not user_id: return {"status": "error", "message": "User ID not provided."}
    try:
        coll = db["users"]
        from bson import ObjectId
        from bson.errors import InvalidId
        try:
            oid = ObjectId(user_id)
        except InvalidId:
            return {"status": "error", "message": "Invalid User ID format."}
            
        user_record = coll.find_one({"_id": oid})
        if user_record:
            return {
                "status": "success",
                "name": user_record.get("name", "N/A"),
                "email": user_record.get("email", "N/A"),
                "phone": user_record.get("phone", "N/A"),
                "country": user_record.get("country", "N/A")
            }
        return {"status": "error", "message": "User profile not found."}
    except Exception as e:
        logger.error(f"Profile Tool Error: {e}")
        return {"status": "error", "message": f"Error fetching profile: {str(e)}"}

def get_user_shipping_info(user_id):
    """Fetches the user's shipping address from MongoDB."""
    if db is None: return {"status": "error", "message": "Database offline."}
    if not user_id: return {"status": "error", "message": "User ID not provided."}
    try:
        coll = db["addresses"]
        from bson import ObjectId
        from bson.errors import InvalidId
        try:
            oid = ObjectId(user_id)
        except InvalidId:
            return {"status": "error", "message": "Invalid User ID format."}

        address = coll.find_one({"user": oid})
        if address:
            # Prepare a clean dict for the frontend/agent
            addr_data = {
                "type": address.get("type", "Home"),
                "street": address.get("street", ""),
                "city": address.get("city", ""),
                "state": address.get("state", ""),
                "phoneNumber": address.get("phoneNumber", ""),
                "postalCode": address.get("postalCode", ""),
                "country": address.get("country", ""),
                "_id": str(address.get("_id", ""))
            }
            msg = f"I found your shipping address: {addr_data['street']}, {addr_data['city']}, {addr_data['state']} {addr_data['postalCode']}, {addr_data['country']}. Contact: {addr_data['phoneNumber']}."
            return {"status": "success", "message": msg, "address": addr_data}
        return {"status": "error", "message": "No saved shipping address found. Please add one in your profile."}
    except Exception as e:
        logger.error(f"Shipping Tool Error: {e}")
        return {"status": "error", "message": f"Error fetching shipping info: {str(e)}"}

def proceed_to_checkout():
    """Signals the intent to proceed to the checkout page."""
    return "OK! I'm taking you to the checkout page now."

def add_to_cart_logic(product_name):
    """Logic to identify product for cart addition with high-intelligence ranking."""
    if db is None: return "Database offline."
    try:
        coll = db["products"]
        p_name = str(product_name).strip()
        
        # 1. Exact Match (The most rigid)
        query = {"title": {"$regex": f"^{p_name}$", "$options": "i"}}
        product = coll.find_one(query)
        if product:
            return {"status": "success", "title": product['title'], "product_id": str(product['_id']), "message": f"Added '{product['title']}' to cart."}
        
        # 2. Ranked Keyword Intersection (The dynamic way)
        import re
        stop_words = {"in", "the", "and", "book", "of", "within", "product", "item", "to", "for"}
        words = [w.lower() for w in re.split(r'\W+', p_name) if w.lower() not in stop_words and len(w) > 1]
        
        if not words:
            return f"I couldn't understand which product you meant by '{p_name}'. Try using the full title!"

        # Look for products that match ANY of the words, then rank them
        word_query = {"$or": [{"title": {"$regex": w, "$options": "i"}} for w in words]}
        all_matches = list(coll.find(word_query).limit(20))
        
        scored_matches = []
        for p in all_matches:
            title_lower = p['title'].lower()
            # Score based on how many keywords match
            matches = sum(1 for w in words if w in title_lower or title_lower in w)
            if matches > 0:
                scored_matches.append((matches, p))
        
        # Sort by score (highest first)
        scored_matches.sort(key=lambda x: x[0], reverse=True)
        
        if not scored_matches:
            return f"I searched for '{p_name}' in our inventory but couldn't find a confident match. Are you sure that's the correct name?"

        highest_score = scored_matches[0][0]
        # Get all candidates with the top score
        top_candidates = [p for score, p in scored_matches if score == highest_score]

        if len(top_candidates) == 1:
            product = top_candidates[0]
            # If it's a very high match (all words match), consider it a success
            if highest_score >= len(words):
                return {
                    "status": "success",
                    "title": product['title'],
                    "product_id": str(product['_id']),
                    "message": f"I found a great match: '{product['title']}'. Success! I've added it to your cart."
                }
            else:
                # Partial match, verify with user
                return {
                    "status": "ambiguous",
                    "candidates": [product['title']],
                    "message": f"I found '{product['title']}' which seems similar to '{p_name}'. Is this the one you want?"
                }
        else:
            # Multiple candidates with same score
            titles = [p['title'] for p in top_candidates[:3]]
            return {
                "status": "ambiguous",
                "candidates": titles,
                "message": f"I found a few items matching '{p_name}': {', '.join(titles)}. Which one should I add?"
            }

    except Exception as e:
        logger.error(f"Cart Tool Error: {e}")
        return f"Database error identifying product: {str(e)}"

def get_user_orders(user_id):
    """Fetches the user's order history from MongoDB."""
    if db is None: return {"status": "error", "message": "Database offline."}
    if not user_id: return {"status": "error", "message": "User ID not provided."}
    try:
        coll = db["orders"]
        from bson import ObjectId
        from bson.errors import InvalidId
        try:
            oid = ObjectId(user_id)
        except InvalidId:
            return {"status": "error", "message": "Invalid User ID format."}

        # Find orders and sort by newest first
        orders = list(coll.find({"user": oid}).sort("createdAt", -1).limit(5))
        if orders:
            formatted = ""
            for o in orders:
                # item can be a list of mixed objects or product refs
                item_count = len(o.get('item', []))
                status = o.get('status', 'Pending')
                total = o.get('total', 0)
                date = o.get('createdAt', 'N/A')
                if hasattr(date, 'strftime'):
                    date = date.strftime("%Y-%m-%d")
                formatted += f"- Order {str(o['_id'])[-6:]} | Status: {status} | Total: ${total:.2f} | Items: {item_count} | Date: {date}\n"
            return {"status": "success", "message": f"I found your recent order history:\n{formatted}", "orders": [str(o['_id']) for o in orders]}
        return {"status": "error", "message": "You don't have any orders yet. Ready to make your first one?"}
    except Exception as e:
        logger.error(f"Orders Tool Error: {e}")
        return {"status": "error", "message": f"Error fetching orders: {str(e)}"}

def search_database_knowledge(query, role="customer"):
    if db is None: return "Database offline."
    try:
        search_filter = {
            "$or": [
                {"topic": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}}
            ]
        }
        if role == "customer":
            search_filter["access_level"] = "public"
        
        results = list(db.knowledge.find(search_filter).limit(3))
        if results:
            formatted = ""
            for r in results:
                formatted += f"--- {r['topic'].upper()} ---\n{r['content']}\n\n"
            return formatted
        return "No specific internal data found for this query."
    except Exception as e:
        return f"Knowledge search error: {str(e)}"

def calculate_forecast(historical_data, steps=6):
    """Calculates a simple linear trend forecast for a series of numbers."""
    if not historical_data or len(historical_data) < 2:
        # If no data or only one point, return flat forecast
        last_val = historical_data[-1] if historical_data else 0
        return [last_val] * steps, "stable"

    # Simple Linear Regression (y = mx + b)
    n = len(historical_data)
    x = list(range(n))
    y = historical_data

    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_xx = sum(xi * xi for xi in x)

    # m = (n*sum_xy - sum_x*sum_y) / (n*sum_xx - sum_x^2)
    slope_denom = (n * sum_xx - sum_x**2)
    if slope_denom == 0:
        slope = 0
    else:
        slope = (n * sum_xy - sum_x * sum_y) / slope_denom
    
    intercept = (sum_y - slope * sum_x) / n

    forecasts = []
    for i in range(n, n + steps):
        val = slope * i + intercept
        forecasts.append(max(0, round(val, 2))) # No negative revenue/expenses

    trend = "increasing" if slope > 0.05 else ("decreasing" if slope < -0.05 else "stable")
    return forecasts, trend

# --- TOOL DEFINITIONS ---

SEARCH_KNOWLEDGE_TOOL = {
    "type": "function",
    "function": {
        "name": "search_knowledge",
        "description": "Search the database for company information, architecture, and policies.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Information to search for"}
            },
            "required": ["query"]
        }
    }
}

CUSTOMER_TOOLS = [
    SEARCH_KNOWLEDGE_TOOL,
    {
        "type": "function",
        "function": {
            "name": "get_inventory_status",
            "description": "Check if a product is in stock.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Name of the product"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_to_cart_logic",
            "description": "Add a product to the shopping cart.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string", "description": "Name of product to add"}
                },
                "required": ["product_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_profile",
            "description": "Get the currently logged-in user's profile details.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_shipping_info",
            "description": "Retrieve the user's shipping address from the database.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_orders",
            "description": "Check the user's recent order history and status.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "proceed_to_checkout",
            "description": "Take the user to the checkout page to finish their purchase.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    }
]

ADMIN_TOOLS = [
    SEARCH_KNOWLEDGE_TOOL,
    {
        "type": "function",
        "function": {
            "name": "get_sales_summary",
            "description": "View financial reports.",
            "parameters": {
                "type": "object",
                "properties": {
                    "period": {"type": "string", "description": "e.g., 'total'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_inventory_status",
            "description": "Check stock levels.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string"}
                }
            }
        }
    }
]

available_functions = {
    "get_sales_summary": get_sales_summary,
    "get_inventory_status": get_inventory_status,
    "add_to_cart_logic": add_to_cart_logic,
    "search_knowledge": search_database_knowledge,
    "get_user_shipping_info": get_user_shipping_info,
    "proceed_to_checkout": proceed_to_checkout,
    "get_user_profile": get_user_profile,
    "get_user_orders": get_user_orders,
}

# --- PROMPTS ---

CUSTOMER_SYSTEM_PROMPT = """
You are the Cognivio Shopping Assistant. 
1. ALWAYS use tools to check the database for any product, USER PROFILE, or ORDER HISTORY mentioned.
2. If the user asks about themselves, their shipping info, their orders, or "credentials", use your tools to fetch their records relative to their current login.
3. Trust the database over your pre-training. 
"""

ADMIN_SYSTEM_PROMPT = """
You are the Cognivio ERP Manager. 
1. Use tools for reports and grounding.
2. Trust the database over pre-trained information.
"""

# --- AGENT LOGIC ---

def run_agentic_conversation(user_message, chat_history=[], role="customer", user_id=None):
    try:
        logger.info(f"--- Agentic Turn Start: {user_message} ---")
        if role == "admin":
            system_prompt = ADMIN_SYSTEM_PROMPT
            selected_tools = ADMIN_TOOLS
        else:
            system_prompt = CUSTOMER_SYSTEM_PROMPT
            selected_tools = CUSTOMER_TOOLS

        clean_history = []
        for msg in chat_history:
            # Map frontend 'sender' to OpenAI 'role'
            role_map = {"user": "user", "bot": "assistant", "assistant": "assistant"}
            m_role = role_map.get(msg.get('sender', msg.get('role', 'user')), 'user')
            m_content = msg.get('text', msg.get('content', ''))
            if m_content and m_role in ["user", "assistant"]:
                clean_history.append({"role": m_role, "content": m_content})

        messages = [m for m in clean_history if m.get('role') != 'system']
        messages.insert(0, {"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_message})

        detected_intent = "agentic_response"
        detected_entities = {"cart_items": []}

        logger.info("Calling initial LLM completion...")
        response = client_groq.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            tools=selected_tools,
            tool_choice="auto"
        )
        
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            logger.info(f"Model requested {len(tool_calls)} tool(s)")
            tool_calls_data = []
            for tc in tool_calls:
                tool_calls_data.append({
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                })
            
            messages.append({
                "role": "assistant",
                "tool_calls": tool_calls_data,
                "content": response_message.content or ""
            })
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                
                try:
                    function_args = json.loads(tool_call.function.arguments)
                except Exception as je:
                    logger.error(f"Failed to parse tool arguments: {tool_call.function.arguments}")
                    result = f"Error: Invalid arguments JSON: {je}"
                    continue

                if function_name == "search_knowledge":
                    function_args["role"] = role
                
                try:
                    function_to_call = available_functions.get(function_name)
                    if function_to_call:
                        logger.info(f"Executing tool: {function_name}")
                        sig = inspect.signature(function_to_call)
                        if "user_id" in sig.parameters and user_id:
                            function_args["user_id"] = user_id
                        
                        filtered_args = {k: v for k, v in function_args.items() if k in sig.parameters}
                        result = function_to_call(**filtered_args)
                        logger.info(f"Tool {function_name} matched and returned.")
                    else:
                        result = f"Error: Tool '{function_name}' not found."
                except Exception as te:
                    logger.error(f"Tool Execution Error ({function_name}): {te}")
                    result = f"Error during tool execution: {te}"

                # Update Intent/Entities based on tool behavior
                if function_name == "add_to_cart_logic":
                    detected_intent = "action_add_to_cart"
                    if isinstance(result, dict) and result.get("status") == "success":
                        detected_entities["cart_items"].append({
                            "title": result.get("title"),
                            "product_id": result.get("product_id")
                        })
                    elif isinstance(result, dict):
                        # Add even if not fully successful, frontend can handle
                        detected_entities["cart_items"].append({
                            "title": result.get("title", function_args.get("product_name")),
                            "product_id": result.get("product_id")
                        })
                elif function_name == "get_sales_summary":
                    detected_intent = "get_sales_summary"
                elif function_name == "proceed_to_checkout":
                    detected_intent = "action_checkout"
                elif function_name == "get_user_shipping_info":
                    detected_intent = "action_get_shipping"
                    if isinstance(result, dict) and result.get("status") == "success":
                        detected_entities["shipping_address"] = result.get("address")
                        result = result.get("message")
                    elif isinstance(result, dict):
                        result = result.get("message")
                elif function_name == "get_user_orders":
                    detected_intent = "action_get_orders"
                    if isinstance(result, dict):
                        result = result.get("message")

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": str(result),
                })

            logger.info("Calling final LLM completion with tool results...")
            final_response = client_groq.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages
            )
            final_content = final_response.choices[0].message.content
            logger.info("Turn completed successfully.")
            return final_content, messages, detected_intent, detected_entities
        
        else:
            logger.info("No tools needed. Returning text response.")
            final_content = response_message.content
            return final_content, messages, detected_intent, detected_entities

    except Exception as e:
        logger.error(f"CRITICAL AGENT ERROR: {e}")
        logger.error(traceback.format_exc())
        return f"I encountered a specific error: {str(e)}", chat_history, "error", {}

# --- HTTP SERVER ---

class AIServiceHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(content_length).decode('utf-8'))
        
        if self.path == '/assistant/process':
            try:
                user_msg = data.get('message', '')
                history = data.get('history', [])
                role = data.get('role', 'customer')
                user_id = data.get('user_id')
                
                answer, updated_history, intent, entities = run_agentic_conversation(user_msg, history, role, user_id=user_id)
                
                response_payload = {
                    "intent": intent,
                    "suggestion": answer,
                    "entities": entities,
                    "history": updated_history,
                    "role_active": role
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            except Exception as e:
                logger.error(f"HTTP Handler Error: {e}")
                self.send_response(500)
                self.end_headers()
        
        elif self.path == '/forecast/series':
            try:
                historical_data = data.get('historical_data', [])
                steps = data.get('steps', 6)
                
                forecasts, trend = calculate_forecast(historical_data, steps)
                
                response_payload = {
                    "forecasts": forecasts,
                    "trend": trend,
                    "status": "success"
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            except Exception as e:
                logger.error(f"Forecast Error: {e}")
                self.send_response(500)
                self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "Agentic AI Online"}).encode('utf-8'))

PORT = 8050
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), AIServiceHandler) as httpd:
    print(f"Cognivio Agentic Service running on port {PORT}")
    httpd.serve_forever()