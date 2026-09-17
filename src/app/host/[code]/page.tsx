import { HostDashboard } from '@/components/ui/CompetitionHost';
export default async function HostRoomPage({ params }: { params: Promise<{ code: string }> }) { const { code } = await params; return <HostDashboard code={code.toUpperCase()} />; }
