import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Chip, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';



export const Navbar=({isProductList=false})=> {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userInfo=useSelector(selectUserInfo)
  const cartItems=useSelector(selectCartItems)
  const loggedInUser=useSelector(selectLoggedInUser)
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const theme=useTheme()
  const is480=useMediaQuery(theme.breakpoints.down(480))

  const wishlistItems=useSelector(selectWishlistItems)
  const isProductFilterOpen=useSelector(selectProductIsFilterOpen)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters=()=>{
    dispatch(toggleFilters())
  }

  const settings = [
    {name:"Home",to:"/"},
    {name:'Profile',to:loggedInUser?.isAdmin?"/admin/profile":"/profile"},
    {name:loggedInUser?.isAdmin?'Orders':'My orders',to:loggedInUser?.isAdmin?"/admin/orders":"/orders"},
    {name:'Logout',to:"/logout"},
  ];

  return (
    <AppBar position="sticky" sx={{backgroundColor:"white",boxShadow:"0px 2px 4px rgba(0,0,0,0.05)",color:"text.primary", borderBottom: `1px solid ${theme.palette.divider}`}}>
        <Toolbar sx={{p:1,height:"4.5rem",display:"flex",justifyContent:"space-between", maxWidth:"1200px", margin:"0 auto", width:"100%"}}>

          <Typography variant="h5" noWrap component={Link} to="/" sx={{ mr: 2, display: { xs: 'flex', md: 'flex' }, fontWeight: 800, color: 'primary.main', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            COGNIVIO
            <Typography component="span" variant="h5" sx={{color:'text.primary', fontWeight: 800, ml:0.5}}>STORE</Typography>
          </Typography>



          <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
            
            <Stack sx={{flexDirection:"row",columnGap:"0.5rem",alignItems:"center",justifyContent:"center", mr:2}}>

            {
              !loggedInUser?.isAdmin &&
                  <Stack>
                      <Badge badgeContent={wishlistItems?.length} color='primary'>
                          <IconButton component={Link} to={"/wishlist"} sx={{color: 'text.secondary', '&:hover': {color: 'primary.main'}}}><FavoriteBorderIcon /></IconButton>
                      </Badge>
                  </Stack>
            }
            
            {
            cartItems?.length>0 && 
            <Badge  badgeContent={cartItems.length} color='primary'>
              <IconButton onClick={()=>navigate("/cart")} sx={{color: 'text.secondary', '&:hover': {color: 'primary.main'}}}>
                <ShoppingCartOutlinedIcon />
                </IconButton>
            </Badge>
            }
            
            {
              isProductList && <IconButton onClick={handleToggleFilters} sx={{color: isProductFilterOpen ? "primary.main" : "text.secondary"}}><TuneIcon /></IconButton>
            }
            
            </Stack>

            <Stack flexDirection={'row'} alignItems={'center'} columnGap={1.5} sx={{cursor:'pointer'}} onClick={handleOpenUserMenu}>
                <Typography variant='body1' fontWeight={500} sx={{display: {xs: 'none', sm: 'block'}}}>
                    {userInfo?.name}
                </Typography>
                <Tooltip title="Open settings">
                  <IconButton sx={{ p: 0 }}>
                    <Avatar alt={userInfo?.name} src="null" sx={{width: 35, height: 35, bgcolor: 'primary.main', fontSize: '1rem'}} />
                  </IconButton>
                </Tooltip>
            </Stack>

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                  sx: {
                      borderRadius: '12px',
                      boxShadow: '0px 10px 25px rgba(0,0,0,0.1)',
                      minWidth: '180px',
                      mt: 1.5
                  }
              }}
            >

              {
                loggedInUser?.isAdmin && 
              
                <MenuItem  onClick={handleCloseUserMenu}>
                  <Typography component={Link} color={'text.primary'} sx={{textDecoration:"none", fontWeight: 500}} to="/admin/add-product" textAlign="center">Add new Product</Typography>
                </MenuItem>
              
              }
              {settings.map((setting) => (
                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                  <Typography component={Link} color={'text.primary'} sx={{textDecoration:"none", fontWeight: 500}} to={setting.to} textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Toolbar>
    </AppBar>
  );
}