import ProtectedRoute from '@/components/ProtectedRoute';
import ResultDetailClient from '@/components/ResultDetailClient';

export default async function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <ResultDetailClient id={id} />
    </ProtectedRoute>
  );
}
