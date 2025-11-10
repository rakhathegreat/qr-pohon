import { useEffect, useState, type FormEvent } from 'react';

import Button from '@shared/components/Button';
import Input from '@shared/components/Input';

import { X } from 'lucide-react';

export type LocationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (lokasi: string) => Promise<void> | void;
  isSubmitting?: boolean;
};

const LocationModal = ({ open, onClose, onSubmit, isSubmitting = false }: LocationModalProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim() || isSubmitting) return;
    await onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-gray-900">Add New Location</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 hover:cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Location"
            placeholder="Contoh: Taman Kota Bandung"
            value={value}
            onValueChange={setValue}
            disabled={isSubmitting}
            required
            className="rounded-lg border-gray-200"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-32"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="w-full sm:w-40" disabled={isSubmitting || !value.trim()}>
              {isSubmitting ? 'Menyimpan…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal;
