/**
 * Hook for managing document modals with draft/post functionality
 */
import { useState, useCallback, useEffect } from 'react';
import financeService from '@/services/financeService';

interface UseDocumentModalProps {
  documentType: 'invoice' | 'quote' | 'po' | 'bill';
  initialData?: any;
  onSuccess?: (message: string, severity?: 'success' | 'error') => void;
  onClose?: () => void;
}

export function useDocumentModal({
  documentType,
  initialData,
  onSuccess,
  onClose,
}: UseDocumentModalProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | undefined>(initialData?.id);
  const [isLoading, setIsLoading] = useState(false);

  // Reset when initialData changes
  useEffect(() => {
    setSavedDocId(initialData?.id);
    setIsDirty(false);
  }, [initialData?.id]);

  const saveDraft = useCallback(async (formData: any) => {
    setIsLoading(true);
    try {
      let result;
      
      if (savedDocId) {
        // Update existing draft
        switch (documentType) {
          case 'invoice':
            result = await financeService.autoSaveInvoice(savedDocId, formData);
            break;
          case 'quote':
            result = await financeService.autoSaveQuotation(savedDocId, formData);
            break;
          case 'po':
            result = await financeService.autoSavePurchaseOrder(savedDocId, formData);
            break;
          case 'bill':
            result = await financeService.autoSaveVendorBill(savedDocId, formData);
            break;
        }
      } else {
        // Create new draft
        switch (documentType) {
          case 'invoice':
            result = await financeService.saveDraftInvoice(formData);
            break;
          case 'quote':
            result = await financeService.saveDraftQuotation(formData);
            break;
          case 'po':
            result = await financeService.saveDraftPurchaseOrder(formData);
            break;
          case 'bill':
            result = await financeService.createVendorBill({ ...formData, status: 'DRAFT' });
            break;
        }
        setSavedDocId(result.data?.id || (result.data as any)?.vendor_bill?.id);
      }
      
      setIsDirty(false);
      setIsLoading(false);
      return { id: savedDocId || result.data?.id || (result.data as any)?.vendor_bill?.id };
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error?.response?.data?.message || 'Failed to save draft');
    }
  }, [documentType, savedDocId]);

  const postDocument = useCallback(async (formData: any) => {
    setIsLoading(true);
    try {
      if (savedDocId) {
        // Post existing draft
        switch (documentType) {
          case 'invoice':
            await financeService.postInvoice(savedDocId);
            break;
          case 'quote':
            await financeService.postQuotation(savedDocId);
            break;
          case 'po':
            await financeService.postPurchaseOrder(savedDocId);
            break;
          case 'bill':
            await financeService.postVendorBill(savedDocId);
            break;
        }
      } else {
        // Create and post in one go
        switch (documentType) {
          case 'invoice':
            await financeService.createInvoice(formData);
            break;
          case 'quote':
            await financeService.createQuotation(formData);
            break;
          case 'po':
            await financeService.createPurchaseOrder(formData);
            break;
          case 'bill':
            await financeService.createVendorBill(formData);
            break;
        }
      }
      
      setIsLoading(false);
      setIsDirty(false);
      onSuccess?.(
        `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} posted successfully`,
        'success'
      );
      onClose?.();
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error?.response?.data?.message || 'Failed to post document');
    }
  }, [documentType, savedDocId, onSuccess, onClose]);

  const autoSave = useCallback(async (formData: any) => {
    if (!isDirty) return;
    
    try {
      await saveDraft(formData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [isDirty, saveDraft]);

  return {
    isDirty,
    setIsDirty,
    savedDocId,
    setSavedDocId,
    isLoading,
    saveDraft,
    postDocument,
    autoSave,
  };
}
