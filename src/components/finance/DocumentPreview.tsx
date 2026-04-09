/**
 * Document Preview Component
 * Displays formatted document with company logo and template
 * Supports print and download functionality
 */
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Stack, Box,
  Typography, Divider, CircularProgress, Button, Toolbar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { gatewayClient } from '@/services/apiClient';

interface DocumentLine {
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
  tax_amount?: number;
  total?: number;
}

interface DocumentData {
  id: string;
  number: string;
  date: string;
  customer?: string;
  vendor?: string;
  lines: DocumentLine[];
  sub_total: number;
  tax_total: number;
  total: number;
  status: string;
  // Additional fields
  due_date?: string;
  valid_until?: string;
  expected_delivery?: string;
  comments?: string;
  terms?: string;
}

interface CompanyInfo {
  name: string;
  logo_url?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
}

interface DocumentTemplate {
  accentColor: string;
  font: string;
  logoAlign: 'left' | 'center' | 'right';
  showLogo: boolean;
  showTagline: boolean;
  tagline: string;
  footerText: string;
  showBankDetails: boolean;
  showSignatureLine: boolean;
  showStamp: boolean;
  borderStyle: 'none' | 'thin' | 'thick';
  headerBg: boolean;
}

interface DocumentPreviewProps {
  open: boolean;
  onClose: () => void;
  document: DocumentData;
  documentType: 'invoice' | 'quote' | 'po' | 'bill';
  companyInfo?: CompanyInfo;
  onDownload?: () => Promise<void>;
  onPrint?: () => void;
}

export default function DocumentPreview({
  open,
  onClose,
  document,
  documentType,
  companyInfo: propCompanyInfo,
  onDownload,
  onPrint,
}: DocumentPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | undefined>(propCompanyInfo);

  // Fetch template and company profile (with logo) for this document type
  useEffect(() => {
    if (!open) return;
    
    const docTypeMap: Record<string, string> = {
      'invoice': 'invoice',
      'quote': 'quotation',
      'po': 'purchase_order',
      'bill': 'vendor_bill',
    };
    
    setLoadingTemplate(true);
    
    // Fetch both template and profile in parallel
    Promise.all([
      gatewayClient.get('/api/orgauth/document-templates/get-for-document/', {
        params: { document_type: docTypeMap[documentType] }
      }),
      gatewayClient.get('/api/auth/get-profile/')
    ]).then(([templateResponse, profileResponse]) => {
      setTemplate(templateResponse.data?.template || null);
      
      // Profile response shape: { user: { corporate: {...}, ... } }
      const profile = profileResponse.data?.user ?? profileResponse.data;
      const corp = profile?.corporate ?? {};
      setCompanyInfo({
        name: corp.name || profile?.company_name || 'Company Name',
        logo_url: corp.logo || '',
        address: corp.address || '',
        city: corp.city || '',
        country: corp.country || '',
        phone: corp.phone || profile?.phone_number || '',
        email: corp.email || profile?.email || '',
        tax_id: corp.tax_id || '',
      });
      
      setLoadingTemplate(false);
    }).catch((error) => {
      console.error('Failed to load template or profile:', error);
      setLoadingTemplate(false);
    });
  }, [open, documentType]);

  // Apply template styles or use defaults
  const accentColor = template?.accentColor || '#1565C0';
  const fontFamily = template?.font || 'Inter';
  const showLogo = template?.showLogo !== false;
  const showBankDetails = template?.showBankDetails !== false;
  const showSignatureLine = template?.showSignatureLine !== false;
  const footerText = template?.footerText || 'Thank you for your business.';
  const headerBg = template?.headerBg !== false;
  const logoAlign = template?.logoAlign || 'left';
  const showTagline = template?.showTagline || false;
  const tagline = template?.tagline || '';

  const documentTitle = {
    invoice: 'INVOICE',
    quote: 'QUOTATION',
    po: 'PURCHASE ORDER',
    bill: 'VENDOR BILL',
  }[documentType];

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (!onDownload) return;
    setDownloading(true);
    try {
      await onDownload();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
        <Toolbar sx={{ width: '100%', gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {documentTitle} Preview
          </Typography>
          <Button
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            size="small"
            variant="outlined"
          >
            Print
          </Button>
          {onDownload && (
            <Button
              startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleDownload}
              disabled={downloading}
              size="small"
              variant="outlined"
            >
              Download PDF
            </Button>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 4, bgcolor: '#f5f5f5' }}>
        {loadingTemplate ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: 'white',
              p: 4,
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: '800px',
              fontFamily: fontFamily,
            }}
            id="document-preview-content"
          >
            {/* Header with Logo */}
            <Stack 
              direction={logoAlign === 'center' ? 'column' : 'row'} 
              justifyContent={logoAlign === 'right' ? 'space-between' : 'flex-start'} 
              alignItems={logoAlign === 'center' ? 'center' : 'flex-start'} 
              sx={{ 
                mb: 4,
                pb: 3,
                ...(headerBg ? { 
                  bgcolor: `${accentColor}12`, 
                  mx: -4, 
                  mt: -4, 
                  px: 4, 
                  pt: 4, 
                  borderBottom: `2px solid ${accentColor}` 
                } : { 
                  borderBottom: '1px solid #e0e0e0' 
                }),
                flexDirection: logoAlign === 'right' ? 'row-reverse' : logoAlign === 'center' ? 'column' : 'row',
                gap: 2,
              }}
            >
              <Box sx={{ flex: 1, textAlign: logoAlign }}>
                {showLogo && companyInfo?.logo_url && (
                  <Box
                    component="img"
                    src={companyInfo.logo_url}
                    alt={companyInfo.name}
                    sx={{ maxWidth: 200, maxHeight: 80, mb: 2 }}
                  />
                )}
                <Typography variant="h5" fontWeight={700} sx={{ color: accentColor, fontFamily: fontFamily }}>
                  {companyInfo?.name || 'Company Name'}
                </Typography>
                {showTagline && tagline && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily, fontStyle: 'italic' }}>
                    {tagline}
                  </Typography>
                )}
                {companyInfo?.address && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    {companyInfo.address}
                  </Typography>
                )}
                {(companyInfo?.city || companyInfo?.country) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    {[companyInfo.city, companyInfo.country].filter(Boolean).join(', ')}
                  </Typography>
                )}
                {companyInfo?.phone && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    Phone: {companyInfo.phone}
                  </Typography>
                )}
                {companyInfo?.email && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    Email: {companyInfo.email}
                  </Typography>
                )}
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: accentColor, mb: 1, fontFamily: fontFamily }}>
                  {documentTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                  {document.number}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                  Date: {formatDate(document.date)}
                </Typography>
                {document.due_date && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    Due: {formatDate(document.due_date)}
                  </Typography>
                )}
                {document.valid_until && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    Valid Until: {formatDate(document.valid_until)}
                  </Typography>
                )}
              </Box>
            </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Bill To / Ship To */}
          <Stack direction="row" spacing={4} sx={{ mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: accentColor, fontFamily: fontFamily }}>
                {documentType === 'invoice' || documentType === 'quote' ? 'BILL TO:' : 'VENDOR:'}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: fontFamily }}>
                {document.customer || document.vendor || 'N/A'}
              </Typography>
            </Box>
          </Stack>

          {/* Line Items Table */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '3fr 1fr 1fr 1fr',
                gap: 2,
                p: 1.5,
                bgcolor: accentColor,
                color: 'white',
                fontWeight: 600,
                borderRadius: '4px 4px 0 0',
                fontFamily: fontFamily,
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: fontFamily }}>Description</Typography>
              <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ fontFamily: fontFamily }}>Quantity</Typography>
              <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ fontFamily: fontFamily }}>Unit Price</Typography>
              <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ fontFamily: fontFamily }}>Amount</Typography>
            </Box>

            {document.lines.map((line, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr 1fr 1fr',
                  gap: 2,
                  p: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  fontFamily: fontFamily,
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: fontFamily }}>{line.description}</Typography>
                <Typography variant="body2" textAlign="right" sx={{ fontFamily: fontFamily }}>{line.quantity}</Typography>
                <Typography variant="body2" textAlign="right" sx={{ fontFamily: fontFamily }}>{formatCurrency(line.unit_price)}</Typography>
                <Typography variant="body2" textAlign="right" sx={{ fontFamily: fontFamily }}>
                  {formatCurrency(line.amount || line.quantity * line.unit_price)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Totals */}
          <Stack spacing={1} sx={{ ml: 'auto', maxWidth: 300 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontFamily: fontFamily }}>Subtotal:</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ fontFamily: fontFamily }}>
                {formatCurrency(document.sub_total)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontFamily: fontFamily }}>Tax:</Typography>
              <Typography variant="body2" fontWeight={500} sx={{ fontFamily: fontFamily }}>
                {formatCurrency(document.tax_total)}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" fontWeight={700} sx={{ fontFamily: fontFamily }}>Total:</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: accentColor, fontFamily: fontFamily }}>
                {formatCurrency(document.total)}
              </Typography>
            </Stack>
          </Stack>

          {/* Footer Notes */}
          {(document.comments || document.terms) && (
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              {document.terms && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, fontFamily: fontFamily }}>
                    Terms & Conditions:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    {document.terms}
                  </Typography>
                </Box>
              )}
              {document.comments && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, fontFamily: fontFamily }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                    {document.comments}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Bank Details and Signature */}
          {(showBankDetails || showSignatureLine) && (
            <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${accentColor}33` }}>
              {showBankDetails && (
                <Box sx={{ mb: 2 }}>
                  {companyInfo?.phone && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                      Phone: {companyInfo.phone}
                    </Typography>
                  )}
                  {companyInfo?.email && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                      Email: {companyInfo.email}
                    </Typography>
                  )}
                  {companyInfo?.tax_id && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                      Tax ID: {companyInfo.tax_id}
                    </Typography>
                  )}
                </Box>
              )}
              {showSignatureLine && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Box sx={{ borderTop: '1px solid #999', width: 200, textAlign: 'center', pt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: fontFamily }}>
                      Authorised Signature
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Footer Text */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontFamily: fontFamily }}>
              {footerText}
            </Typography>
          </Box>
        </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
