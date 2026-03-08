import { useState } from 'react';
import { User, Lock, Loader2, Shield, Database, Globe, Zap, Server, HardDrive, Key, Download, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Success', description: 'Password updated successfully' }); setPasswords({ new: '', confirm: '' }); }
    setIsChangingPassword(false);
  };

  const fetchExportData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-export`,
      { headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' } }
    );
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Export failed'); }
    return await res.json();
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const jsonToCsv = (data: Record<string, unknown[]>): string => {
    let csv = '';
    for (const [table, rows] of Object.entries(data)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;
      csv += `\n=== ${table.toUpperCase()} ===\n`;
      const headers = Object.keys(rows[0] as Record<string, unknown>);
      csv += headers.join(',') + '\n';
      rows.forEach((row: unknown) => {
        const r = row as Record<string, unknown>;
        csv += headers.map(h => {
          const val = r[h];
          const str = val === null || val === undefined ? '' : String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',') + '\n';
      });
    }
    return csv;
  };

  const jsonToPdfHtml = (exportData: Record<string, unknown>): string => {
    const data = exportData.data as Record<string, unknown[]>;
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Indus Tours Full Export</title>
      <style>body{font-family:Arial,sans-serif;font-size:11px;padding:20px;color:#222}
      h1{font-size:18px;border-bottom:2px solid #1a7a4c;padding-bottom:8px}
      h2{font-size:14px;margin-top:24px;color:#1a7a4c;border-bottom:1px solid #ddd;padding-bottom:4px}
      table{border-collapse:collapse;width:100%;margin:8px 0 16px}
      th,td{border:1px solid #ddd;padding:4px 6px;text-align:left;font-size:10px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      th{background:#f5f5f5;font-weight:bold}
      .meta{color:#666;font-size:10px;margin-bottom:16px}
      @media print{body{padding:0}}</style></head><body>
      <h1>🏔️ Indus Tours — Full Data Export</h1>
      <p class="meta">Exported: ${exportData.exported_at} | By: ${exportData.exported_by}</p>`;
    for (const [table, rows] of Object.entries(data)) {
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const headers = Object.keys(rows[0] as Record<string, unknown>);
      html += `<h2>${table.replace(/_/g, ' ').toUpperCase()} (${rows.length})</h2><table><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
      rows.slice(0, 500).forEach((row: unknown) => {
        const r = row as Record<string, unknown>;
        html += `<tr>${headers.map(h => {
          const v = r[h]; const s = v === null ? '' : typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v).slice(0, 80);
          return `<td>${s}</td>`;
        }).join('')}</tr>`;
      });
      if (rows.length > 500) html += `<tr><td colspan="${headers.length}" style="text-align:center;color:#999">... and ${rows.length - 500} more rows</td></tr>`;
      html += '</table>';
    }
    html += '</body></html>';
    return html;
  };

  const handleMegaExport = async (format: 'json' | 'csv' | 'pdf') => {
    setIsExporting(format);
    toast({ title: 'Exporting...', description: `Preparing ${format.toUpperCase()} export. Please wait.` });
    try {
      const exportData = await fetchExportData();
      const date = new Date().toISOString().split('T')[0];
      if (format === 'json') {
        downloadFile(JSON.stringify(exportData, null, 2), `indus-tours-export-${date}.json`, 'application/json');
      } else if (format === 'csv') {
        const csv = jsonToCsv(exportData.data as Record<string, unknown[]>);
        downloadFile(csv, `indus-tours-export-${date}.csv`, 'text/csv');
      } else if (format === 'pdf') {
        const html = jsonToPdfHtml(exportData);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      }
      toast({ title: 'Export Complete', description: `${format.toUpperCase()} export ready.` });
    } catch (err) {
      toast({ title: 'Export Failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
    setIsExporting(null);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Account */}
      <Card className="border-0 admin-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Role</p>
              <Badge variant="default" className="mt-0.5 bg-primary/20 text-primary border-primary/30"><Shield className="w-3 h-3 mr-1" /> Administrator</Badge>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] col-span-2">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">User ID</p>
              <p className="text-[11px] font-mono text-muted-foreground">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-0 admin-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-accent" />
            </div>
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">New Password</label>
              <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="Min 6 characters" className="mt-1 bg-white/[0.02]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confirm Password</label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Re-enter password" className="mt-1 bg-white/[0.02]" />
            </div>
          </div>
          <Button onClick={changePassword} disabled={isChangingPassword || !passwords.new || !passwords.confirm} size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
            {isChangingPassword ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Updating...</> : <><Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password</>}
          </Button>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-0 admin-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Platform', value: 'Lovable Cloud', icon: Zap, color: 'text-primary' },
              { label: 'Framework', value: 'React + Vite', icon: Globe, color: 'text-blue-400' },
              { label: 'Database', value: 'PostgreSQL', icon: Database, color: 'text-emerald-400' },
              { label: 'Storage', value: 'Cloud Storage', icon: HardDrive, color: 'text-purple-400' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mega Export */}
      <Card className="border border-primary/20 bg-primary/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
            Mega Export — Download Everything
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-muted-foreground mb-4">
            Export all data including bookings, users, tours, vehicles, hotels, deals, feedback, contact messages, 
            blog posts, gallery, newsletter subscribers, activity logs, visitor logs, login attempts, banned IPs, 
            user bans, sessions, loyalty points, referrals, abandoned bookings, and site settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleMegaExport('json')} disabled={!!isExporting} size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              {isExporting === 'json' ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Exporting...</> : <><FileJson className="w-3.5 h-3.5 mr-1.5" /> JSON</>}
            </Button>
            <Button onClick={() => handleMegaExport('csv')} disabled={!!isExporting} size="sm" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20">
              {isExporting === 'csv' ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Exporting...</> : <><FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> CSV</>}
            </Button>
            <Button onClick={() => handleMegaExport('pdf')} disabled={!!isExporting} size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
              {isExporting === 'pdf' ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</> : <><FileText className="w-3.5 h-3.5 mr-1.5" /> PDF (Print)</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border border-destructive/10 bg-destructive/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-muted-foreground mb-3">These actions are irreversible. Proceed with caution.</p>
        </CardContent>
      </Card>
    </div>
  );
}
