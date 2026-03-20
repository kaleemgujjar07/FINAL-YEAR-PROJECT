import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Grid, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectProducts } from '../ProductSlice';
import { ProductCard } from './ProductCard';
import { motion } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';

export const Recommendations = () => {
    const [aiRecommendedTitles, setAiRecommendedTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const dispatch = useDispatch();
    
    const products = useSelector(selectProducts);
    const wishlistItems = useSelector(selectWishlistItems);
    const loggedInUser = useSelector(selectLoggedInUser);
    
    const AI_SERVICE_URL = 'http://localhost:8050';

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.post(`${AI_SERVICE_URL}/recommendations`, {
                    user_id: 'current_user',
                    product_history: ['laptop', 'office desk'] // Mock history
                });
                setAiRecommendedTitles(response.data.recommendations);
            } catch (err) {
                console.error('Failed to fetch recommendations:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    const handleAddRemoveFromWishlist = (e, productId) => {
        if (e.target.checked) {
            const data = { user: loggedInUser?._id, product: productId };
            dispatch(createWishlistItemAsync(data));
        } else if (!e.target.checked) {
            const index = wishlistItems.findIndex((item) => item.product._id === productId);
            if (index !== -1) {
                dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
            }
        }
    };

    // Map AI suggested titles to real products from Redux
    const recommendedProducts = products.filter(product => 
        (aiRecommendedTitles || []).some(title => 
            product.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(product.title.toLowerCase())
        )
    ).slice(0, 4);

    // Fallback: If no direct matches, show some default products as "AI Picks"
    const displayProducts = recommendedProducts.length > 0 ? recommendedProducts : products.slice(0, 4);

    if (loading || displayProducts.length === 0) return null;

    return (
        <Box sx={{ width: '100%', py: 4, px: { xs: 1, md: 2 }, maxWidth: '1400px', margin: '0 auto' }}>
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                    <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#22075e' }}>
                        AI Smart Recommendations
                    </Typography>
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ mt: -1, mb: 1 }}>
                    Personalized products intelligently selected for your unique style.
                </Typography>

                <Grid container spacing={2} justifyContent="flex-start">
                    {displayProducts.map((product) => (
                        <Grid item key={product._id} xs={12} sm={6} md={4} lg={3} display="flex" flexDirection="column" alignItems="center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                            >
                                <ProductCard 
                                    id={product._id} 
                                    title={product.title} 
                                    thumbnail={product.thumbnail} 
                                    brand={product.brand?.name} 
                                    price={product.price} 
                                    stockQuantity={product.stockQuantity}
                                    handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                                />
                            </motion.div>
                            <Box sx={{ mt: 1.5 }}>
                                <Typography variant="caption" sx={{ bgcolor: 'rgba(51, 147, 147, 0.1)', color: 'primary.main', px: 2, py: 0.7, borderRadius: '20px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                    ✨ AI Pick
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );
};
