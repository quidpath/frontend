'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import supportService, { SupportTicket } from '@/services/supportService';

interface ContactSupportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactSupportModal({ open, onClose }: ContactSupportModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SupportTicket>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
  });

  const handleChange = (field: keyof SupportTicket, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    if (!formData.message.trim()) {
      setError('Please describe your issue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await supportService.sendSupportEmail(formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general',
          priority: 'medium',
        });
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Contact Support
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Send us a message and we'll get back to you at quidpath@gmail.com
        </Typography>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your message has been sent successfully! We'll respond to your email shortly.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Your Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <MenuItem value="general">General Inquiry</MenuItem>
                <MenuItem value="technical">Technical Issue</MenuItem>
                <MenuItem value="billing">Billing Question</MenuItem>
                <MenuItem value="feature">Feature Request</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Box>
            <TextField
              fullWidth
              label="Subject"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Please describe your issue or question in detail..."
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
