'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface ContextConfig {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
}

interface ContextAwareButtonProps {
  contexts: Record<string, ContextConfig>;
  currentContext: string;
  size?: ButtonProps['size'];
}

/**
 * A button that changes its label, icon, and action based on the current context.
 * Example: In accounting, changes from "New Invoice" to "New Expense" when switching tabs.
 */
export default function ContextAwareButton({
  contexts,
  currentContext,
  size = 'small',
}: ContextAwareButtonProps) {
  const config = contexts[currentContext] || contexts.default;

  if (!config) return null;

  return (
    <Button
      startIcon={config.icon || <AddIcon />}
      variant={config.variant || 'contained'}
      color={config.color || 'primary'}
      size={size}
      onClick={config.onClick}
    >
      {config.label}
    </Button>
  );
}
