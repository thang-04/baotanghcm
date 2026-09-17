import { Suspense } from 'react';
import { CompetitionJoin } from '@/components/ui/CompetitionPlayer';
export default function PlayPage() { return <Suspense fallback={<p>Đang chuẩn bị phòng chờ…</p>}><CompetitionJoin /></Suspense>; }
