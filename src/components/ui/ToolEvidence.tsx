'use client';
import { usePathname } from 'next/navigation';
import { TOOLS } from '@/lib/toolRegistry';
export default function ToolEvidence() {
  const pathname = usePathname().replace(/\/$/, '');
  const tool = TOOLS.find(t => t.href === pathname);
  if (!tool || pathname.endsWith('/platform-telemetry')) return null;
  return <aside className="surface-card border-b px-4 py-3 text-sm" aria-label="Tool methodology and review status"><div className="max-w-7xl mx-auto">
    <strong>{tool.reviewStatus === 'reviewed' ? 'Reviewed reference tool' : 'Educational reference — review required'}</strong>
    <p className="text-muted mt-1">Use de-identified examples only. Outputs are draft estimates and checks; confirm codes, modifiers, coverage, contracts and deadlines before submitting a claim. {tool.reviewedAt ? `Reviewed ${tool.reviewedAt} by ${tool.reviewer}.` : 'A billing specialist has not yet verified this tool’s rules for a current effective date.'}</p>
    {tool.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="underline mr-3">Official reference collection</a>)}
  </div></aside>;
}
