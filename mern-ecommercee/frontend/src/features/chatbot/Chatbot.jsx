import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fab, Paper, Typography, IconButton, TextField, 
  Box, Avatar, InputAdornment, Chip, Portal, CircularProgress
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectProducts } from '../products/ProductSlice';
import { selectLoggedInUser } from '../auth/AuthSlice';
import { addToCartAsync } from '../cart/CartSlice';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';

const AI_SERVICE_URL = 'http://127.0.0.1:8050';

export const Chatbot = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const products = useSelector(selectProducts);
  const user = useSelector(selectLoggedInUser);
  
  useEffect(() => {
    if (user) {
      console.log("Chatbot: User recognized as:", user.name, "ID:", user._id);
    } else {
      console.log("Chatbot: No user logged in.");
    }
  }, [user]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm your Cognivio AI Voice Assistant. You can speak to me or type! 🚀" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastFetchedAddress, setLastFetchedAddress] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast.error("Speech recognition not supported in this browser.");
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping, scrollToBottom]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = useCallback(async (textOverride = null) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    if (typeof textOverride !== 'string') setInput("");
    setIsTyping(true);

    try {
      // 1. Get Intent from AI Service
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/assistant/process`, {
        message: userMessage,
        context: 'ecommerce',
        history: messages,
        user_id: user?._id
      });

      const { intent, suggestion, entities } = aiResponse.data;
      let replyText = suggestion;
      let showCheckoutBtn = false;

      // Track fetched address for auto-fill
      if (entities?.shipping_address) {
        setLastFetchedAddress(entities.shipping_address);
      }

      // 2. Autonomous Action Fulfillment - Multi-item Support
      if (intent === 'action_add_to_cart' || (entities?.cart_items && entities.cart_items.length > 0)) {
        const cartItems = entities?.cart_items || [];
        // If the LLM returned a single item the old way (fallback)
        if (cartItems.length === 0 && (entities.found_product_id || entities.product_keyword)) {
            cartItems.push({ 
                product_id: entities.found_product_id, 
                title: entities.product_keyword 
            });
        }

        if (user && cartItems.length > 0) {
          let addedCount = 0;
          for (const item of cartItems) {
            let bestMatch = null;
            if (item.product_id) {
              bestMatch = products.find(p => p._id === item.product_id);
            }
            
            if (!bestMatch && item.title) {
              const titleLower = item.title.toLowerCase();
              bestMatch = products.find(p => p.title.toLowerCase().includes(titleLower) || titleLower.includes(p.title.toLowerCase()));
            }

            if (bestMatch) {
              try {
                await dispatch(addToCartAsync({ product: bestMatch._id, user: user._id })).unwrap();
                addedCount++;
                toast.success(`Agent added: ${bestMatch.title}`, { position: "bottom-right", autoClose: 2000 });
              } catch (err) {
                console.error("Failed to add item:", bestMatch.title, err);
              }
            }
          }

          if (addedCount > 0) {
            showCheckoutBtn = true;
            // Success message is already in 'suggestion' from AI, but we can refine it
            if (addedCount > 1) replyText = `I've added those ${addedCount} items to your cart! 🛒`;
          }
        } else if (!user) {
          replyText = "I'd love to help with your cart, but you need to log in first!";
        }
      }
      
      // Separate Intent: Checkout Transition (can happen alongside or after addition)
      if (intent === 'action_checkout') {
          replyText = suggestion || "Sure! Redirecting you to the checkout page...";
          setTimeout(() => {
              navigate('/checkout', { state: { autoAddress: entities?.shipping_address || lastFetchedAddress } });
              setIsOpen(false);
          }, 2000);
      }
      else if (intent === 'action_search_product') {
          replyText = suggestion || "Searching for products for you...";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: replyText, showCheckoutBtn: showCheckoutBtn }]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm having a little trouble connecting to my brain (AI Service). Please try again later!" }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, user, products, dispatch, navigate]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: 90,
              right: 24,
              zIndex: 999999,
            }}
          >
            <Paper 
              elevation={12} 
              sx={{ 
                width: { xs: '90vw', sm: 380 }, 
                height: 550, 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: '24px',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
                color: 'white', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: '#00ed64', width: 32, height: 32 }}>
                    <SmartToyIcon fontSize="small" sx={{color: '#001e2b'}} />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>Cognivio AI Agent</Typography>
                </Box>
                <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Chat Area */}
              <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.map((msg, index) => (
                  <Box key={index} sx={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <Paper sx={{ 
                      p: 1.5, 
                      bgcolor: msg.sender === 'user' ? '#1e3c72' : '#f0f2f5',
                      color: msg.sender === 'user' ? 'white' : 'black',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                    }}>
                      <Typography variant="body2">{msg.text}</Typography>
                      {msg.showCheckoutBtn && (
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          fullWidth 
                          startIcon={<ShoppingCartCheckoutIcon />}
                          onClick={() => {
                            navigate('/checkout', { state: { autoAddress: lastFetchedAddress } });
                            setIsOpen(false);
                          }}
                          sx={{ mt: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                        >
                          Proceed to Checkout
                        </Button>
                      )}
                    </Paper>
                  </Box>
                ))}
                {isTyping && <CircularProgress size={20} sx={{ ml: 2 }} />}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type or click mic..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                         <IconButton onClick={isListening ? () => {} : startListening} color={isListening ? "secondary" : "default"}>
                           {isListening ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><MicIcon /></motion.div> : <MicIcon />}
                         </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <IconButton color="primary" onClick={() => handleSend()}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999999 }}>
        <Fab color="primary" onClick={toggleChat} sx={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Box>
    </Portal>
  );
};
