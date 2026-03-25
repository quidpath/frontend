'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import EmailIcon from '@mui/icons-material/Email';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CodeIcon from '@mui/icons-material/Code';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PageHeader from '@/components/ui/PageHeader';
import ContactSupportModal from './modals/ContactSupportModal';
import UserGuideModal from './modals/UserGuideModal';
import FAQModal from './modals/FAQModal';

export default function HelpCenter() {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  const quickLinks = [
    {
      icon: <MenuBookIcon />,
      title: 'User Guide',
      description: 'Complete documentation for all modules',
      action: () => setGuideModalOpen(true),
      color: '#4CAF50',
    },
    {
      icon: <QuizIcon />,
      title: 'FAQs',
      description: 'Answers to frequently asked questions',
      action: () => setFaqModalOpen(true),
      color: '#2196F3',
    },
    {
      icon: <EmailIcon />,
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: () => setContactModalOpen(true),
      color: '#FF9800',
    },
    {
      icon: <VideoLibraryIcon />,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      action: () => window.open('https://youtube.com/@quidpath', '_blank'),
      color: '#E91E63',
    },
    {
      icon: <CodeIcon />,
      title: 'API Documentation',
      description: 'Developer resources and API reference',
      action: () => window.open('/api/docs', '_blank'),
      color: '#9C27B0',
    },
    {
      icon: <FeedbackIcon />,
      title: 'Send Feedback',
      description: 'Share your ideas and suggestions',
      action: () => setContactModalOpen(true),
      color: '#00BCD4',
    },
  ];

  const popularTopics = [
    { title: 'Creating your first invoice', category: 'Accounting' },
    { title: 'Setting up employees', category: 'HRM' },
    { title: 'Processing POS sales', category: 'POS' },
    { title: 'Managing inventory', category: 'Inventory' },
    { title: 'Tracking deals in CRM', category: 'CRM' },
    { title: 'Running payroll', category: 'HRM' },
    { title: 'Generating reports', category: 'Analytics' },
    { title: 'User permissions', category: 'Settings' },
  ];

  return (
    <Box>
      <PageHeader
        title="Help & Support"
        subtitle="Get the help you need to make the most of QuidPath"
        breadcrumbs={[{ label: 'Home', href: '/dashboard' }, { label: 'Help' }]}
        icon={<HelpIcon sx={{ fontSize: 26 }} />}
        color="#FF9800"
      />

      <Grid container spacing={2.5}>
        {/* Quick Access Cards */}
        {quickLinks.map((link, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={link.action}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: link.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {link.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {link.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {link.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Popular Topics */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Popular Topics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Quick access to commonly searched help topics
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {popularTopics.map((topic, idx) => (
                  <Chip
                    key={idx}
                    label={topic.title}
                    onClick={() => setFaqModalOpen(true)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Still need help?
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Our support team is here to help you. Send us a message and we'll get back to you as soon as possible at quidpath@gmail.com
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setContactModalOpen(true)}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                    startIcon={<EmailIcon />}
                  >
                    Contact Support
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modals */}
      <ContactSupportModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      <UserGuideModal open={guideModalOpen} onClose={() => setGuideModalOpen(false)} />
      <FAQModal open={faqModalOpen} onClose={() => setFaqModalOpen(false)} />
    </Box>
  );
}
