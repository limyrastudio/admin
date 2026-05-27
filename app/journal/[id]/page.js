import JournalIdClient from './JournalIdClient';

export async function generateStaticParams() {
  return [{ id: 'new' }];
}

export default async function Page() {
  return <JournalIdClient />;
}
