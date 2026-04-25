import { CheckCircle, XCircle, Info, TriangleAlert } from 'lucide-react';

interface Props {
  type: string;
}

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error:   <XCircle size={20} />,
  warning: <TriangleAlert size={20} />,
};

export default function StatusIcon({ type }: Props) {
  return <>{icons[type] ?? <Info size={20} />}</>;
}