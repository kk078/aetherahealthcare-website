import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2, FileSpreadsheet, CalendarClock, Zap } from 'lucide-react';

interface ToolConversionBridgeProps {
  toolName?: string;
  contextText?: string;
}

export default function ToolConversionBridge({
  toolName,
  contextText = 'Put these calculations to work in your practice with zero financial obligation.',
}: ToolConversionBridgeProps) {
  return (
    <section className="mt-14 pt-10 border-t border-gray/15">
      <div className="bg-gradient-to-br from-navy via-navy to-[#083358] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* subtle background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-mint/15 border border-mint/30 px-3 py-1 rounded-full text-mint text-xs font-semibold uppercase tracking-wider mb-4">
            <Zap className="h-3.5 w-3.5" />
            Next Step For Your Practice
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-jakarta leading-tight mb-3">
            {toolName ? `Turn these ${toolName} insights into recovered cash` : 'Stop revenue leaks before they hit your balance sheet'}
          </h3>

          <p className="text-cream/80 text-sm sm:text-base leading-relaxed mb-6">
            {contextText} Let our senior AAPC-certified billing team audit 50 of your active claims or past denials — completely free, with guaranteed under-48-hour findings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-mint font-bold text-sm mb-1">
                <ShieldCheck className="h-4 w-4" />
                Free 50-Claim Audit Pilot
              </div>
              <p className="text-cream/70 text-xs leading-relaxed">
                Test our scrub rules and appeal workflow on 50 real claims. Zero commitment, no credit card required.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-mint font-bold text-sm mb-1">
                <FileSpreadsheet className="h-4 w-4" />
                Instant A/R Gap Analysis
              </div>
              <p className="text-cream/70 text-xs leading-relaxed">
                Upload your aging report for instant benchmark comparisons against MGMA standards and recoverable cash projections.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              prefetch={false}
              href="/schedule"
              className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-mint text-navy font-bold py-3.5 px-6 rounded-full transition-colors text-sm shadow-md"
            >
              <CalendarClock className="h-4 w-4" />
              Schedule 50-Claim Pilot
            </Link>

            <Link
              prefetch={false}
              href="/free-assessment"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-3.5 px-6 rounded-full transition-colors text-sm"
            >
              Run Free A/R Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-cream/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> 98%+ Clean Claim Rate
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> &lt;24h Submission SLA
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-mint" /> HIPAA BAA Provided
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
