'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageHeader from '@/components/ui/PageHeader';
import { useJournalEntry } from '@/hooks/useAccounting';
import { formatDate } from '@/utils/formatters';
import BookIcon from '@mui/icons-material/Book';

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : null;
  const { data: entry, isLoading, error } = useJournalEntry(id);

  if (!id) {
    return (
      <Box>
        <Typography color="error">Invalid journal entry ID.</Typography>
      </Box>
    );
  }

  if (error || (!isLoading && !entry)) {
    return (
      <Box>
        <PageHeader
          title="Journal Entry"
          breadcrumbs={[{ label: 'Accounting', href: '/accounting' }, { label: 'Journals', href: '/accounting/journals' }, { label: 'Detail' }]}
        />
        <Typography color="text.secondary">Entry not found or you don&apos;t have access.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/accounting/journals')} sx={{ mt: 2 }}>
          Back to Journals
        </Button>
      </Box>
    );
  }

  if (isLoading || !entry) {
    return (
      <Box>
        <PageHeader title="Journal Entry" breadcrumbs={[{ label: 'Accounting', href: '/accounting' }, { label: 'Journals', href: '/accounting/journals' }, { label: '...' }]} />
        <Typography color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={entry.reference || 'Journal Entry'}
        subtitle={entry.description || undefined}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Journals', href: '/accounting/journals' },
          { label: entry.reference || entry.id },
        ]}
        icon={<BookIcon sx={{ fontSize: 26 }} />}
        color="#1565C0"
        actions={
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/accounting/journals')}>
            Back to list
          </Button>
        }
      />
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Date: {formatDate(entry.date)} · {entry.is_posted ? 'Posted' : 'Draft'}
        </Typography>
        {entry.description && (
          <Typography variant="body2" sx={{ mt: 1 }}>{entry.description}</Typography>
        )}
        {entry.lines?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Lines</Typography>
            {entry.lines.map((line) => (
              <Box key={line.id} sx={{ py: 0.5, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2 }}>
                <Typography variant="body2">Account: {line.account_id}</Typography>
                <Typography variant="body2">Debit: {line.debit}</Typography>
                <Typography variant="body2">Credit: {line.credit}</Typography>
                {line.description && <Typography variant="body2" color="text.secondary">{line.description}</Typography>}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
