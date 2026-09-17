import { PublicCompetitionScreen } from '@/components/ui/CompetitionHost';
export default async function PublicScreenPage({ params }: { params: Promise<{ code: string }> }) { const { code } = await params; return <PublicCompetitionScreen code={code.toUpperCase()} />; }
