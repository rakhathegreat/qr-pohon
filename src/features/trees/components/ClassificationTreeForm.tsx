import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';

import type { TreeFormValues } from '@features/trees/types';
import Button from '@shared/components/Button';
import Input from '@shared/components/Input';

const taxonomyFields: Array<keyof TreeFormValues['taxonomy']> = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
  'species',
];

const fieldSurfaceClass =
  'rounded-2xl border-gray-200 bg-white/80 shadow-inner focus-visible:border-brand-500 focus-visible:ring-brand-200';

const cloneValues = (values: TreeFormValues): TreeFormValues => ({
  ...values,
  taxonomy: { ...values.taxonomy },
  endemic: {
    ...values.endemic,
    countries: [...(values.endemic.countries ?? [])],
    provinces: [...(values.endemic.provinces ?? [])],
  },
  coordinates: { ...values.coordinates },
  characteristics: [...values.characteristics],
});

type ClassificationTreeFormProps = {
  initialValues: TreeFormValues;
  onSubmit: (values: TreeFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
};

const textareaBase =
  'w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-gray-100 disabled:text-gray-500';

const ClassificationTreeForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
}: ClassificationTreeFormProps) => {
  const [values, setValues] = useState<TreeFormValues>(() => cloneValues(initialValues));
  const [characteristicInput, setCharacteristicInput] = useState('');

  useEffect(() => {
    setValues(cloneValues(initialValues));
    setCharacteristicInput('');
  }, [initialValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const setTaxonomy = (field: keyof TreeFormValues['taxonomy'], value: string) => {
    setValues((prev) => ({
      ...prev,
      taxonomy: { ...prev.taxonomy, [field]: value },
    }));
  };

  const setEndemicArray = (
    field: keyof Pick<TreeFormValues['endemic'], 'countries' | 'provinces'>,
    value: string
  ) => {
    setValues((prev) => ({
      ...prev,
      endemic: {
        ...prev.endemic,
        [field]: value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      },
    }));
  };

  const handleCharacteristicAdd = () => {
    if (!characteristicInput.trim()) return;
    setValues((prev) => ({
      ...prev,
      characteristics: [...prev.characteristics, characteristicInput.trim()],
    }));
    setCharacteristicInput('');
  };

  const handleCharacteristicRemove = (index: number) => {
    setValues((prev) => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        badge="STEP 01"
        title="Informasi Dasar"
        description="Berikan identitas awal yang membantu tim mengenali pohon."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Common Name"
            placeholder="Nama umum pohon"
            required
            value={values.common_name}
            onValueChange={(val) => setValues((prev) => ({ ...prev, common_name: val }))}
            
          />
          <Input
            label="Scientific Name"
            placeholder="Nama ilmiah"
            required
            value={values.scientific_name}
            onValueChange={(val) => setValues((prev) => ({ ...prev, scientific_name: val }))}
            
          />
        </div>
      </FormSection>

      <FormSection
        badge="STEP 02"
        title="Struktur Taksonomi"
        description="Isi seluruh jenjang klasifikasi."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {taxonomyFields.map((field) => (
            <Input
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholder="Isi data"
              required
              value={values.taxonomy[field]}
              onValueChange={(val) => setTaxonomy(field, val)}
              
            />
          ))}
        </div>
      </FormSection>

      <FormSection
        badge="STEP 03"
        title="Asal dan Sebaran"
        description="Data ini membantu tim memahami konteks ekologi pohon."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Region"
            placeholder="Contoh: Jawa Barat"
            required
            value={values.endemic.region}
            onValueChange={(val) =>
              setValues((prev) => ({ ...prev, endemic: { ...prev.endemic, region: val } }))
            }
            
          />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Countries</label>
            <textarea
              rows={4}
              placeholder="Pisahkan dengan koma"
              className={textareaBase}
              value={values.endemic.countries.join(', ')}
              onChange={(event) => setEndemicArray('countries', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Provinces</label>
            <textarea
              rows={4}
              placeholder="Pisahkan dengan koma"
              className={textareaBase}
              value={values.endemic.provinces.join(', ')}
              onChange={(event) => setEndemicArray('provinces', event.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        badge="STEP 04"
        title="Deskripsi & Karakteristik"
        description="Tambahkan detail naratif dan poin penting tentang pohon."
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea
            rows={5}
            placeholder="Tuliskan ringkasan mengenai pohon..."
            className={textareaBase}
            value={values.description}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Characteristics</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Contoh: Tinggi 30 meter"
              value={characteristicInput}
              onValueChange={setCharacteristicInput}
              
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleCharacteristicAdd();
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full px-4 font-normal sm:w-auto"
              onClick={handleCharacteristicAdd}
              disabled={!characteristicInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {values.characteristics.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada karakteristik yang ditambahkan.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {values.characteristics.map((characteristic, index) => (
                <span
                  key={`${characteristic}-${index}`}
                  className="inline-flex items-center gap-2 rounded-md bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {characteristic}
                  <button
                    type="button"
                    onClick={() => handleCharacteristicRemove(index)}
                    className="text-gray-400 transition hover:text-gray-700"
                    aria-label={`Hapus karakteristik ${characteristic}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </FormSection>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full py-3 sm:w-48"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
        <Button type="submit" size="sm" className="w-full sm:w-48" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ClassificationTreeForm;

type FormSectionProps = {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
};

const FormSection = ({ title, description, badge, children }: FormSectionProps) => (
  <section className="rounded-3xl border border-gray-100 bg-white/90 p-6 ">
    <div className="mb-4 space-y-1">
      {badge && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-600">{badge}</p>
      )}
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);
