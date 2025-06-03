'use client';

import { styled } from '@mui/material';
import { PropsWithChildren } from 'react';
import { MaterialDesignContent, SnackbarProvider } from 'notistack';

// Custom styles for notistack snackbars
const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  '&.notistack-MuiContent-success': {
    backgroundColor: '#9333ea',
    color: '#fafafa',
    border: '2px solid #9333ea',
    borderRadius: '8px',
  },
  '&.notistack-MuiContent-error': {
    backgroundColor: '#9333ea',
    color: '#fafafa',
    border: '2px solid #9333ea',
    borderRadius: '8px',
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: '#9333ea',
    color: '#fafafa',
    border: '2px solid #9333ea',
    borderRadius: '8px',
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
