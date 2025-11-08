import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/Card';
import Button from '@shared/components/Button';
import Badge from '@shared/components/Badge';

const sampleUsers = [
  { name: 'Ayu Wulandari', email: 'ayu@example.com', role: 'Superadmin', status: 'Aktif' },
  { name: 'Budi Setiawan', email: 'budi@example.com', role: 'Admin', status: 'Aktif' },
  { name: 'Lina Prameswari', email: 'lina@example.com', role: 'Petugas Lapangan', status: 'Suspend' },
];

const UserManagement = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
      <p className="text-gray-500">
        Kelola pemain, admin, dan petugas lapangan lengkap dengan kontrol akses dan tindakan cepat.
      </p>
    </div>

    <Card variant="solid" padding="lg">
      <CardHeader>
        <CardTitle>Profil Pengguna</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {sampleUsers.map((user) => (
            <div
              key={user.email}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user.role}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary">
                  Suspend
                </Button>
                <Button size="sm" variant="outline">
                  Reset Password
                </Button>
                <Button size="sm" variant="ghost">
                  Verifikasi Email
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
          Integrasi tabel RBAC akan ditempatkan di sini (role matrix Superadmin, Admin, Petugas).
        </div>
      </CardContent>
    </Card>
  </div>
);

export default UserManagement;
