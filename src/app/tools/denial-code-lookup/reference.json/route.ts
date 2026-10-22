import { getReferenceCodes } from '@/lib/denialCodes';

// Static file in the export: the lookup page fetches the full CARC/RARC list on demand instead of inlining it.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(getReferenceCodes());
}
