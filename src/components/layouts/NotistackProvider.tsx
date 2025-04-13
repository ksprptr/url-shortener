'use client';

import { styled } from '@mui/material';
import { PropsWithChildren } from 'react';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';

// Custom styles for notistack snackbars
const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {
    backgroundColor: '#9810fa1a',
    color: '#6e11b0',
    border: '2px solid #6e11b01a',
    borderRadius: '8px',
    backdropFilter: 'blur(12px)',
    boxShadow: 'none',
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: '#9810fa1a',
    color: '#6e11b0',
    border: '2px solid #6e11b01a',
    borderRadius: '8px',
    backdropFilter: 'blur(12px)',
    boxShadow: 'none',
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: '#9810fa1a',
    color: '#6e11b0',
    border: '2px solid #6e11b01a',
    borderRadius: '8px',
    backdropFilter: 'blur(12px)',
    boxShadow: 'none',
  },
}));

/**
 * Component representing a notistack provider
 */
export default function NotistackProvider({ children }: PropsWithChildren) {
  return (
    <SnackbarProvider
      maxSnack={6}
      autoHideDuration={4000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
      }}>
      {children}
    </SnackbarProvider>
  );
}
