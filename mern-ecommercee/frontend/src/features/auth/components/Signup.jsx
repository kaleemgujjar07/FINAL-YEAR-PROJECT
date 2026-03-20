import { FormHelperText, Stack, Typography, useTheme, useMediaQuery, TextField, MenuItem, Select, InputLabel, FormControl, Paper, Grid } from '@mui/material';
import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { ecommerceOutlookAnimation } from '../../../assets';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import {
  selectLoggedInUser,
  signupAsync,
  selectSignupStatus,
  selectSignupError,
  clearSignupError,
  resetSignupStatus
} from '../AuthSlice';
import { toast } from 'react-toastify';
import { MotionConfig, motion } from 'framer-motion';
import { listTimeZones } from '../../../utils/countryList.js';

export const Signup = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectSignupStatus);
  const error = useSelector(selectSignupError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  // Redirect user after signup or verification
  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) navigate("/verify-otp");
    else if (loggedInUser) navigate("/");
  }, [loggedInUser]);

  // Show errors as toast
  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  // Reset form and status after successful signup
  useEffect(() => {
    if (status === 'fullfilled') {
      toast.success("Welcome! Verify your email to start shopping on mern-ecommerce.");
      reset();
    }
    return () => {
      dispatch(clearSignupError());
      dispatch(resetSignupStatus());
    };
  }, [status]);

  const handleSignup = (data) => {
    const cred = { ...data };
    delete cred.confirmPassword;
    dispatch(signupAsync(cred));
  };

  return (
    <Stack width={'100vw'} minHeight={'100vh'} justifyContent={'center'} alignItems={'center'} sx={{bgcolor: '#f4f7f7', py: 4}}>
        
        <Paper elevation={0} sx={{
            p: {xs: 4, sm: 6}, 
            borderRadius: '24px', 
            width: is480?"95vw":'40rem', 
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
                        Create your account to start shopping!
                    </Typography>
                </Stack>

                <Stack spacing={2.5} component={'form'} noValidate onSubmit={handleSubmit(handleSignup)} sx={{mt: 2}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" {...register("name", { required: "Username is required" })} label='Username' />
                            {errors.name && <FormHelperText error sx={{px:1}}>{errors.name.message}</FormHelperText>}
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small"
                                {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                                    message: "Enter a valid email"
                                }
                                })}
                                label='Email Address'
                            />
                            {errors.email && <FormHelperText error sx={{px:1}}>{errors.email.message}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField type='password' fullWidth size="small" {...register("password", {
                                required: "Password is required",
                                pattern: {
                                value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
                                message: "At least 8 chars, 1 uppercase, 1 lowercase, 1 number"
                                }
                            })} label='Password' />
                            {errors.password && <FormHelperText error sx={{px:1}}>{errors.password.message}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField type='password' fullWidth size="small" {...register("confirmPassword", {
                                required: "Confirm Password is required",
                                validate: (value, formValues) => value === formValues.password || "Passwords don't match"
                            })} label='Confirm Password' />
                            {errors.confirmPassword && <FormHelperText error sx={{px:1}}>{errors.confirmPassword.message}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth size="small" {...register("phone", { pattern: { value: /^[0-9]{7,15}$/, message: "Valid phone number required" } })} label='Phone Number' />
                            {errors.phone && <FormHelperText error sx={{px:1}}>{errors.phone.message}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" error={!!errors.country}>
                                <InputLabel id="country-label">Country</InputLabel>
                                <Select
                                labelId="country-label"
                                label="Country"
                                defaultValue=""
                                {...register("country", { required: "Country is required" })}
                                >
                                {listTimeZones.map((c) => (
                                    <MenuItem key={c.code} value={c.code}>
                                    {c.countryName}
                                    </MenuItem>
                                ))}
                                </Select>
                                {errors.country && <FormHelperText sx={{px:1}}>{errors.country.message}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth size="small" {...register("address", { required: "Address is required" })} label='Full Address' />
                            {errors.address && <FormHelperText error sx={{px:1}}>{errors.address.message}</FormHelperText>}
                        </Grid>
                    </Grid>

                    <LoadingButton 
                        fullWidth 
                        loading={status === 'pending'} 
                        type='submit' 
                        variant='contained' 
                        size="large"
                        sx={{
                            mt: 2,
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
                        Create Account
                    </LoadingButton>

                    <Stack direction="row" justifyContent="center" alignItems="center" sx={{pt: 1}}>
                        <Typography 
                            variant="body2" 
                            component={Link} 
                            to='/login' 
                            sx={{textDecoration: 'none', color: 'text.primary', fontWeight: 500, '&:hover': {color: 'primary.main'}}}
                        >
                            Already a member? <span style={{color: theme.palette.primary.main, fontWeight: 700}}>Sign In</span>
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    </Stack>
  );
};
