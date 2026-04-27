'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InventoryIcon from '@mui/icons-material/Inventory2';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { usePlans } from '@/hooks/useBilling';

const MODULES = [
  {
    icon: <AccountBalanceIcon sx={{ fontSize: 28 }} />,
    label: 'Finance',
    desc: 'Full-cycle financial management, invoices, journals, and real-time reporting.',
    path: '/finance',
    color: '#2E7D32',
  },
  {
    icon: <InventoryIcon sx={{ fontSize: 28 }} />,
    label: 'Inventory',
    desc: 'Multi-warehouse stock control, valuation, and movement tracking.',
    path: '/inventory',
    color: '#1565C0',
  },
  {
    icon: <PointOfSaleIcon sx={{ fontSize: 28 }} />,
    label: 'Point of Sale',
    desc: 'Fast, intuitive retail and transaction management.',
    path: '/pos',
    color: '#6A1B9A',
  },
  {
    icon: <PeopleAltIcon sx={{ fontSize: 28 }} />,
    label: 'CRM',
    desc: 'Contact management, pipeline tracking, and campaign automation.',
    path: '/crm',
    color: '#00695C',
  },
  {
    icon: <BadgeIcon sx={{ fontSize: 28 }} />,
    label: 'HR Management',
    desc: 'Employee lifecycle, payroll, leaves, attendance, and performance.',
    path: '/hrm',
    color: '#C62828',
  },
  {
    icon: <FolderOpenIcon sx={{ fontSize: 28 }} />,
    label: 'Projects',
    desc: 'End-to-end project delivery, task management, and time tracking.',
    path: '/projects',
    color: '#E65100',
  },
];

const FEATURES = [
  {
    icon: <SpeedIcon />,
    label: 'Real-Time Performance',
    desc: 'Sub-100ms data loading with intelligent caching and instant UI feedback.',
  },
  {
    icon: <SecurityIcon />,
    label: 'Enterprise Security',
    desc: 'JWT-based auth, role-based permissions, and CSP-compatible architecture.',
  },
  {
    icon: <IntegrationInstructionsIcon />,
    label: 'Microservice Architecture',
    desc: 'Each module is a dedicated service — scale independently as your business grows.',
  },
  {
    icon: <AnalyticsIcon />,
    label: 'Unified Analytics',
    desc: 'Cross-module dashboards and reports for full business visibility.',
  },
  {
    icon: <AutorenewIcon />,
    label: 'Automated Workflows',
    desc: 'Trigger actions across modules — from CRM deals to accounting invoices.',
  },
  {
    icon: <SupportAgentIcon />,
    label: 'Dedicated Support',
    desc: 'Priority support with SLA guarantees and onboarding specialists.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'QuidPath replaced three separate tools and reduced our operational overhead by 40%.',
    name: 'Sarah Mitchell',
    title: 'CFO, Meridian Holdings',
    avatar: 'SM',
  },
  {
    quote: 'The inventory module alone saved us from constant stockouts. The UI is genuinely beautiful.',
    name: 'Kwame Asante',
    title: 'Operations Director, AfroBrand',
    avatar: 'KA',
  },
  {
    quote: 'We onboarded 200 employees in 2 days. The HRM module is the best we have ever used.',
    name: 'Priya Nair',
    title: 'Head of HR, NovaTech',
    avatar: 'PN',
  },
];

function LandingHeader() {
  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(67,160,71,0.35)',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1 }}>Q</Typography>
            </Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              QuidPath
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {['Features', 'Modules', 'Pricing', 'About'].map((item) => (
              <Typography
                key={item}
                variant="body2"
                fontWeight={500}
                sx={{
                  cursor: 'pointer',
                  color: 'text.secondary',
                  transition: 'color 0.15s ease',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              variant="text" 
              size="small" 
              component={Link}
              href="/login"
              sx={{ color: 'text.secondary' }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              size="small"
              component={Link}
              href="/dashboard"
              sx={{
                background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                boxShadow: '0 2px 8px rgba(67,160,71,0.3)',
              }}
            >
              Launch ERP
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function HeroSection() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `
          radial-gradient(ellipse 80% 50% at 50% -10%, ${alpha('#43A047', 0.12)}, transparent),
          radial-gradient(ellipse 60% 40% at 80% 60%, ${alpha('#1ABC9C', 0.07)}, transparent),
          #FAFAFA
        `,
        pt: 10,
        pb: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      {[
        { size: 400, top: -100, right: -80, opacity: 0.04 },
        { size: 240, top: 200, right: 60, opacity: 0.06 },
        { size: 180, bottom: 40, left: -40, opacity: 0.05 },
      ].map((d, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #43A047, #1ABC9C)',
            opacity: d.opacity,
            top: d.top,
            right: d.right,
            bottom: d.bottom,
            left: d.left,
            pointerEvents: 'none',
          }}
        />
      ))}

      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <Chip
            label="Now with AI-powered analytics"
            size="small"
            sx={{
              mb: 3,
              backgroundColor: alpha('#43A047', 0.1),
              color: '#2E7D32',
              fontWeight: 600,
              fontSize: '0.75rem',
              border: `1px solid ${alpha('#43A047', 0.2)}`,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '3.75rem', lg: '4.5rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              mb: 3,
              background: 'linear-gradient(135deg, #0F172A 0%, #1B5E20 50%, #0F172A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The ERP that grows
            <br />
            with your business
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            fontWeight={400}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 5,
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.2rem' },
            }}
          >
            One platform connecting accounting, inventory, CRM, HR, POS, and projects —
            built for scale, designed for clarity.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/dashboard"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                boxShadow: '0 4px 20px rgba(67,160,71,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388E3C, #1B5E20)',
                  boxShadow: '0 6px 24px rgba(67,160,71,0.45)',
                },
              }}
            >
              Open Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/contact"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { borderColor: 'primary.main', backgroundColor: alpha('#43A047', 0.04) },
              }}
            >
              Contact Us
            </Button>
          </Stack>

          {/* Stats row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: { xs: 3, md: 6 },
            }}
          >
            {[
              { value: '6', label: 'Integrated modules' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<100ms', label: 'Avg. API response' },
              { value: 'SOC 2', label: 'Compliance ready' },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} color="primary.dark" sx={{ lineHeight: 1.1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function ModulesSection() {
  return (
    <Box sx={{ py: 10, backgroundColor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: '0.1em' }}>
            PLATFORM MODULES
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2 }}>
            Everything in one place
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
            Each module is a battle-tested service — deeply integrated yet independently scalable.
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          {MODULES.map((mod) => (
            <Grid key={mod.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                component={Link}
                href={mod.path}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    borderColor: alpha(mod.color, 0.4),
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: mod.color,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&:hover::after': { opacity: 1 },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      backgroundColor: alpha(mod.color, 0.1),
                      color: mod.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {mod.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {mod.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {mod.desc}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, color: mod.color }}>
                    <Typography variant="caption" fontWeight={600}>
                      Open module
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function FeaturesSection() {
  return (
    <Box
      sx={{
        py: 10,
        background: `linear-gradient(180deg, ${alpha('#43A047', 0.03)} 0%, transparent 100%)`,
        backgroundColor: 'grey.50',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: '0.1em' }}>
            WHY QUIDPATH
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
            Built for serious operations
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {FEATURES.map((feat) => (
            <Grid key={feat.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    backgroundColor: alpha('#43A047', 0.1),
                    color: 'primary.dark',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {feat.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '1rem' }}>
                  {feat.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {feat.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function PricingSection() {
  const { data: allPlans, isLoading } = usePlans();
  const [selectedType, setSelectedType] = useState<'individual' | 'organization'>('organization');

  // Filter out testing plans and separate by type
  const individualPlans = (allPlans || []).filter(
    (p: any) => p.plan_type === 'individual' && !p.tier.toLowerCase().includes('test')
  );
  const organizationPlans = (allPlans || []).filter(
    (p: any) => p.plan_type === 'organization' && !p.tier.toLowerCase().includes('test')
  );

  // Helper to format plan features from limits
  const formatFeatures = (plan: any): string[] => {
    const features: string[] = [];
    
    // User limits
    if (plan.included_users) {
      features.push(
        plan.max_users 
          ? `${plan.included_users}-${plan.max_users} users` 
          : `Up to ${plan.included_users} users`
      );
    }
    
    // Add key features based on tier
    const tier = plan.tier.toLowerCase();
    if (tier.includes('starter') || tier.includes('basic')) {
      features.push('Core modules access');
      features.push('Email support');
      features.push('Basic reporting');
      features.push('Mobile app access');
    } else if (tier.includes('growth') || tier.includes('professional')) {
      features.push('All modules access');
      features.push('Priority support');
      features.push('Advanced analytics');
      features.push('API access');
      features.push('Custom workflows');
    } else if (tier.includes('enterprise') || tier.includes('premium')) {
      features.push('Unlimited everything');
      features.push('24/7 dedicated support');
      features.push('Custom integrations');
      features.push('SLA guarantees');
      features.push('Onboarding specialist');
      features.push('White-label options');
    }
    
    // Additional user pricing
    if (plan.additional_user_price > 0) {
      features.push(`+KES ${plan.additional_user_price}/user`);
    }
    
    return features.length > 0 ? features : ['Full platform access', 'Email support', 'Regular updates'];
  };

  // Determine which plans to display
  const displayPlans = selectedType === 'organization' ? organizationPlans : individualPlans;
  const signupPath = selectedType === 'organization' ? '/signup/corporate' : '/signup/individual';

  return (
    <Box sx={{ py: 10, backgroundColor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: '0.1em' }}>
            PRICING
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2 }}>
            Simple, transparent pricing
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 4 }}>
            Choose the plan that fits your needs. All plans include a 30-day free trial.
          </Typography>

          {/* Plan Type Toggle */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: 2,
              backgroundColor: 'grey.100',
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Button
              variant={selectedType === 'individual' ? 'contained' : 'text'}
              onClick={() => setSelectedType('individual')}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                ...(selectedType === 'individual'
                  ? {
                      background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(67,160,71,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388E3C, #1B5E20)',
                      },
                    }
                  : {
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'grey.200',
                      },
                    }),
              }}
            >
              Individual
            </Button>
            <Button
              variant={selectedType === 'organization' ? 'contained' : 'text'}
              onClick={() => setSelectedType('organization')}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                ...(selectedType === 'organization'
                  ? {
                      background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(67,160,71,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388E3C, #1B5E20)',
                      },
                    }
                  : {
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'grey.200',
                      },
                    }),
              }}
            >
              Organization
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ height: 480 }}>
                    <CardContent>
                      <Skeleton height={28} width="60%" sx={{ mb: 1 }} />
                      <Skeleton height={52} width="40%" sx={{ mb: 2 }} />
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} height={16} sx={{ mb: 1 }} />
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : displayPlans.length === 0
            ? (
                <Grid size={{ xs: 12 }}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No {selectedType} plans available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please contact sales for pricing information.
                      </Typography>
                      <Button
                        variant="outlined"
                        component={Link}
                        href="/contact"
                        sx={{ mt: 3 }}
                      >
                        Contact Sales
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )
            : displayPlans.map((plan: any, index: number) => {
                const isHighlighted = index === 1 || plan.tier.toLowerCase().includes('growth') || plan.tier.toLowerCase().includes('professional');
                const features = formatFeatures(plan);
                const maxFeatures = 6; // Limit features to prevent overflow
                
                return (
                  <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        height: '100%',
                        minHeight: 500,
                        maxHeight: 540,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        ...(isHighlighted
                          ? {
                              border: '2px solid',
                              borderColor: 'primary.main',
                              boxShadow: `0 8px 32px ${alpha('#43A047', 0.18)}`,
                              transform: { md: 'scale(1.02)' },
                              zIndex: 1,
                            }
                          : {
                              border: '1px solid',
                              borderColor: 'divider',
                            }),
                        '&:hover': {
                          transform: isHighlighted ? { md: 'scale(1.04)' } : 'translateY(-4px)',
                          boxShadow: isHighlighted 
                            ? `0 12px 40px ${alpha('#43A047', 0.25)}` 
                            : '0 8px 24px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      {/* Top border for highlighted card */}
                      {isHighlighted && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: 'linear-gradient(90deg, #43A047, #2E7D32)',
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 3, pb: 2, flex: 1, display: 'flex', flexDirection: 'column', pt: isHighlighted ? 4 : 3 }}>
                        {/* Most Popular Badge */}
                        {isHighlighted && (
                          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                            <Chip
                              label="Most Popular"
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                height: 20,
                                px: 0.5,
                              }}
                            />
                          </Box>
                        )}

                        {/* Header */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, fontSize: '1.35rem' }}>
                            {plan.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                            {plan.tier} • {selectedType}
                          </Typography>
                        </Box>

                        {/* Pricing */}
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ fontSize: '2rem' }}>
                              KES {plan.price_monthly.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                              /mo
                            </Typography>
                          </Box>
                          {plan.price_yearly && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                              or KES {plan.price_yearly.toLocaleString()}/yr (save {Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100)}%)
                            </Typography>
                          )}
                        </Box>

                        {/* CTA Button */}
                        <Button
                          fullWidth
                          variant={isHighlighted ? 'contained' : 'outlined'}
                          component={Link}
                          href={`${signupPath}?plan=${plan.id}&trial=true`}
                          sx={{
                            mb: 2.5,
                            py: 1,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            ...(isHighlighted
                              ? {
                                  background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                                  boxShadow: '0 2px 12px rgba(67,160,71,0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #388E3C, #1B5E20)',
                                    boxShadow: '0 4px 16px rgba(67,160,71,0.4)',
                                  },
                                }
                              : {
                                  borderColor: 'primary.main',
                                  color: 'primary.main',
                                  '&:hover': {
                                    borderColor: 'primary.dark',
                                    backgroundColor: alpha('#43A047', 0.04),
                                  },
                                }),
                          }}
                        >
                          Start Free Trial
                        </Button>

                        {/* Features List */}
                        <Box sx={{ flex: 1, minHeight: 0 }}>
                          <List dense disablePadding sx={{ 
                            maxHeight: '100%',
                            overflow: 'auto',
                            '&::-webkit-scrollbar': { width: 4 },
                            '&::-webkit-scrollbar-thumb': { 
                              backgroundColor: alpha('#43A047', 0.3),
                              borderRadius: 2,
                            },
                          }}>
                            {features.slice(0, maxFeatures).map((feature: string, idx: number) => (
                              <ListItem key={idx} disablePadding sx={{ py: 0.4, alignItems: 'flex-start' }}>
                                <ListItemIcon sx={{ minWidth: 24, mt: 0.2 }}>
                                  <CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={feature}
                                  primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    color: 'text.secondary',
                                    sx: { lineHeight: 1.4, fontSize: '0.8rem' }
                                  }}
                                />
                              </ListItem>
                            ))}
                            {features.length > maxFeatures && (
                              <ListItem disablePadding sx={{ py: 0.4 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <CheckCircleIcon sx={{ fontSize: 14, color: 'primary.main', opacity: 0.5 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`+${features.length - maxFeatures} more features`}
                                  primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    color: 'text.secondary',
                                    sx: { lineHeight: 1.4, fontSize: '0.8rem', fontStyle: 'italic' }
                                  }}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
        </Grid>

        {/* Additional Info */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All plans include: SSL encryption • Daily backups • 99.9% uptime SLA • Email support
          </Typography>
          <Button
            variant="text"
            component={Link}
            href="/contact"
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            Need a custom plan? Contact our sales team →
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function TestimonialsSection() {
  return (
    <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" fontWeight={700}>
            Trusted by operators worldwide
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((t) => (
            <Grid key={t.name} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3.5 }}>
                  <FormatQuoteIcon sx={{ fontSize: 32, color: 'primary.light', mb: 1.5, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ lineHeight: 1.75, mb: 3, fontStyle: 'italic' }}>
                    "{t.quote}"
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                        {t.avatar}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {t.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.title}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', display: 'flex' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} sx={{ fontSize: 14, color: '#F2A40E' }} />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function CTASection() {
  return (
    <Box
      sx={{
        py: 10,
        background: `linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(ellipse 80% 60% at 70% 50%, ${alpha('#fff', 0.06)}, transparent)`,
        }}
      />
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{ color: '#fff', mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}
          >
            Ready to unify your operations?
          </Typography>
          <Typography variant="h6" sx={{ color: alpha('#fff', 0.8), mb: 5, fontWeight: 400, lineHeight: 1.6 }}>
            Join hundreds of businesses running on QuidPath.
            <br />
            Start your free trial — no setup fees, no contracts.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/dashboard"
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                backgroundColor: '#fff',
                color: '#1B5E20',
                fontWeight: 700,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.9),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/contact"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1rem',
                borderColor: alpha('#fff', 0.4),
                color: '#fff',
                '&:hover': {
                  borderColor: '#fff',
                  backgroundColor: alpha('#fff', 0.08),
                },
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

function LandingFooter() {
  return (
    <Box sx={{ py: 5, borderTop: '1px solid', borderColor: 'divider', backgroundColor: '#FFFFFF' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #43A047, #1B5E20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 12 }}>Q</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              © 2026 QuidPath. All rights reserved.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy', 'Terms', 'Security', 'Status'].map((item) => (
              <Typography key={item} variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' } }}>
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function LandingPage() {
  return (
    <Box>
      <LandingHeader />
      <HeroSection />
      <ModulesSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter />
    </Box>
  );
}
