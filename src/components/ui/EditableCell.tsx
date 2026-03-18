'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export type EditableCellType = 'text' | 'number' | 'select' | 'date';

interface EditableCellProps {
  value: string | number;
  type?: EditableCellType;
  options?: Array<{ value: string | number; label: string }>;
  onSave: (newValue: string | number) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function EditableCell({
  value,
  type = 'text',
  options = [],
  onSave,
  disabled = false,
  placeholder,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <Box
        onClick={() => !disabled && setIsEditing(true)}
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          py: 0.5,
          px: 1,
          borderRadius: 1,
          '&:hover': disabled
            ? {}
            : {
                backgroundColor: 'action.hover',
              },
          display: 'flex',
          alignItems: 'center',
          minHeight: 32,
        }}
      >
        {value || <span style={{ color: '#999' }}>{placeholder || 'Click to edit'}</span>}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {type === 'select' ? (
        <Select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          size="small"
          autoFocus
          disabled={isSaving}
          sx={{ minWidth: 120 }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <TextField
          inputRef={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
          size="small"
          disabled={isSaving}
          sx={{ minWidth: 120 }}
        />
      )}

      {isSaving && <CircularProgress size={16} />}

      {!isSaving && (
        <>
          <IconButton size="small" onClick={handleSave} color="primary">
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
}
