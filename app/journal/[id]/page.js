import JournalIdClient from './JournalIdClient';

export async function generateStaticParams() {
  return [{ id: 'new' }];
}

export default async function Page({ params }) {
  const { id } = await params;
  return <JournalIdClient id={id} />;
}
