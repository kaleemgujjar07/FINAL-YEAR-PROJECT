import { FormHelperText, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import Button from '@mui/material/Button';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { addToCartAsync,selectCartItems } from '../../cart/CartSlice';
import {motion} from 'framer-motion'

export const ProductCard = ({id,title,price,thumbnail,brand,stockQuantity,handleAddRemoveFromWishlist,isWishlistCard,isAdminCard}) => {


    const navigate=useNavigate()
    const wishlistItems=useSelector(selectWishlistItems)
    const loggedInUser=useSelector(selectLoggedInUser)
    const cartItems=useSelector(selectCartItems)
    const dispatch=useDispatch()
    let isProductAlreadyinWishlist=-1


    const theme=useTheme()
    const is1410=useMediaQuery(theme.breakpoints.down(1410))
    const is932=useMediaQuery(theme.breakpoints.down(932))
    const is752=useMediaQuery(theme.breakpoints.down(752))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is608=useMediaQuery(theme.breakpoints.down(608))
    const is488=useMediaQuery(theme.breakpoints.down(488))
    const is408=useMediaQuery(theme.breakpoints.down(408))

    isProductAlreadyinWishlist=wishlistItems.some((item)=>item.product._id===id)

    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)

    const handleAddToCart=async(e)=>{
        e.stopPropagation()
        const data={user:loggedInUser?._id,product:id}
        dispatch(addToCartAsync(data))
    }


  return (
    <motion.div whileHover={{y:-5}} transition={{duration:0.3}}>
    <Stack 
        component={Paper} 
        elevation={0} 
        variant="outlined"
        p={2} 
        width={is408?'auto':is488?"200px":is608?"240px":is752?"300px":is932?'240px':is1410?'300px':'340px'} 
        sx={{
            cursor:"pointer", 
            borderRadius: '16px',
            transition: 'all 0.3s ease',
            '&:hover': {
                boxShadow: '0px 10px 20px rgba(0,0,0,0.05)',
                borderColor: 'primary.main'
            }
        }} 
        onClick={()=>navigate(`/product-details/${id}`)}
    >

        {/* image display */}
        <Stack sx={{ bgcolor: '#f9f9f9', borderRadius: '12px', mb: 2, overflow: 'hidden' }}>
            <img width={'100%'} style={{aspectRatio:1/1,objectFit:"contain", padding: '1rem'}} height={'100%'}  src={thumbnail} alt={`${title} photo unavailable`} />
        </Stack>

        {/* lower section */}
        <Stack flex={2} justifyContent={'flex-end'} spacing={1}>

            <Stack>
                <Stack flexDirection={'row'} alignItems={'top'} justifyContent={'space-between'}>
                    <Typography variant='h6' sx={{fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.2, mb: 0.5}}>{title}</Typography>
                    {
                    !isAdminCard && 
                    <motion.div whileHover={{scale:1.2}} whileTap={{scale:0.9}}>
                        <Checkbox 
                            onClick={(e)=>e.stopPropagation()} 
                            checked={isProductAlreadyinWishlist} 
                            onChange={(e)=>handleAddRemoveFromWishlist(e,id)} 
                            icon={<FavoriteBorder sx={{fontSize: '1.4rem'}} />} 
                            checkedIcon={<Favorite sx={{color:'primary.main', fontSize: '1.4rem'}} />} 
                        />
                    </motion.div>
                    }
                </Stack>
                <Typography variant="body2" color={"text.secondary"} sx={{fontSize: '0.85rem'}}>{brand}</Typography>
            </Stack>

            <Stack sx={{flexDirection:"row",justifyContent:"space-between",alignItems:"center", mt: 1}}>
                <Typography variant="h6" color="primary.main" fontWeight={700}>${price}</Typography>
                {
                    !isWishlistCard? (isProductAlreadyInCart?
                    <Typography variant="caption" sx={{color: 'success.main', fontWeight: 600}}>In Cart</Typography>
                    :
                    (!isAdminCard &&
                    <Button 
                        variant="contained" 
                        size="small"
                        onClick={(e)=>handleAddToCart(e)} 
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            padding: '6px 12px',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: '0px 4px 12px rgba(51, 147, 147, 0.3)'
                            }
                        }}
                    >
                        Add
                    </Button>
                    ))
                    :''
                }
                
            </Stack>
            {
                stockQuantity<=20 && (
                    <FormHelperText sx={{fontSize:".8rem", fontWeight: 500}} error>
                        {stockQuantity===0 ? "Out of stock" : stockQuantity===1 ? "Only 1 left!" : `Only ${stockQuantity} left!`}
                    </FormHelperText>
                )
            }
        </Stack>
    </Stack> 
    </motion.div>
  )
}
