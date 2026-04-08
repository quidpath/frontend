/**
 * Unified Document Modal for Invoices, Quotes, POs, and Bills
 * Features:
 * - Draft/Post buttons
 * - Prevent accidental closure with confirmation
 * - Auto-save on page close
 * - Document preview with template formatting
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton,
  CircularProgress, Stack, Alert, Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DocumentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSaveDraft: () => Promise<{ id: string }>;
  onPost: () => Promise<void>;
  onAutoSave?: () => Promise<void>;
  isDirty: boolean;
  isLoading?: boolean;
  documentId?: string;
}

export default function DocumentModal({
  open,
  onClose,
  title,
  children,
  onSaveDraft,
  onPost,
  onAutoSave,
  isDirty,
  isLoading = false,
  documentId,
}: DocumentModalProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const savedDocIdRef = useRef<string | undefined>(documentId);

  // Update saved doc ID when prop changes
  useEffect(() => {
    savedDocIdRef.current = documentId;
  }, [documentId]);

  // Auto-save every 30 seconds if dirty and onAutoSave is provided
  useEffect(() => {
    if (!open || !isDirty || !onAutoSave) return;

    autoSaveTimerRef.current = setInterval(async () => {
      try {
        await onAutoSave();
        console.log('Auto-saved document');
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [open, isDirty, onAutoSave]);

  // Handle beforeunload to save draft when page is closed
  useEffect(() => {
    if (!open || !isDirty) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      
      // Try to save draft
      if (onAutoSave) {
        try {
          await onAutoSave();
        } catch (err) {
          console.error('Failed to save draft on page close:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [open, isDirty, onAutoSave]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleConfirmClose = useCallback(async () => {
    // Save as draft before closing
    if (isDirty && onAutoSave) {
      try {
        await onAutoSave();
      } catch (err) {
        console.error('Failed to save draft on close:', err);
      }
    }
    setShowCloseConfirm(false);
    onClose();
  }, [isDirty, onAutoSave, onClose]);

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await onSaveDraft();
      savedDocIdRef.current = result.id;
      setSaving(false);
      // Don't close modal, let user continue editing
    } catch (err: any) {
      setError(err?.message || 'Failed to save draft');
      setSaving(false);
    }
  };

  const handlePost = async () => {
    setPosting(true);
    setError(null);
    try {
      await onPost();
      setPosting(false);
      onClose(); // Close modal after successful post
    } catch (err: any) {
      setError(err?.message || 'Failed to post document');
      setPosting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        disableEscapeKeyDown={isDirty}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 1 }}>
          {title}
          {isDirty && (
            <Box
              component="span"
              sx={{
                ml: 2,
                px: 1,
                py: 0.5,
                bgcolor: 'warning.light',
                color: 'warning.dark',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              UNSAVED
            </Box>
          )}
          <IconButton
            size="small"
            sx={{ ml: 'auto' }}
            onClick={handleClose}
            disabled={saving || posting}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {children}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={saving || posting}
          >
            Cancel
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={handleSaveDraft}
            variant="outlined"
            disabled={saving || posting || isLoading}
            startIcon={saving ? <CircularProgress size={14} /> : undefined}
          >
            {savedDocIdRef.current ? 'Update Draft' : 'Save as Draft'}
          </Button>
          <Button
            onClick={handlePost}
            variant="contained"
            disabled={saving || posting || isLoading}
            startIcon={posting ? <CircularProgress size={14} /> : undefined}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={showCloseConfirm} onClose={() => setShowCloseConfirm(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Box>
              You have unsaved changes. Do you want to save them as a draft before closing?
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setShowCloseConfirm(false);
              onClose();
            }}
            variant="outlined"
            color="error"
          >
            Discard Changes
          </Button>
          <Button onClick={handleConfirmClose} variant="contained">
            Save & Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
