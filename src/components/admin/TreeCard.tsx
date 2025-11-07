import type { ReactNode } from 'react';
import { QrCode, SquarePen, Trash } from 'lucide-react';
import type { Tree } from '../../types/tree';

type TreeCardProps = {
  tree: Tree;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewQr: (id: string) => void;
  className?: string;
};

type InfoRowProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

const InfoRow = ({ label, value, valueClassName = 'text-gray-900' }: InfoRowProps) => (
  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className={`text-sm truncate font-semibold text-end ${valueClassName}`}>{value}</p>
  </div>
);

type IconActionButtonProps = {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'danger';
};

const IconActionButton = ({ onClick, children, variant = 'primary' }: IconActionButtonProps) => {
  const palette =
    variant === 'primary'
      ? 'bg-brand-500 text-white hover:bg-brand-600'
      : 'bg-red-500 text-white hover:bg-red-600';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-1 font-medium rounded-lg text-sm p-2 ${palette}`}
    >
      {children}
    </button>
  );
};

const TreeCard = ({ tree, onDelete, onEdit, onViewQr, className = '' }: TreeCardProps) => (
  <div className={`flex flex-col gap-2 p-6 border border-gray-300 rounded-lg ${className}`}>
    <InfoRow label="Tree ID" value={tree.id} valueClassName="text-gray-500" />
    <InfoRow label="Nama Pohon" value={tree.common_name} />
    <InfoRow label="Scientific Name" value={<em>{tree.scientific_name}</em>} />
    <InfoRow
      label="Coordinate"
      value={`${tree.coordinates.latitude}, ${tree.coordinates.longitude}`}
    />
    <InfoRow label="Location" value={tree.coordinates.location} />
    <InfoRow
      label="Created Date"
      value={
        tree.created_at
          ? new Date(tree.created_at).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-'
      }
      valueClassName="text-gray-500 text-xs"
    />

    <div className="flex items-center justify-end gap-2 mt-4">
      <IconActionButton onClick={() => onViewQr(tree.id)}>
        <QrCode className="w-4 h-4" />
      </IconActionButton>
      <IconActionButton onClick={() => onEdit(tree.id)}>
        <SquarePen className="w-4 h-4" />
      </IconActionButton>
      <IconActionButton variant="danger" onClick={() => onDelete(tree.id)}>
        <Trash className="w-4 h-4" />
      </IconActionButton>
    </div>
  </div>
);

export default TreeCard;
