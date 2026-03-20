import { FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'; // Redesigned by Cognivio
import Box from '@mui/material/Box';


import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsAsync, resetProductFetchStatus, selectProductFetchStatus, selectProductIsFilterOpen, selectProductTotalResults, selectProducts, toggleFilters } from '../ProductSlice'
import { ProductCard } from './ProductCard'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/Add';
import { selectBrands } from '../../brands/BrandSlice'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { selectCategories } from '../../categories/CategoriesSlice'
import Pagination from '@mui/material/Pagination';
import { ITEMS_PER_PAGE } from '../../../constants'
import {createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems} from '../../wishlist/WishlistSlice'
import {selectLoggedInUser} from '../../auth/AuthSlice'
import {toast} from 'react-toastify'
import {banner1, banner2, banner3, banner4, loadingAnimation} from '../../../assets'
import { resetCartItemAddStatus, selectCartItemAddStatus } from '../../cart/CartSlice'
import { motion } from 'framer-motion'
import { ProductBanner } from './ProductBanner'
import ClearIcon from '@mui/icons-material/Clear';
import Lottie from 'lottie-react'
import { Recommendations } from './Recommendations';


const sortOptions=[
    {name:"Price: low to high",sort:"price",order:"asc"},
    {name:"Price: high to low",sort:"price",order:"desc"},
]


const bannerImages=[banner1,banner3,banner2,banner4]

export const ProductList = () => {
    const [filters,setFilters]=useState({})
    const [page,setPage]=useState(1)
    const [sort,setSort]=useState(null)
    const theme=useTheme()

    const is1200=useMediaQuery(theme.breakpoints.down(1200))
    const is800=useMediaQuery(theme.breakpoints.down(800))
    const is700=useMediaQuery(theme.breakpoints.down(700))
    const is600=useMediaQuery(theme.breakpoints.down(600))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is488=useMediaQuery(theme.breakpoints.down(488))

    const brands=useSelector(selectBrands)
    const categories=useSelector(selectCategories)
    const products=useSelector(selectProducts)
    const totalResults=useSelector(selectProductTotalResults)
    const loggedInUser=useSelector(selectLoggedInUser)

    const productFetchStatus=useSelector(selectProductFetchStatus)

    const wishlistItems=useSelector(selectWishlistItems)
    const wishlistItemAddStatus=useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus=useSelector(selectWishlistItemDeleteStatus)

    const cartItemAddStatus=useSelector(selectCartItemAddStatus)

    const isProductFilterOpen=useSelector(selectProductIsFilterOpen)

    const dispatch=useDispatch()

    const handleBrandFilters=(e)=>{

        const filterSet=new Set(filters.brand)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,brand:filterArray})
    }

    const handleCategoryFilters=(e)=>{
        const filterSet=new Set(filters.category)

        if(e.target.checked){filterSet.add(e.target.value)}
        else{filterSet.delete(e.target.value)}

        const filterArray = Array.from(filterSet);
        setFilters({...filters,category:filterArray})
    }

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    useEffect(()=>{
        setPage(1)
    },[totalResults])


    useEffect(()=>{
        const finalFilters={...filters}

        finalFilters['pagination']={page:page,limit:ITEMS_PER_PAGE}
        finalFilters['sort']=sort

        if(!loggedInUser?.isAdmin){
            finalFilters['user']=true
        }

        dispatch(fetchProductsAsync(finalFilters))
        
    },[filters,page,sort])


    const handleAddRemoveFromWishlist=(e,productId)=>{
        if(e.target.checked){
            const data={user:loggedInUser?._id,product:productId}
            dispatch(createWishlistItemAsync(data))
        }

        else if(!e.target.checked){
            const index=wishlistItems.findIndex((item)=>item.product._id===productId)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    useEffect(()=>{
        if(wishlistItemAddStatus==='fulfilled'){
            toast.success("Product added to wishlist")
        }
        else if(wishlistItemAddStatus==='rejected'){
            toast.error("Error adding product to wishlist, please try again later")
        }

    },[wishlistItemAddStatus])

    useEffect(()=>{
        if(wishlistItemDeleteStatus==='fulfilled'){
            toast.success("Product removed from wishlist")
        }
        else if(wishlistItemDeleteStatus==='rejected'){
            toast.error("Error removing product from wishlist, please try again later")
        }
    },[wishlistItemDeleteStatus])

    useEffect(()=>{
        if(cartItemAddStatus==='fulfilled'){
            toast.success("Product added to cart")
        }
        else if(cartItemAddStatus==='rejected'){
            toast.error("Error adding product to cart, please try again later")
        }
        
    },[cartItemAddStatus])

    useEffect(()=>{
        if(productFetchStatus==='rejected'){
            toast.error("Error fetching products, please try again later")
        }
    },[productFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetProductFetchStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])


    const handleFilterClose=()=>{
        dispatch(toggleFilters())
    }

  return (
    <>
    {/* filters side bar */}

    {
        productFetchStatus==='pending'?
        <Stack width={is500?"35vh":'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} marginRight={'auto'} marginLeft={'auto'}>
            <Lottie animationData={loadingAnimation}/>
        </Stack>
        :
        <>
        <motion.div 
            style={{position:"fixed",backgroundColor:"white",height:"100vh",padding:'2rem',overflowY:"scroll",width:is500?"100vw":"320px",zIndex:500, boxShadow: '10px 0px 30px rgba(0,0,0,0.05)'}}  
            variants={{show:{left:0},hide:{left:-500}}} 
            initial={'hide'} 
            transition={{ease:"easeInOut",duration:.5}} 
            animate={isProductFilterOpen===true?"show":"hide"}
        >

            {/* fitlers section */}
            <Stack mb={'5rem'} spacing={3}>
                    <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Typography variant='h5' fontWeight={700}>Filters</Typography>
                        <IconButton onClick={handleFilterClose}>
                            <ClearIcon />
                        </IconButton>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography variant='subtitle2' fontWeight={600} color="text.secondary" sx={{textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem'}}>Explore</Typography>
                        <Stack spacing={0.5}>
                            {['Totes', 'Backpacks', 'Travel Bags', 'Hip Bags', 'Laptop Sleeves'].map(item => (
                                <Typography key={item} sx={{cursor:"pointer", '&:hover': {color: 'primary.main'}, transition: '0.2s', py: 0.5}} variant='body2'>{item}</Typography>
                            ))}
                        </Stack>
                    </Stack>

                    {/* brand filters */}
                    <Stack spacing={1}>
                        <Typography variant='subtitle2' fontWeight={600} color="text.secondary" sx={{textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem'}}>Brands</Typography>
                        <FormGroup onChange={handleBrandFilters}>
                            {brands?.map((brand)=>(
                                <FormControlLabel 
                                    key={brand._id}
                                    sx={{ml: -0.5, '& .MuiTypography-root': {fontSize: '0.9rem'}}} 
                                    control={<Checkbox size="small" sx={{'&.Mui-checked': {color: 'primary.main'}}} />} 
                                    label={brand.name} 
                                    value={brand._id} 
                                />
                            ))}
                        </FormGroup>
                    </Stack>

                    {/* category filters */}
                    <Stack spacing={1}>
                        <Typography variant='subtitle2' fontWeight={600} color="text.secondary" sx={{textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem'}}>Categories</Typography>
                        <FormGroup onChange={handleCategoryFilters}>
                            {categories?.map((category)=>(
                                <FormControlLabel 
                                    key={category._id}
                                    sx={{ml: -0.5, '& .MuiTypography-root': {fontSize: '0.9rem'}}} 
                                    control={<Checkbox size="small" sx={{'&.Mui-checked': {color: 'primary.main'}}} />} 
                                    label={category.name} 
                                    value={category._id} 
                                />
                            ))}
                        </FormGroup>
                    </Stack>
            </Stack>

        </motion.div>
        
        <Stack spacing={4} sx={{py: 4, px: {xs: 2, md: 4}, maxWidth: '1400px', margin: '0 auto', width: '100%'}}>
            

                {/* banners section */}
                {
                    !is600 && 
                
                <Box sx={{width:"100%", height:is800?"300px":is1200?"400px":"500px", borderRadius: '24px', overflow: 'hidden', boxShadow: '0px 20px 40px rgba(0,0,0,0.1)'}}>
                    <ProductBanner images={bannerImages}/>
                </Box>
                }

                <Recommendations />

                {/* products */}
                <Stack spacing={4}>

                    <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                        <Typography variant="h4" fontWeight={800} sx={{fontSize: {xs: '1.5rem', md: '2.5rem'}}}>
                            Featured Products
                        </Typography>
                                        
                        <Box sx={{width: '12rem'}}>
                            <FormControl fullWidth variant="standard">
                                    <InputLabel id="sort-dropdown">Sort by</InputLabel>
                                    <Select
                                        labelId="sort-dropdown"
                                        label="Sort by"
                                        onChange={(e)=>setSort(e.target.value)}
                                        value={sort}
                                    >
                                        <MenuItem value={null}>Newest</MenuItem>
                                        {
                                            sortOptions.map((option)=>(
                                                <MenuItem key={option.name} value={option}>{option.name}</MenuItem>
                                            ))
                                        }
                                    </Select>
                            </FormControl>
                        </Box>
                    </Stack>

                    {/* product grid */}
                    <Grid container spacing={3} justifyContent="flex-start">
                        {
                            products.map((product)=>(
                                <Grid item key={product._id} xs={12} sm={6} md={4} lg={3} display="flex" justifyContent="center">
                                    <ProductCard id={product._id} title={product.title} thumbnail={product.thumbnail} brand={product.brand.name} price={product.price} handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}/>
                                </Grid>
                            ))
                        }
                    </Grid>
                    
                    {/* pagination */}
                    <Stack 
                        direction={is488 ? 'column' : 'row'} 
                        justifyContent="space-between" 
                        alignItems="center" 
                        spacing={2}
                        sx={{ mt: 6, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {(page-1)*ITEMS_PER_PAGE+1} to {page*ITEMS_PER_PAGE>totalResults?totalResults:page*ITEMS_PER_PAGE} of {totalResults} results
                        </Typography>
                        <Pagination 
                            color="primary"
                            size={is488?'medium':'large'} 
                            page={page}  
                            onChange={(e,page)=>setPage(page)} 
                            count={Math.ceil(totalResults/ITEMS_PER_PAGE)} 
                            variant="outlined" 
                            shape="rounded" 
                        />
                    </Stack>    
                
                </Stack>
                
        </Stack>
        </>
    }

    </>
  )
}
