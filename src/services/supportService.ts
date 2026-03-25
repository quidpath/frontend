import { gatewayClient } from './apiClient';

export interface SupportTicket {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: 'technical' | 'billing' | 'feature' | 'general';
  priority?: 'low' | 'medium' | 'high';
}

const supportService = {

  sendSupportEmail: (data: SupportTicket) =>
    gatewayClient.post('/api/support/contact/', data),

  sendFeedback: (data: { message: string; rating?: number }) =>
    gatewayClient.post('/api/support/feedback/', data),
};

export default supportService;
