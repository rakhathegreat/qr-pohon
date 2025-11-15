import { useMemo, useState } from 'react';
import { AlertTriangle, Calendar, Download, FileDown, Filter, Sparkles } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import Button from '@shared/components/Button';
import { cn } from '@shared/lib/cn';


const NAVBAR_HEIGHT = 70;

type ReportTab = {
  id: string;
  label: string;
  description: string;
  metrics: Array<{ label: string; value: string; delta?: string }>;
  charts: string[];
  alerts: Array<{ title: string; detail: string; status: string }>;
  exports: Array<{ label: string; cadence: string }>;
};

const reportTabs: ReportTab[] = [
  {
    id: 'overview',
    label: 'Executive Overview',
    description: 'High level visibility for leadership reviews.',
    metrics: [
      { label: 'Active Teams', value: '24', delta: '+8%' },
      { label: 'Engagement Rate', value: '63%', delta: '+5%' },
      { label: 'Scan Coverage', value: '182 / 200' },
    ],
    charts: ['Scans per day', 'Top scanned habitats', 'Weekly retention', 'Mission conversion'],
    alerts: [
      { title: 'Scan surge detected', detail: 'West Bandung cluster is 18% above forecast', status: 'info' },
      { title: 'Stagnant area', detail: 'Cimahi shows a 6% dip in QR scans', status: 'warning' },
    ],
    exports: [
      { label: 'Weekly KPI Digest', cadence: 'Mondays 06:00' },
      { label: 'Leadership Snapshot', cadence: 'Fridays 16:00' },
    ],
  },
  {
    id: 'missions',
    label: 'Mission Analytics',
    description: 'Track mission completion, abandon rate, and incentive payouts.',
    metrics: [
      { label: 'Avg Missions/User', value: '3.4', delta: '+12%' },
      { label: 'Completion Rate', value: '38%', delta: '-3%' },
      { label: 'Rewards Claimed', value: '1.8K' },
    ],
    charts: ['Daily mission starts', 'Completion vs abandon', 'Reward cost trend', 'Top mission packs'],
    alerts: [
      { title: 'Low completion', detail: 'Mission pack #210 dropped to 29% completion', status: 'warning' },
      { title: 'Reward spike', detail: 'Badge redemptions climbed 14% last week', status: 'info' },
    ],
    exports: [
      { label: 'Mission CSV', cadence: 'Daily 18:00' },
      { label: 'Reward Ledger', cadence: 'Weekly Wednesday' },
    ],
  },
  {
    id: 'fraud',
    label: 'Fraud & Trust',
    description: 'Surface anomalies, investigate clusters, and resolve cases.',
    metrics: [
      { label: 'Flagged Sessions', value: '42', delta: '-18%' },
      { label: 'Escalation SLA', value: '2h 15m' },
      { label: 'Resolved Cases', value: '89%' },
    ],
    charts: ['Flag trend', 'Source heatmap', 'Resolution SLA', 'False positive ratio'],
    alerts: [
      { title: 'Suspicious cluster', detail: 'Duplicate QR usage near Ciwidey', status: 'error' },
      { title: 'Pending review', detail: 'Nine cases awaiting manual approval', status: 'warning' },
    ],
    exports: [
      { label: 'Fraud audit trail', cadence: 'Hourly if incident' },
      { label: 'Escalation digest', cadence: 'Daily 08:00' },
    ],
  },
  {
    id: 'operations',
    label: 'Ops & Logistics',
    description: 'Device uptime, stock levels, and maintenance workload.',
    metrics: [
      { label: 'Device Uptime', value: '99.3%' },
      { label: 'Low-stock SKUs', value: '5', delta: '+2' },
      { label: 'Maintenance Tickets', value: '28' },
    ],
    charts: ['Device health trend', 'Stock out forecast', 'Ticket backlog', 'Procurement lead time'],
    alerts: [
      { title: 'Pending maintenance', detail: '3 QR scanners in Bogor overdue for service', status: 'warning' },
      { title: 'Low stock notice', detail: 'Sticker rolls projected to run out in 4 days', status: 'info' },
    ],
    exports: [
      { label: 'Inventory snapshot', cadence: 'Daily 07:00' },
      { label: 'Maintenance queue', cadence: 'Weekly Friday' },
    ],
  },
  {
    id: 'geospatial',
    label: 'Geospatial Insights',
    description: 'Regional heatmaps, microclimate overlays, and scan density.',
    metrics: [
      { label: 'Active Regions', value: '12' },
      { label: 'Peak Slot', value: '16:00-18:00' },
      { label: 'Geofence Alerts', value: '7' },
    ],
    charts: ['Regional scan density', 'Microclimate overlay', 'Heatmap trend', 'Geofence triggers'],
    alerts: [
      { title: 'Heatmap anomaly', detail: 'Unexpected low scans in coastal cluster', status: 'warning' },
      { title: 'New hotspot', detail: 'Subang region jumped 21% in scans', status: 'success' },
    ],
    exports: [
      { label: 'GeoJSON feed', cadence: 'On demand' },
      { label: 'Heatmap tiles', cadence: 'Hourly' },
    ],
  },
];

const navItems: Array<{ id: ReportTab; label: string; detail: string }> = [
  { id: reportTabs[0].id as unknown as ReportTab, label: 'Insights Hub', detail: 'High level intelligence' },
  { id: reportTabs[1].id as unknown as ReportTab, label: 'Mission Analytics', detail: 'Player progression' },
  { id: reportTabs[2].id as unknown as ReportTab, label: 'Fraud & Trust', detail: 'Anomaly monitoring' },
  { id: reportTabs[3].id as unknown as ReportTab, label: 'Ops & Logistics', detail: 'Device & stock health' },
  { id: reportTabs[4].id as unknown as ReportTab, label: 'Geospatial', detail: 'Heatmaps & density' },
];


const Analytics = () => {
  const [activeTab, setActiveTab] = useState(reportTabs[0].id);
  const currentTab = useMemo(
    () => reportTabs.find((tab) => tab.id === activeTab) ?? reportTabs[0],
    [activeTab]
  );

  return (
    <div className="bg-geist-50" style={{ minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
      <div className="relative mx-auto w-full space-y-6">
        <header className="border-b border-gray-300 m-0">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4 py-7 md:py-10">
              <h1 className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Reports</h1>
              <p className="text-sm font-normal text-gray-900">
                Analyze your data to gain insights and make informed decisions.
              </p>
            </div>
          </div>
        </header>
        <section
          style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
          className="sticky top-0 z-20"
        >
          <div className="grid h-full grid-cols-4">
            {/* LEFT */}
            <div className="flex h-full flex-col border-r border-gray-300 px-5 py-6 overflow-y-auto">
              <div className="space-y-1 pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-600">Reports</p>
                <h2 className="text-xl font-semibold text-gray-900">Analytics Control</h2>
                <p className="text-xs text-gray-500">Pick a report domain and adjust filters.</p>
              </div>
              <div className="flex flex-wrap gap-2 pb-6">
                {['This week', 'Field only', 'QR scans'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="rounded-full border border-gray-200 px-4 py-1 text-xs font-medium text-gray-600 hover:border-brand-300 hover:text-brand-700"
                  >
                    {chip}
                  </button>
                ))}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-700 hover:border-brand-400"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Advanced
                </button>
              </div>
              <div className="space-y-3 overflow-y-auto pr-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-3 text-left transition',
                      activeTab === item.id
                        ? 'border-brand-600 bg-brand-50 text-brand-800'
                        : 'border-transparent bg-white text-gray-700 hover:border-gray-200'
                    )}
                  >
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </button>
                ))}
              </div>
              <div className="mt-auto grid gap-3 border-t border-dashed border-gray-200 pt-4">
                <Button size="sm" className="justify-start gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule export
                </Button>
                <Button size="sm" variant="outline" className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-span-3 h-full overflow-y-auto bg-geist-50 px-6 py-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Current view</p>
                  <h2 className="text-2xl font-semibold text-gray-900">{currentTab.label}</h2>
                  <p className="text-sm text-gray-500">{currentTab.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export data
                  </Button>
                  <Button size="sm" variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate insight
                  </Button>
                </div>
              </div>

              <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentTab.metrics.map((metric) => (
                  <Card key={metric.label} padding="lg" variant="solid" className="border border-gray-200 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {metric.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end justify-between">
                      <p className="text-3xl font-semibold text-gray-900">{metric.value}</p>
                      {metric.delta && (
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            metric.delta.startsWith('-') ? 'text-red-500' : 'text-emerald-600'
                          )}
                        >
                          {metric.delta}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section className="grid gap-5 md:grid-cols-2">
                {currentTab.charts.map((chart) => (
                  <div
                    key={chart}
                    className="h-64 rounded-2xl border border-dashed border-gray-300 bg-white/80 p-4 text-center text-sm text-gray-500"
                  >
                    <div className="flex h-full flex-col items-center justify-center space-y-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">Chart</span>
                      <p>{chart}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section className="grid gap-6 lg:grid-cols-2">
                <Card variant="solid" className="border border-gray-200 bg-white">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-gray-900">Alerts & Signals</CardTitle>
                      <p className="text-xs text-gray-500">Auto generated insights for {currentTab.label}</p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentTab.alerts.map((alert) => (
                      <div key={alert.title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                        <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                        <p className="text-xs text-gray-500">{alert.detail}</p>
                        <span className="mt-2 inline-flex rounded-full bg-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                          {alert.status}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card variant="solid" className="border border-gray-200 bg-white">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-gray-900">Exports</CardTitle>
                      <p className="text-xs text-gray-500">Scheduled + on-demand downloads</p>
                    </div>
                    <Download className="h-4 w-4 text-brand-500" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentTab.exports.map((exportItem) => (
                      <div key={exportItem.label} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                        <p className="text-sm font-semibold text-gray-900">{exportItem.label}</p>
                        <p className="text-xs text-gray-500">Next delivery: {exportItem.cadence}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
