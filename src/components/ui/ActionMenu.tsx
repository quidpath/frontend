'use client';

import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  color?: 'default' | 'error' | 'warning' | 'success';
  divider?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionMenuItem[];
  size?: 'small' | 'medium';
}

export default function ActionMenu({ actions, size = 'small' }: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action: ActionMenuItem, event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    action.onClick();
  };

  return (
    <>
      <IconButton
        size={size}
        onClick={handleClick}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize={size} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 180, mt: 0.5 },
        }}
      >
        {actions.map((action, index) => {
          const items = [];
          if (action.divider) {
            items.push(<Divider key={`divider-${index}`} />);
          }
          items.push(
            <MenuItem
              key={`item-${index}`}
              onClick={(e) => handleAction(action, e)}
              disabled={action.disabled}
              sx={{
                color: action.color === 'error' ? 'error.main' : 
                       action.color === 'warning' ? 'warning.main' :
                       action.color === 'success' ? 'success.main' : 'text.primary',
              }}
            >
              {action.icon && (
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {action.icon}
                </ListItemIcon>
              )}
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          );
          return items;
        })}
      </Menu>
    </>
  );
}

// Common action presets
export const commonActions = {
  view: (onClick: () => void): ActionMenuItem => ({
    label: 'View Details',
    icon: <VisibilityIcon fontSize="small" />,
    onClick,
  }),
  edit: (onClick: () => void): ActionMenuItem => ({
    label: 'Edit',
    icon: <EditIcon fontSize="small" />,
    onClick,
  }),
  duplicate: (onClick: () => void): ActionMenuItem => ({
    label: 'Duplicate',
    icon: <ContentCopyIcon fontSize="small" />,
    onClick,
  }),
  delete: (onClick: () => void): ActionMenuItem => ({
    label: 'Delete',
    icon: <DeleteIcon fontSize="small" />,
    onClick,
    color: 'error' as const,
    divider: true,
  }),
};
