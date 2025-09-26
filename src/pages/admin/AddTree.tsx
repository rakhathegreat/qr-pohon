import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Tree } from './Tree';
import { ArrowLeft, X } from 'lucide-react';
import uuid from 'react-uuid';

const AddTree: React.FC = () => {
  const nav = useNavigate();
  const [form, setForm] = useState<Tree>({
    id: uuid().toString(),
    common_name: '',
    scientific_name: '',
    taxonomy: {
      kingdom: '',
      phylum: '',
      class: '',
      order: '',
      family: '',
      genus: '',
      species: '',
    },
    endemic: { region: '', countries: [], provinces: [] },
    coordinates: { latitude: 0, longitude: 0, location: '' },
    description: '',
    characteristics: [],
    created_at: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [charInput, setCharInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('trees').insert([form]);
    setLoading(false);
    if (!error) nav('/');
    else alert(error.message);
  };

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-4">
      <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-gray-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold">Add New Tree</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-8">
          {/* Common & Scientific */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-800">Common name</span>
              <input
                required
                placeholder="Common name"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                value={form.common_name}
                onChange={(e) => setForm({ ...form, common_name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-gray-800">Scientific name</span>
              <input
                required
                placeholder="Scientific name"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                value={form.scientific_name}
                onChange={(e) => setForm({ ...form, scientific_name: e.target.value })}
              />
            </div>
          </div>

          {/* Taxonomy */}
          <div className="relative border border-brand-700 rounded-lg px-4 py-4">
            <span className="bg-white absolute top-[-0.75rem] left-2 px-2 text-brand-700 font-medium">Taxonomy</span>
            <div className="grid grid-cols-2 gap-3 pt-3">
              {Object.keys(form.taxonomy).map((k) => (
                <div className="flex flex-col gap-1" key={k}>
                  <span className="font-medium text-gray-800">{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                  <input
                    required
                    placeholder="..."
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                    value={form.taxonomy[k as keyof typeof form.taxonomy]}
                    onChange={(e) => setForm({ ...form, taxonomy: { ...form.taxonomy, [k]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Endemic */}
          <div className="relative border border-brand-700 rounded-lg px-4 py-4">
            <span className="bg-white absolute top-[-0.75rem] left-2 px-2 text-brand-700 font-medium">Endemic</span>
            <div className="flex flex-col md:flex-row gap-2 pt-3">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-800">Region</span>
                <input
                  required
                  placeholder="Region"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                  value={form.endemic.region}
                  onChange={(e) => setForm({ ...form, endemic: { ...form.endemic, region: e.target.value } })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-800">Countries</span>
                <textarea
                  placeholder="Countries (comma separated)"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                  value={form.endemic.countries.join(', ')}
                  onChange={(e) =>
                    setForm({ ...form, endemic: { ...form.endemic, countries: e.target.value.split(',').map((s) => s.trim()) } })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-800">Provinces</span>
                <textarea
                  placeholder="Provinces (comma separated)"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                  value={form.endemic.provinces?.join(', ')}
                  onChange={(e) =>
                    setForm({ ...form, endemic: { ...form.endemic, provinces: e.target.value.split(',').map((s) => s.trim()) } })
                  }
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="relative border border-brand-700 rounded-lg px-4 py-4">
            <span className="bg-white absolute top-[-0.75rem] left-2 px-2 text-brand-700 font-medium">Location</span>
            <div className="flex flex-col md:flex-row gap-2 pt-3">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-800">Coordinates</span>
                <input
                  required
                  placeholder="Latitude, Longitude"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                  value={`${form.coordinates.latitude}, ${form.coordinates.longitude}`}
                  onChange={(e) => {
                    const [lat, lon] = e.target.value.split(',').map((s) => parseFloat(s.trim()));
                    setForm({
                      ...form,
                      coordinates: { ...form.coordinates, latitude: lat || 0, longitude: lon || 0 },
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-800">Location</span>
                <input
                  required
                  placeholder="Location"
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                  value={form.coordinates.location}
                  onChange={(e) =>
                    setForm({ ...form, coordinates: { ...form.coordinates, location: e.target.value } })
                  }
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <textarea
            placeholder="Description"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Characteristics */}
          <div>
            <label className="font-medium text-gray-800">Characteristics</label>
            <div className="flex gap-2 mt-1">
              <input
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                placeholder="e.g. Height: 30 m"
                value={charInput}
                onChange={(e) => setCharInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && charInput.trim()) {
                    setForm({ ...form, characteristics: [...form.characteristics, charInput.trim()] });
                    setCharInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (charInput.trim()) {
                    setForm({ ...form, characteristics: [...form.characteristics, charInput.trim()] });
                    setCharInput('');
                  }
                }}
                className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
              >
                Add
              </button>
            </div>
            <ul className="list-disc mt-2 text-sm font-medium text-gray-700 flex flex-row flex-wrap gap-2">
              {form.characteristics.map((c, idx) => (
                <li key={idx} className="flex items-center border border-gray-300 py-2 pl-5 pr-3 rounded-lg gap-2">
                  {c}
                  <button
                    onClick={() => {
                      const newChars = form.characteristics.filter((_, i) => i !== idx);
                      setForm({ ...form, characteristics: newChars });
                    }}
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-gray-800" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full flex gap-3">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="w-full py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTree;