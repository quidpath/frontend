'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { endpointTester } from '@/utils/endpointTester';

interface TestResult {
  module: string;
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration: number;
}

export default function TestEndpointsPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [report, setReport] = useState('');

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    setReport('');

    try {
      const testResults = await endpointTester.testAll();
      setResults(testResults);
      const reportText = endpointTester.generateReport();
      setReport(reportText);
      console.log(reportText);
    } catch (error) {
      console.error('Testing failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalCount = results.length;
  const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  // Group results by module
  const resultsByModule = results.reduce((acc, r) => {
    if (!acc[r.module]) acc[r.module] = [];
    acc[r.module].push(r);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 API Endpoint Testing Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Test all frontend API endpoints to ensure connectivity and proper data flow
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={runTests}
              disabled={testing}
            >
              {testing ? 'Testing...' : 'Run All Tests'}
            </Button>

            {results.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${successCount} Passed`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<ErrorIcon />}
                  label={`${errorCount} Failed`}
                  color="error"
                  variant="outlined"
                />
                <Chip
                  label={`${successRate.toFixed(1)}% Success Rate`}
                  color={successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error'}
                />
              </Box>
            )}
          </Box>

          {testing && (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Testing endpoints... This may take a minute.
              </Typography>
            </Box>
          )}

          {report && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {report}
              </pre>
            </Alert>
          )}
        </CardContent>
      </Card>

      {Object.entries(resultsByModule).map(([module, moduleResults]) => {
        const moduleSuccess = moduleResults.filter(r => r.status === 'success').length;
        const moduleTotal = moduleResults.length;
        const moduleRate = (moduleSuccess / moduleTotal) * 100;

        return (
          <Card key={module} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {module}
                </Typography>
                <Chip
                  label={`${moduleSuccess}/${moduleTotal} (${moduleRate.toFixed(0)}%)`}
                  color={moduleRate === 100 ? 'success' : moduleRate >= 70 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="60">Status</TableCell>
                      <TableCell width="80">Method</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell width="100">Duration</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {moduleResults.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {result.status === 'success' ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : (
                            <ErrorIcon color="error" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={result.method} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {result.endpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {result.duration}ms
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={result.status === 'success' ? 'success.main' : 'error.main'}
                          >
                            {result.message}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );
      })}

      {results.length === 0 && !testing && (
        <Alert severity="info">
          Click "Run All Tests" to start testing all API endpoints
        </Alert>
      )}
    </Box>
  );
}
