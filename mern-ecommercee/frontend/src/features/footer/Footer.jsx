import { Box, IconButton, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Stack } from '@mui/material'
import React from 'react'
import { QRCodePng, appStorePng, googlePlayPng ,facebookPng,instagramPng,twitterPng,linkedinPng} from '../../assets'
import SendIcon from '@mui/icons-material/Send';
import { MotionConfig, motion } from 'framer-motion';
import { Link } from 'react-router-dom';



export const Footer = () => {

    const theme=useTheme()
    const is700=useMediaQuery(theme.breakpoints.down(700))

    const linkStyles = {
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        '&:hover': {
            color: 'primary.main'
        },
        transition: '0.2s'
    }

  return (
    <Box sx={{
        bgcolor: "#111", 
        color: "white", 
        py: 3, 
        px: is700 ? 2 : 6,
        borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
        <Stack 
            direction={is700 ? "column" : "row"} 
            justifyContent="space-between" 
            alignItems="center" 
            spacing={is700 ? 2 : 0}
            sx={{maxWidth: '1400px', margin: '0 auto', width: '100%'}}
        >
            {/* Left: Branding with Link */}
            <Typography 
                variant='h6' 
                fontWeight={800} 
                color="primary.main" 
                component={Link} 
                to="/" 
                sx={{textDecoration: 'none'}}
            >
                COGNIVIO <span style={{color: 'white'}}>STORE</span>
            </Typography>

            {/* Center: Copyright */}
            <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.4)', textAlign: 'center'}}>
                &copy; {new Date().getFullYear()} COGNIVIO STORE. All rights reserved.
            </Typography>

            {/* Right: Essential Links */}
            <Stack 
                direction="row" 
                spacing={3} 
                justifyContent="center"
            >
                <Typography component={Link} to="/privacy-policy" sx={linkStyles}>Privacy Policy</Typography>
                <Typography component={Link} to="/faq" sx={linkStyles}>FAQ</Typography>
                <Typography component={Link} to="/contact" sx={linkStyles}>Contact</Typography>
            </Stack>
        </Stack>
    </Box>
  )
}
