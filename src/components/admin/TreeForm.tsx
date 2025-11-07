import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { TreeFormValues } from '../../types/tree';

type TreeFormProps = {
  initialValues: TreeFormValues;
  onSubmit: (values: TreeFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
};

const cloneFormValues = (values: TreeFormValues): TreeFormValues => ({
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

const taxonomyFields: Array<keyof TreeFormValues['taxonomy']> = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
  'species',
];

const TreeForm = ({
  initialValues,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
}: TreeFormProps) => {
  const [values, setValues] = useState<TreeFormValues>(() => cloneFormValues(initialValues));
  const [characteristicInput, setCharacteristicInput] = useState('');

  useEffect(() => {
    setValues(cloneFormValues(initialValues));
  }, [initialValues]);

  const disabled = isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  const formattedCreatedAt = useMemo(() => {
    if (!values.created_at) return '-';
    return new Date(values.created_at).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [values.created_at]);

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
      endemic: { ...prev.endemic, [field]: value.split(',').map((item) => item.trim()).filter(Boolean) },
    }));
  };

  const setCoordinates = (field: keyof TreeFormValues['coordinates'], value: string) => {
    const toNumeric = () => {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    setValues((prev) => ({
      ...prev,
      coordinates: {
        ...prev.coordinates,
        [field]: field === 'location' ? value : toNumeric(),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-800">Tree ID</span>
          <input
            value={values.id}
            disabled
            className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
          />
          <span className="text-xs text-gray-500">Generated automatically</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-800">Created At</span>
          <input
            value={formattedCreatedAt}
            disabled
            className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-800">Common Name</span>
          <input
            required
            placeholder="Common name"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            value={values.common_name}
            onChange={(event) => setValues((prev) => ({ ...prev, common_name: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-800">Scientific Name</span>
          <input
            required
            placeholder="Scientific name"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            value={values.scientific_name}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, scientific_name: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="relative border border-brand-700 rounded-lg px-4 py-4">
        <span className="bg-white absolute -top-3 left-2 px-2 text-brand-700 font-medium">
          Taxonomy
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          {taxonomyFields.map((field) => (
            <div className="flex flex-col gap-1" key={field}>
              <span className="font-medium text-gray-800 capitalize">{field}</span>
              <input
                required
                placeholder="..."
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                value={values.taxonomy[field]}
                onChange={(event) => setTaxonomy(field, event.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative border border-brand-700 rounded-lg px-4 py-4">
        <span className="bg-white absolute -top-3 left-2 px-2 text-brand-700 font-medium">
          Endemic
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-800">Region</span>
            <input
              required
              placeholder="Region"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
              value={values.endemic.region}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  endemic: { ...prev.endemic, region: event.target.value },
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-800">Countries</span>
            <textarea
              placeholder="Comma separated"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 min-h-[72px]"
              value={values.endemic.countries.join(', ')}
              onChange={(event) => setEndemicArray('countries', event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-800">Provinces</span>
            <textarea
              placeholder="Comma separated"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 min-h-[72px]"
              value={values.endemic.provinces.join(', ')}
              onChange={(event) => setEndemicArray('provinces', event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="relative border border-brand-700 rounded-lg px-4 py-4">
        <span className="bg-white absolute -top-3 left-2 px-2 text-brand-700 font-medium">
          Location
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-800">Latitude</span>
            <input
              required
              type="number"
              step="any"
              placeholder="Latitude"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
              value={values.coordinates.latitude}
              onChange={(event) => setCoordinates('latitude', event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-gray-800">Longitude</span>
            <input
              required
              type="number"
              step="any"
              placeholder="Longitude"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
              value={values.coordinates.longitude}
              onChange={(event) => setCoordinates('longitude', event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1 md:col-span-1">
            <span className="font-medium text-gray-800">Location</span>
            <input
              required
              placeholder="Location"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
              value={values.coordinates.location}
              onChange={(event) => setCoordinates('location', event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-medium text-gray-800">Description</span>
        <textarea
          placeholder="Description"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 min-h-[120px]"
          value={values.description}
          onChange={(event) => setValues((prev) => ({ ...prev, description: event.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-medium text-gray-800">Characteristics</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            placeholder="e.g. Height: 30 m"
            value={characteristicInput}
            onChange={(event) => setCharacteristicInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleCharacteristicAdd();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCharacteristicAdd}
            className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
          >
            Add
          </button>
        </div>
        <ul className="list-disc mt-2 text-sm font-medium text-gray-700 flex flex-row flex-wrap gap-2">
          {values.characteristics.map((characteristic, index) => (
            <li
              key={`${characteristic}-${index}`}
              className="flex items-center border border-gray-300 py-2 pl-5 pr-3 rounded-lg gap-2"
            >
              {characteristic}
              <button type="button" onClick={() => handleCharacteristicRemove(index)}>
                <X className="w-4 h-4 text-gray-500 hover:text-gray-800" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 border border-gray-300 rounded hover:bg-gray-100"
          disabled={disabled}
        >
          {cancelLabel}
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="w-full py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TreeForm;
