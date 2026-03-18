'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AppsIcon from '@mui/icons-material/Apps';
import QuickAccessPanel from './QuickAccessPanel';
import { PANEL_TRANSITION_MS } from './QuickAccessPanel';

const HOVER_LEAVE_DELAY_MS = 120;

export interface QuickAccessProps {
  /** Left boundary in px (e.g. sidebar width) so panel stays in content area */
  contentAreaLeft: number;
  /** Topbar height in px so panel opens below it */
  topbarHeight?: number;
  /** Optional className / sx for the trigger container */
  sx?: object;
}

export default function QuickAccess({
  contentAreaLeft,
  topbarHeight = 60,
  sx,
}: QuickAccessProps) {
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearLeaveTimer();
    setOpen(true);
  }, [clearLeaveTimer]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleTriggerLeave = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => {
      leaveTimerRef.current = null;
      setOpen(false);
    }, HOVER_LEAVE_DELAY_MS);
  }, []);

  const handlePanelEnter = useCallback(() => {
    clearLeaveTimer();
  }, [clearLeaveTimer]);

  // Keep panel mounted long enough for exit animation, then unmount
  useEffect(() => {
    if (open) setPanelVisible(true);
    else {
      const t = setTimeout(() => setPanelVisible(false), PANEL_TRANSITION_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <>
      <Tooltip title="Hover to open quick navigation" enterDelay={200}>
        <Box
          ref={triggerRef}
          onMouseEnter={handleOpen}
          onMouseLeave={handleTriggerLeave}
          sx={{ display: 'inline-flex', ...sx }}
        >
          <Button
          variant="outlined"
          size="small"
          endIcon={<KeyboardArrowDownIcon />}
          startIcon={<AppsIcon fontSize="small" />}
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.hover',
            },
          }}
        >
          Quick access
        </Button>
        </Box>
      </Tooltip>

      {panelVisible && (
        <QuickAccessPanel
          open={open}
          onClose={handleClose}
          onMouseEnterPanel={handlePanelEnter}
          contentAreaLeft={contentAreaLeft}
          anchorEl={triggerRef.current}
          topbarHeight={topbarHeight}
        />
      )}
    </>
  );
}
