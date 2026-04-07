import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function TaxesPage() {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Narrative */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-outline-variant/30 pb-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-7xl font-bold font-heading text-foreground mb-4 tracking-tighter">
            Your <span className="text-primary italic font-serif">Taxes.</span>
          </h1>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Easily view generated tax receipts and track your accumulated tourism levies.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-surface-dim hover:bg-surface-container-low transition-colors text-on-surface-variant bg-transparent">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Zero-Card Data Presentation */}
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              Recent Receipts
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-outline">
                Automated by KRA
            </span>
        </div>

        <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm">
          <Table>
            <TableHeader className="bg-surface-container-low/50">
              <TableRow className="border-b border-outline-variant/20 hover:bg-transparent">
                <TableHead className="py-5 font-semibold text-on-surface">Booking Ref</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Date</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Guest Name</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Amount (KES)</TableHead>
                <TableHead className="py-5 font-semibold text-on-surface">Receipt Status</TableHead>
                <TableHead className="text-right py-5 font-semibold text-on-surface">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                <TableCell className="py-5 font-mono text-sm text-on-surface-variant">BKG-001</TableCell>
                <TableCell className="py-5 text-on-surface-variant">Mar 20, 2026</TableCell>
                <TableCell className="py-5 font-medium text-foreground">Alice Ochieng</TableCell>
                <TableCell className="py-5 text-on-surface-variant">14,500</TableCell>
                <TableCell className="py-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20">
                    Generated
                  </span>
                </TableCell>
                <TableCell className="py-5 text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 transition-colors">View URL</Button>
                </TableCell>
              </TableRow>
              <TableRow className="border-b border-outline-variant/10 hover:bg-surface-container-low/30 transition-colors">
                <TableCell className="py-5 font-mono text-sm text-on-surface-variant">BKG-002</TableCell>
                <TableCell className="py-5 text-on-surface-variant">Mar 21, 2026</TableCell>
                <TableCell className="py-5 font-medium text-foreground">John Doe</TableCell>
                <TableCell className="py-5 text-on-surface-variant">8,000</TableCell>
                <TableCell className="py-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                    Pending
                  </span>
                </TableCell>
                <TableCell className="py-5 text-right">
                  <Button variant="ghost" size="sm" disabled className="text-on-surface-variant">View URL</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
