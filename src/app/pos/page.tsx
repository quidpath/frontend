import type { Metadata } from 'next';
import POSDashboard from '@/modules/pos/POSDashboard';
export const metadata: Metadata = { title: 'Point of Sale' };
export default function POSPage() { return <POSDashboard />; }
