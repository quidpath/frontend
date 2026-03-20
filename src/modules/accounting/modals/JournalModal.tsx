'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Grid,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UniversalModal from '@/components/ui/UniversalModal';
import { JournalEntry, JournalEntryLine } from '@/services/accountingService';
import accountingService from '@/services/accountingService';

interface JournalModalProps {
  open: boolean;
  onClose: () => void;
  journal?: JournalEntry | null;
  onSuccess: () => void;
}

export default function JournalModal({
  open,
  onClose,
  journal,
  onSuccess,
}: JournalModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    date: '',
    reference: '',
    description: '',
  });
  const [lines, setLines] = useState<Partial<JournalEntryLine>[]>([
    { account_id: '', debit: '0', credit: '0', description: '' },
    { account_id: '', debit: '0', credit: '0', description: '' },
  ]);

  useEffect(() => {
    if (journal) {
      setFormData({
        date: journal.date || '',
        reference: journal.reference || '',
        description: journal.description || '',
      });
      setLines(journal.lines || [
        { account_id: '', debit: '0', credit: '0', description: '' },
        { account_id: '', debit: '0', credit: '0', description: '' },
      ]);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        date: today,
        reference: '',
        description: '',
      });
      setLines([
        { account_id: '', debit: '0', credit: '0', description: '' },
        { account_id: '', debit: '0', credit: '0', description: '' },
      ]);
    }
    setErrors({});
  }, [journal, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Ensure only debit or credit has value, not both
    if (field === 'debit' && Number(value) > 0) {
      newLines[index].credit = '0';
    } else if (field === 'credit' && Number(value) > 0) {
      newLines[index].debit = '0';
    }
    
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { account_id: '', debit: '0', credit: '0', description: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01; // Allow for rounding errors
    
    return { totalDebit, totalCredit, difference, isBalanced };
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.reference) newErrors.reference = 'Reference is required';
    if (!formData.description) newErrors.description = 'Description is required';
    
    const hasValidLines = lines.filter(line => 
      line.account_id && (Number(line.debit) > 0 || Number(line.credit) > 0)
    ).length >= 2;
    
    if (!hasValidLines) {
      newErrors.lines = 'At least two valid line items are required';
    }
    
    const { isBalanced } = calculateTotals();
    if (!isBalanced) {
      newErrors.balance = 'Total debits must equal total credits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        date: formData.date,
        reference: formData.reference,
        description: formData.description,
        lines: lines.filter(line => 
          line.account_id && (Number(line.debit) > 0 || Number(line.credit) > 0)
        ),
      };

      if (journal) {
        await accountingService.updateJournalEntry(journal.id, payload);
      } else {
        await accountingService.createJournalEntry(payload);
      }

      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving journal entry:', error);
      setErrors({ submit: 'Failed to save journal entry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={journal ? 'Edit Journal Entry' : 'New Journal Entry'}
      subtitle={journal ? `Editing entry ${journal.reference}` : 'Create a new journal entry'}
      maxWidth="lg"
      loading={loading}
      disableBackdropClick={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !totals.isBalanced}
          >
            {journal ? 'Update' : 'Create'} Entry
          </Button>
        </>
      }
    >
      <Grid container spacing={2.5}>
        {/* Header Information */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Reference"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            error={!!errors.reference}
            helperText={errors.reference}
            placeholder="JE-001"
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            placeholder="Entry description"
            required
          />
        </Grid>

        {/* Balance Alert */}
        {!totals.isBalanced && lines.some(l => l.account_id) && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">
              Entry is not balanced. Debits: ${totals.totalDebit.toFixed(2)}, Credits: ${totals.totalCredit.toFixed(2)}, 
              Difference: ${Math.abs(totals.difference).toFixed(2)}
            </Alert>
          </Grid>
        )}

        {/* Line Items */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Journal Lines
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addLine}>
              Add Line
            </Button>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell width={140} align="right">Debit</TableCell>
                  <TableCell width={140} align="right">Credit</TableCell>
                  <TableCell width={50}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.account_id || ''}
                        onChange={(e) => handleLineChange(index, 'account_id', e.target.value)}
                        placeholder="Account code/name"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.description || ''}
                        onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        placeholder="Line description"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={line.debit || ''}
                        onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ textAlign: 'right' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={line.credit || ''}
                        onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ textAlign: 'right' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeLine(index)}
                        disabled={lines.length <= 2}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Totals Row */}
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Totals
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={700}>
                      ${totals.totalDebit.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={700}>
                      ${totals.totalCredit.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {errors.lines && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.lines}
            </Typography>
          )}
          {errors.balance && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.balance}
            </Typography>
          )}
        </Grid>

        {errors.submit && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="error">
              {errors.submit}
            </Typography>
          </Grid>
        )}
      </Grid>
    </UniversalModal>
  );
}
