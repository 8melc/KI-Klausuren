export interface GradeInfo {
  label: string;
  badgeClass: string;
  status: 'excellent' | 'good' | 'average' | 'weak' | 'poor';
}

export function getGradeInfo(percent: number): GradeInfo {
  if (percent >= 90) {
    return { label: '1', badgeClass: 'grade-badge-excellent', status: 'excellent' };
  }
  if (percent >= 80) {
    return { label: '2', badgeClass: 'grade-badge-good', status: 'good' };
  }
  if (percent >= 65) {
    return { label: '3', badgeClass: 'grade-badge-average', status: 'average' };
  }
  if (percent >= 50) {
    return { label: '4', badgeClass: 'grade-badge-average', status: 'average' };
  }
  if (percent >= 35) {
    return { label: '5', badgeClass: 'grade-badge-weak', status: 'weak' };
  }
  return { label: '6', badgeClass: 'grade-badge-poor', status: 'poor' };
}
