import {Box, FormHelperText, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect } from 'react'
import Lottie from 'lottie-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { ecommerceOutlookAnimation, shoppingBagAnimation} from '../../../assets'
import {useDispatch,useSelector} from 'react-redux'
import { LoadingButton } from '@mui/lab';
import {selectLoggedInUser,loginAsync,selectLoginStatus, selectLoginError, clearLoginError, resetLoginStatus} from '../AuthSlice'
import { toast } from 'react-toastify'
import {MotionConfig, motion} from 'framer-motion'

export const Login = () => {
  const dispatch=useDispatch()
  const status=useSelector(selectLoginStatus)
  const error=useSelector(selectLoginError)
  const loggedInUser=useSelector(selectLoggedInUser)
  const {register,handleSubmit,reset,formState: { errors }} = useForm()
  const navigate=useNavigate()
  const theme=useTheme()
  const is900=useMediaQuery(theme.breakpoints.down(900))
  const is480=useMediaQuery(theme.breakpoints.down(480))
  
  // handles user redirection
  useEffect(()=>{
    if(loggedInUser && loggedInUser?.isVerified){
      navigate("/")
    }
    else if(loggedInUser && !loggedInUser?.isVerified){
      navigate("/verify-otp")
    }
  },[loggedInUser])

  // handles login error and toast them
  useEffect(()=>{
    if(error){
      toast.error(error.message)
    }
  },[error])

  // handles login status and dispatches reset actions to relevant states in cleanup
  useEffect(()=>{
    if(status==='fullfilled' && loggedInUser?.isVerified===true){
      toast.success(`Login successful`)
      reset()
    }
    return ()=>{
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  },[status])

  const handleLogin=(data)=>{
    const cred={...data}
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  return (
    <Stack width={'100vw'} height={'100vh'} justifyContent={'center'} alignItems={'center'} sx={{bgcolor: '#f4f7f7'}}>
        
        <Paper elevation={0} sx={{
            p: {xs: 4, sm: 6}, 
            borderRadius: '24px', 
            width: is480?"95vw":'32rem', 
            textAlign: 'center',
            boxShadow: '0px 20px 60px rgba(0,0,0,0.05)',
            border: '1px solid #e0e0e0'
        }}>
            <Stack spacing={3}>
                <Stack spacing={1} alignItems="center">
                    <Typography variant='h3' fontWeight={800} color="primary.main">
                        COGNIVIO <span style={{color: '#333'}}>STORE</span>
                    </Typography>
                    <Typography variant='body1' color='text.secondary' fontWeight={500}>
                        Welcome back! Please login to your account.
                    </Typography>
                </Stack>

                <Stack spacing={2.5} component={'form'} noValidate onSubmit={handleSubmit(handleLogin)} sx={{mt: 2}}>
                    <Box>
                        <TextField 
                            fullWidth 
                            variant="outlined"
                            {...register("email",{required:"Email is required",pattern:{value:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,message:"Enter a valid email"}})} 
                            label='Email Address'
                        />
                        {errors.email && <FormHelperText sx={{mt:0.5, px:1}} error>{errors.email.message}</FormHelperText>}
                    </Box>

                    <Box>
                        <TextField 
                            type='password' 
                            fullWidth 
                            variant="outlined"
                            {...register("password",{required:"Password is required"})} 
                            label='Password'
                        />
                        {errors.password && <FormHelperText sx={{mt:0.5, px:1}} error>{errors.password.message}</FormHelperText>}
                    </Box>
                    
                    <LoadingButton 
                        fullWidth 
                        loading={status==='pending'} 
                        type='submit' 
                        variant='contained' 
                        size="large"
                        sx={{
                            py: 1.5,
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            textTransform: 'none',
                            boxShadow: '0px 8px 20px rgba(51, 147, 147, 0.2)',
                            '&:hover': {
                                boxShadow: '0px 10px 25px rgba(51, 147, 147, 0.3)'
                            }
                        }}
                    >
                        Sign In
                    </LoadingButton>

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{pt: 1}}>
                        <Typography 
                            variant="body2" 
                            component={Link} 
                            to='/forgot-password' 
                            sx={{textDecoration: 'none', color: 'text.secondary', '&:hover': {color: 'primary.main', fontWeight: 600}}}
                        >
                            Forgot password?
                        </Typography>
                        <Typography 
                            variant="body2" 
                            component={Link} 
                            to='/signup' 
                            sx={{textDecoration: 'none', color: 'text.primary', fontWeight: 500, '&:hover': {color: 'primary.main'}}}
                        >
                            Don't have an account? <span style={{color: theme.palette.primary.main, fontWeight: 700}}>Register</span>
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    </Stack>
  )
}
