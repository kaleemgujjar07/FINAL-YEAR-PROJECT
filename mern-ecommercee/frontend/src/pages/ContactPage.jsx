import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { Footer } from '../features/footer/Footer'
import { Container, Typography, Stack, Box, TextField, Button, Paper, Grid } from '@mui/material'
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export const ContactPage = () => {
    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Stack spacing={6}>
                    <Typography variant="h3" fontWeight={800} color="primary.main" textAlign="center">
                        Contact Us
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={5}>
                            <Stack spacing={4}>
                                <Typography variant="h5" fontWeight={700}>Get in Touch</Typography>
                                <Typography color="text.secondary">
                                    Have a question or need assistance? Our team is here to help you with anything you need.
                                </Typography>

                                <Stack spacing={3}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1.5, bgcolor: 'rgba(51, 147, 147, 0.1)', borderRadius: '12px' }}>
                                            <MailOutlineIcon color="primary" />
                                        </Box>
                                        <Stack>
                                            <Typography variant="body2" fontWeight={700}>Email</Typography>
                                            <Typography variant="body2" color="text.secondary">support@cognivio.com</Typography>
                                        </Stack>
                                    </Stack>

                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1.5, bgcolor: 'rgba(51, 147, 147, 0.1)', borderRadius: '12px' }}>
                                            <PhoneInTalkIcon color="primary" />
                                        </Box>
                                        <Stack>
                                            <Typography variant="body2" fontWeight={700}>Phone</Typography>
                                            <Typography variant="body2" color="text.secondary">+1 (555) 123-4567</Typography>
                                        </Stack>
                                    </Stack>

                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ p: 1.5, bgcolor: 'rgba(51, 147, 147, 0.1)', borderRadius: '12px' }}>
                                            <LocationOnIcon color="primary" />
                                        </Box>
                                        <Stack>
                                            <Typography variant="body2" fontWeight={700}>Address</Typography>
                                            <Typography variant="body2" color="text.secondary">11th Main Street, New York, NY 10001</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', border: '1px solid #e0e0e0', bgcolor: '#fdfdfd' }}>
                                <Stack spacing={3}>
                                    <Typography variant="h6" fontWeight={700}>Send us a message</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="First Name" variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField fullWidth label="Last Name" variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Email Address" variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth label="Subject" variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField fullWidth multiline rows={4} label="Message" variant="outlined" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button variant="contained" size="large" fullWidth sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700 }}>
                                                Send Message
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
            <Footer />
        </>
    )
}
