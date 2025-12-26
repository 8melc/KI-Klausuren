import ProtectedRoute from '@/components/ProtectedRoute';
import ResultDetailClient from '@/components/ResultDetailClient';

export default function ResultDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <ResultDetailClient id={params.id} />
    </ProtectedRoute>
  );
}
