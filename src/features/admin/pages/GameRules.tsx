import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';

const GameRules = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Aturan Game & Gamifikasi</h1>
      <p className="text-gray-500">
        Konfigurasi poin, misi, dan badge agar mekanik permainan tetap seimbang.
      </p>
    </div>

    <Card variant="solid" padding="lg">
      <CardHeader>
        <CardTitle>Konfigurasi Poin</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Input label="Poin Scan Pertama" type="number" defaultValue="10" />
        <Input label="Cooldown Repeat Scan (menit)" type="number" defaultValue="15" />
        <Input label="Bonus Lokasi (%)" type="number" defaultValue="20" />
        <Input label="Bonus Spesies Langka (%)" type="number" defaultValue="35" />
      </CardContent>
    </Card>

    <Card variant="solid" padding="lg">
      <CardHeader>
        <CardTitle>Misi / Quest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-600">
          Periode Maret 2025 • Scan 15 pohon berbeda • Hadiah 300 poin + badge “Explorer”.
        </div>
        <Button size="sm">Tambah Misi</Button>
      </CardContent>
    </Card>

    <Card variant="solid" padding="lg">
      <CardHeader>
        <CardTitle>Badge & Achievement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Event-based</p>
            <p>Badge spesial selama Festival Hutan Kota.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Milestone-based</p>
            <p>Scan 100 pohon untuk badge “Pioneer”.</p>
          </div>
        </div>
        <Button size="sm" variant="outline">
          Kelola Badge
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default GameRules;
