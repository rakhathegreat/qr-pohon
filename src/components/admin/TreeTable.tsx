import { QrCode, SquarePen, Trash2 } from 'lucide-react';
import type { Tree } from '../../types/tree';
import { buttonVariants } from '../Button';
import { cn } from '../../lib/utils';

type TreeTableProps = {
  data: Tree[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewQr: (id: string) => void;
  className?: string;
};

const truncateId = (id: string) => `${id.slice(0, 6)}…${id.slice(-4)}`;

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const actionButton = cn(
  buttonVariants({ variant: 'ghost', size: 'sm' }),
  'border border-gray-200 text-gray-600 hover:border-brand-200'
);

const TreeTable = ({ data, onDelete, onEdit, onViewQr, className = '' }: TreeTableProps) => (
  <div className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white', className)}>
    <table className="min-w-full divide-y divide-gray-100 text-sm text-gray-700">
      <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <tr>
          <th scope="col" className="px-6 py-3 text-left">
            Tree ID
          </th>
          <th scope="col" className="px-6 py-3 text-left">
            Common Name
          </th>
          <th scope="col" className="px-6 py-3 text-left">
            Scientific Name
          </th>
          <th scope="col" className="px-6 py-3 text-left">
            Location
          </th>
          <th scope="col" className="px-6 py-3 text-left">
            Created
          </th>
          <th scope="col" className="px-6 py-3 text-right">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {data.map((tree) => (
          <tr key={tree.id} className="hover:bg-gray-50">
            <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-500">
              {truncateId(tree.id)}
            </td>
            <td className="px-6 py-4 font-medium text-gray-900">{tree.common_name}</td>
            <td className="px-6 py-4 italic text-gray-600">{tree.scientific_name}</td>
            <td className="px-6 py-4">
              <p className="text-sm text-gray-700">{tree.coordinates.location}</p>
              <p className="text-xs text-gray-400">
                {tree.coordinates.latitude}, {tree.coordinates.longitude}
              </p>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tree.created_at)}</td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onViewQr(tree.id)}
                  className={actionButton}
                  aria-label="View QR"
                >
                  <QrCode className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(tree.id)}
                  className={actionButton}
                  aria-label="Edit tree"
                >
                  <SquarePen className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(tree.id)}
                  className={cn(actionButton, 'text-red-600 hover:border-red-200')}
                  aria-label="Delete tree"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TreeTable;
