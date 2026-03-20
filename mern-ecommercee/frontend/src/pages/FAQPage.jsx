import React from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { Footer } from '../features/footer/Footer'
import { Container, Typography, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export const FAQPage = () => {
    const faqs = [
        {
            q: "How can I track my order?",
            a: "Once your order is shipped, you will receive an email with a tracking number and a link to track your package."
        },
        {
            q: "What is your return policy?",
            a: "We offer a 30-day return policy for most items. Products must be in their original packaging and condition."
        },
        {
            q: "Do you ship internationally?",
            a: "Yes, COGNIVIO STORE ships to over 50 countries worldwide. Shipping costs and delivery times vary by location."
        },
        {
            q: "How can I contact customer support?",
            a: "You can reach our support team through the Contact Us page, or by emailing support@cognivio.com."
        }
    ]

    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Stack spacing={4}>
                    <Typography variant="h3" fontWeight={800} color="primary.main" textAlign="center">
                        Frequently Asked Questions
                    </Typography>
                    
                    <Stack spacing={2}>
                        {faqs.map((faq, index) => (
                            <Accordion key={index} sx={{ borderRadius: '12px !important', '&:before': { display: 'none' }, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
                                    <Typography fontWeight={700}>{faq.q}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ borderTop: '1px solid #eee' }}>
                                    <Typography color="text.secondary">{faq.a}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Stack>
                </Stack>
            </Container>
            <Footer />
        </>
    )
}
