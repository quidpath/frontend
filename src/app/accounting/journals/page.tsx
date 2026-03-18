import { redirect } from 'next/navigation';
export default function Page() { redirect('/finance?tab=overview&sub=transactions'); }
