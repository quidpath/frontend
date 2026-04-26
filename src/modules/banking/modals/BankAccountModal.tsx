'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Grid, MenuItem, FormControlLabel, Checkbox, 
  Typography, Box, Divider, Alert, Collapse, Chip, Stack, Paper
} from '@mui/material';
import { 
  AccountBalance as BankIcon,
  Savings as SaccoIcon,
  PhoneAndroid as MobileIcon,
  PointOfSale as TillIcon,
  AccountBalanceWallet as CashIcon,
  TrendingUp as InvestmentIcon,
  MoreHoriz as OtherIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import UniversalModal from '@/components/ui/UniversalModal';
import { BankAccount } from '@/services/bankingService';
import bankingService from '@/services/bankingService';

interface BankAccountModalProps {
  open: boolean;
  onClose: () => void;
  account?: BankAccount | null;
  onSuccess: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'ZAR', 'NGN', 'GHS'];

const ACCOUNT_TYPES = [
  { 
    value: 'bank', 
    label: 'Bank Account', 
    description: 'Traditional bank account',
    icon: BankIcon,
    color: '#1976d2'
  },
  { 
    value: 'sacco', 
    label: 'SACCO Account', 
    description: 'Savings and Credit Cooperative',
    icon: SaccoIcon,
    color: '#2e7d32'
  },
  { 
    value: 'mobile_money', 
    label: 'Mobile Money', 
    description: 'M-Pesa, Airtel Money, etc.',
    icon: MobileIcon,
    color: '#ed6c02'
  },
  { 
    value: 'till', 
    label: 'Till Number', 
    description: 'Business till or paybill',
    icon: TillIcon,
    color: '#9c27b0'
  },
  { 
    value: 'cash', 
    label: 'Cash Account', 
    description: 'Physical cash management',
    icon: CashIcon,
    color: '#0288d1'
  },
  { 
    value: 'investment', 
    label: 'Investment Account', 
    description: 'Investment or savings account',
    icon: InvestmentIcon,
    color: '#d32f2f'
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Other account type',
    icon: OtherIcon,
    color: '#757575'
  },
];

export default function BankAccountModal({ open, onClose, account, onSuccess }: BankAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    account_type: 'bank' | 'sacco' | 'mobile_money' | 'till' | 'cash' | 'investment' | 'other';
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    provider_name: string;
    branch_code: string;
    swift_code: string;
    opening_balance: number;
    opening_balance_date: string;
    is_default: boolean;
    is_active: boolean;
  }>({
    account_type: 'bank',
    bank_name: '',
    account_name: '',
    account_number: '',
    currency: 'USD',
    provider_name: '',
    branch_code: '',
    swift_code: '',
    opening_balance: 0,
    opening_balance_date: new Date().toISOString().split('T')[0],
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        account_type: account.account_type || 'bank',
        bank_name: account.bank_name || '',
        account_name: account.account_name || '',
        account_number: account.account_number || '',
        currency: account.currency || 'USD',
        provider_name: account.provider_name || '',
        branch_code: account.branch_code || '',
        swift_code: account.swift_code || '',
        opening_balance: account.opening_balance || 0,
        opening_balance_date: account.opening_balance_date || new Date().toISOString().split('T')[0],
        is_default: account.is_default || false,
        is_active: account.is_active ?? true,
      });
    } else {
      setFormData({
        account_type: 'bank',
        bank_name: '',
        account_name: '',
        account_number: '',
        currency: 'USD',
        provider_name: '',
        branch_code: '',
        swift_code: '',
        opening_balance: 0,
        opening_balance_date: new Date().toISOString().split('T')[0],
        is_default: false,
        is_active: true,
      });
    }
    setErrors({});
  }, [account, open]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getFieldLabel = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'bank_name':
        if (accountType === 'sacco') return 'SACCO Name';
        if (accountType === 'mobile_money') return 'Provider Name';
        if (accountType === 'till') return 'Service Provider';
        if (accountType === 'cash') return 'Cash Location';
        if (accountType === 'investment') return 'Institution Name';
        return 'Bank Name';
      case 'account_number':
        if (accountType === 'mobile_money') return 'Phone Number';
        if (accountType === 'till') return 'Till Number';
        if (accountType === 'cash') return 'Reference ID';
        return 'Account Number';
      case 'account_name':
        if (accountType === 'cash') return 'Account Name';
        if (accountType === 'till') return 'Till Name';
        return 'Account Name';
      default:
        return field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getFieldPlaceholder = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'bank_name':
        if (accountType === 'sacco') return 'Enter SACCO name (e.g., Stima SACCO)';
        if (accountType === 'mobile_money') return 'Enter provider (e.g., Safaricom, Airtel)';
        if (accountType === 'till') return 'Enter service provider (e.g., Safaricom)';
        if (accountType === 'cash') return 'Enter location (e.g., Main Office)';
        if (accountType === 'investment') return 'Enter institution name';
        return 'Enter bank name (e.g., Equity Bank)';
      case 'account_number':
        if (accountType === 'mobile_money') return 'Enter phone number (e.g., +254712345678)';
        if (accountType === 'till') return 'Enter till number (e.g., 123456)';
        if (accountType === 'cash') return 'Enter reference ID (e.g., CASH-001)';
        return 'Enter account number';
      case 'account_name':
        if (accountType === 'cash') return 'Enter descriptive name (e.g., Petty Cash)';
        if (accountType === 'till') return 'Enter till name (e.g., Store Till)';
        return 'Enter account holder name';
      case 'provider_name':
        return 'Enter additional provider details';
      case 'branch_code':
        if (accountType === 'sacco') return 'Enter branch or location code';
        return 'Enter branch code (e.g., 001)';
      case 'swift_code':
        return 'Enter SWIFT/BIC code (e.g., EQBLKENA)';
      default:
        return '';
    }
  };

  const getFieldHelperText = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'account_number':
        if (accountType === 'mobile_money') return 'Include country code for mobile money';
        if (accountType === 'till') return 'Your business till number';
        if (accountType === 'cash') return 'Unique identifier for this cash account';
        return '';
      case 'swift_code':
        return 'Required for international transfers';
      case 'branch_code':
        return 'Optional - helps identify specific branch';
      default:
        return '';
    }
  };

  const shouldShowField = (field: string) => {
    const accountType = formData.account_type;
    switch (field) {
      case 'provider_name':
        return ['mobile_money', 'till', 'other'].includes(accountType);
      case 'branch_code':
        return ['bank', 'sacco'].includes(accountType);
      case 'swift_code':
        return accountType === 'bank';
      default:
        return true;
    }
  };

  const getAccountTypeInfo = () => {
    const accountType = formData.account_type;
    switch (accountType) {
      case 'bank':
        return 'Standard bank account for business transactions. Supports local and international transfers.';
      case 'sacco':
        return 'SACCO accounts offer competitive rates and member benefits. Great for savings and loans.';
      case 'mobile_money':
        return 'Mobile money accounts enable instant payments and transfers via phone. Popular in East Africa.';
      case 'till':
        return 'Business till numbers allow customers to pay directly to your business account.';
      case 'cash':
        return 'Track physical cash holdings. Useful for petty cash, cash registers, or safe deposits.';
      case 'investment':
        return 'Investment accounts for managing portfolios, bonds, or other financial instruments.';
      case 'other':
        return 'Custom account type for specialized financial instruments or services.';
      default:
        return '';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.account_type) newErrors.account_type = 'Account type is required';
    if (!formData.bank_name) newErrors.bank_name = `${getFieldLabel('bank_name')} is required`;
    if (!formData.account_name) newErrors.account_name = `${getFieldLabel('account_name')} is required`;
    if (!formData.account_number) newErrors.account_number = `${getFieldLabel('account_number')} is required`;
    if (formData.opening_balance < 0) newErrors.opening_balance = 'Opening balance cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (account) {
        await bankingService.updateBankAccount(account.id, formData);
      } else {
        await bankingService.createBankAccount(formData);
      }
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving account:', error);
      const errorMsg = (error as any)?.response?.data?.message || 'Failed to save account. Please try again.';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={account ? 'Edit Account' : 'Add New Account'}
      subtitle={account ? `Update account details` : 'Create a new financial account for your business'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
          </Button>
        </>
      }
    >
      <Grid container spacing={3}>
        {/* Account Type Selection */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1.5, fontWeight: 600 }}>
            Account Type
          </Typography>
          <TextField
            fullWidth
            select
            value={formData.account_type}
            onChange={(e) => handleChange('account_type', e.target.value)}
            error={!!errors.account_type}
            helperText={errors.account_type}
            required
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }
            }}
          >
            {ACCOUNT_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Icon sx={{ color: type.color, fontSize: 20 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {type.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>

        {/* Account Type Info Banner */}
        <Grid size={{ xs: 12 }}>
          <Collapse in={!!formData.account_type}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.200',
                borderRadius: 1.5
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <InfoIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.25 }} />
                <Box>
                  <Typography variant="body2" color="primary.dark" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {ACCOUNT_TYPES.find(t => t.value === formData.account_type)?.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getAccountTypeInfo()}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Collapse>
        </Grid>

        {/* Basic Information Section */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }}>
            <Chip label="Basic Information" size="small" />
          </Divider>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={getFieldLabel('bank_name')}
            placeholder={getFieldPlaceholder('bank_name')}
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            error={!!errors.bank_name}
            helperText={errors.bank_name}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={getFieldLabel('account_name')}
            placeholder={getFieldPlaceholder('account_name')}
            value={formData.account_name}
            onChange={(e) => handleChange('account_name', e.target.value)}
            error={!!errors.account_name}
            helperText={errors.account_name}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            label={getFieldLabel('account_number')}
            placeholder={getFieldPlaceholder('account_number')}
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            error={!!errors.account_number}
            helperText={errors.account_number || getFieldHelperText('account_number')}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            select
            label="Currency"
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            {CURRENCIES.map((currency) => (
              <MenuItem key={currency} value={currency}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="medium">{currency}</Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Additional Details Section - Conditional Fields */}
        <Collapse in={shouldShowField('provider_name') || shouldShowField('branch_code') || shouldShowField('swift_code')} sx={{ width: '100%' }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Additional Details" size="small" />
              </Divider>
            </Grid>

            {shouldShowField('provider_name') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Collapse in={shouldShowField('provider_name')}>
                  <TextField
                    fullWidth
                    label="Provider Details"
                    placeholder={getFieldPlaceholder('provider_name')}
                    value={formData.provider_name}
                    onChange={(e) => handleChange('provider_name', e.target.value)}
                  />
                </Collapse>
              </Grid>
            )}

            {shouldShowField('branch_code') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Collapse in={shouldShowField('branch_code')}>
                  <TextField
                    fullWidth
                    label="Branch Code"
                    placeholder={getFieldPlaceholder('branch_code')}
                    value={formData.branch_code}
                    onChange={(e) => handleChange('branch_code', e.target.value)}
                    helperText={getFieldHelperText('branch_code')}
                  />
                </Collapse>
              </Grid>
            )}

            {shouldShowField('swift_code') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Collapse in={shouldShowField('swift_code')}>
                  <TextField
                    fullWidth
                    label="SWIFT/BIC Code"
                    placeholder={getFieldPlaceholder('swift_code')}
                    value={formData.swift_code}
                    onChange={(e) => handleChange('swift_code', e.target.value.toUpperCase())}
                    helperText={getFieldHelperText('swift_code')}
                    inputProps={{ style: { textTransform: 'uppercase' } }}
                  />
                </Collapse>
              </Grid>
            )}
          </Grid>
        </Collapse>

        {/* Opening Balance Section */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }}>
            <Chip label="Opening Balance" size="small" />
          </Divider>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Set the opening balance if this account already has funds. This helps maintain accurate records from the start.
            </Typography>
          </Alert>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Opening Balance"
            value={formData.opening_balance}
            onChange={(e) => handleChange('opening_balance', Number(e.target.value))}
            error={!!errors.opening_balance}
            helperText={errors.opening_balance || 'Current balance when adding this account'}
            inputProps={{ min: 0, step: 0.01 }}
            InputProps={{
              startAdornment: (
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  {formData.currency}
                </Typography>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Opening Balance Date"
            value={formData.opening_balance_date}
            onChange={(e) => handleChange('opening_balance_date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Date when the opening balance was recorded"
          />
        </Grid>

        {/* Account Settings Section */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }}>
            <Chip label="Account Settings" size="small" />
          </Divider>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1.5
            }}
          >
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_default}
                    onChange={(e) => handleChange('is_default', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Set as default account
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use this account as the default for transactions
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Active account
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Inactive accounts won't appear in transaction lists
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>
        </Grid>

        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="error" sx={{ mt: 1 }}>
              {errors.submit}
            </Alert>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
