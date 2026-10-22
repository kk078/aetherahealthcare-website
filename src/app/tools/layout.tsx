import ToolEvidence from '@/components/ui/ToolEvidence';
import ToolJsonLd from '@/components/ui/ToolJsonLd';
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <><ToolJsonLd /><ToolEvidence />{children}</>;
}
