import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { Footer } from '../features/footer/Footer'
import { Box, Container, Typography, Stack, Paper } from '@mui/material'

export const PrivacyPolicyPage = () => {
    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: '24px', border: '1px solid #e0e0e0', bgcolor: '#fdfdfd' }}>
                    <Stack spacing={4}>
                        <Typography variant="h3" fontWeight={800} color="primary.main" textAlign="center">
                            Privacy Policy
                        </Typography>
                        
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h6" fontWeight={700} gutterBottom>1. Information We Collect</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    At COGNIVIO STORE, we collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, phone number, and shipping address.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={700} gutterBottom>2. How We Use Your Information</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    We use your information to process orders, provide customer support, and improve our services. Your data is also used to synchronize with our ERP system for accurate invoicing and inventory management.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={700} gutterBottom>3. Data Security</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    We implement industry-standard security measures to protect your personal information. Your payment data is handled securely via encrypted gateways.
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="h6" fontWeight={700} gutterBottom>4. Your Rights</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.
                                </Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>
            </Container>
            <Footer />
        </>
    )
}
