import { Suspense } from 'react';
import FinancePage from './FinancePage';

export const metadata = { title: 'Finance' };

export default function Page() {
  return (
    <Suspense>
      <FinancePage />
    </Suspense>
  );
}
