import ProjectsIdClient from './ProjectsIdClient';

export async function generateStaticParams() {
  return [{ id: 'new' }];
}

export default async function Page({ params }) {
  const { id } = await params;
  return <ProjectsIdClient id={id} />;
}
