import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import Button from '@shared/components/Button';

const chartPlaceholders = [
  'Scans per Day / Week',
  'Top 10 Most Scanned Trees',
  'Player Retention',
  'Mission Conversion',
];

const kpis = [
  { label: 'DAU / WAU', value: '4.2K / 11K' },
  { label: 'Avg Scans / User', value: '6.8' },
  { label: 'Mission Completion Rate', value: '38%' },
  { label: 'Fraud Rate', value: '0.9%' },
  { label: 'Claim Processing Time', value: '2h 15m' },
  { label: 'Active Trees Scanned', value: '82%' },
  { label: 'Problematic QRs', value: '14' },
];

const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
      <p className="text-gray-500">Monitor product usage and export the key datasets.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} variant="subtle" padding="md">
          <p className="text-xs uppercase tracking-wide text-gray-500">{kpi.label}</p>
          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
        </Card>
      ))}
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      {chartPlaceholders.map((title) => (
        <Card key={title} variant="solid" padding="lg">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-2xl border border-dashed border-gray-300" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Card variant="solid" padding="lg">
      <CardHeader>
        <CardTitle>Export CSV</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {['Scans', 'Users', 'Trees'].map((label) => (
          <Button key={label} size="sm" variant="outline">
            Export {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default Analytics;
