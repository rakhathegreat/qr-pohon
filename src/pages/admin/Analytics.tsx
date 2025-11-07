import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import Button from '../../components/Button';

const chartPlaceholders = [
  'Scan per Hari / Minggu',
  'Top 10 Pohon Ter-scan',
  'Retention Pemain',
  'Konversi Misi',
];

const kpis = [
  { label: 'DAU / WAU', value: '4.2K / 11K' },
  { label: 'Rata-rata Scan/User', value: '6.8' },
  { label: 'Completion Rate Misi', value: '38%' },
  { label: 'Fraud Rate', value: '0.9%' },
  { label: 'Waktu Proses Klaim', value: '2h 15m' },
  { label: 'Pohon Aktif Ter-scan', value: '82%' },
  { label: 'QR Bermasalah', value: '14' },
];

const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Analitik</h1>
      <p className="text-gray-500">Pantau performa penggunaan & ekspor data penting.</p>
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
        <CardTitle>Ekspor CSV</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {['Scan', 'User', 'Pohon'].map((label) => (
          <Button key={label} size="sm" variant="outline">
            Ekspor {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default Analytics;
