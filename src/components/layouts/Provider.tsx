'use client';

import Footer from '@/components/layouts/Footer';
import Layout from '@/components/layouts/Layout';
import { SnackbarProvider } from 'notistack';
import { PropsWithChildren } from 'react';

/**
 * Component representing a provider layout
 */
export default function Provider({ children }: PropsWithChildren) {
  return (
    <SnackbarProvider
      maxSnack={8}
      preventDuplicate
      autoHideDuration={5000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}>
      <Layout>{children}</Layout>
      <Footer />
    </SnackbarProvider>
  );
}
