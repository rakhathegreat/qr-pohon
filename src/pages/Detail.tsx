// src/pages/Detail.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card'
import Badge from '../components/Badge'
import { supabase } from '../lib/supabase'

export default function Detail() {
  const { id } = useParams<{ id: string }>() // UUID string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) setData(data)
      else console.error(error)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="p-10">Loading…</div>
  if (!data) return <div className="p-10">Pohon tidak ditemukan</div>

  return (
    <div>
      <div className="px-10 py-10 bg-brand-50 space-y-4">
        {/* Header */}
        <div className="flex flex-col mb-2">
          <h1 className="font-sans text-2xl font-bold">{data.common_name}</h1>
          <p className="text-gray-500 italic">{data.scientific_name}</p>
        </div>

        <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-xl">
          <Leaf className="w-8 h-8 text-gray-400" />
        </div>

        {/* Taxonomy */}
        <Card className="px-6 py-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-brand-600">Tree Taxonomy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.taxonomy).map(([rank, name]: [string, any]) => (
              <div key={rank} className="flex items-center justify-between">
                <span className="font-sans font-medium text-gray-700 capitalize">{rank}:</span>
                <Badge variant="default">{name}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Endemic Info */}
        <Card className="px-6 py-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-brand-600">Informasi Endemik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-start justify-between space-y-2">
              <span className="font-sans font-medium text-gray-700">Wilayah:</span>
              <Badge variant="default">{data.endemic.region}</Badge>
            </div>
            <div className="flex flex-col items-start justify-between space-y-2">
              <span className="font-sans font-medium text-gray-700">Negara:</span>
              <div className="flex flex-wrap gap-2">
                {data.endemic.countries.map((c: string) => (
                  <Badge key={c} variant="default">{c}</Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-start justify-between space-y-2">
              <span className="font-sans font-medium text-gray-700">Provinsi:</span>
              <div className="flex flex-wrap gap-2">
                {data.endemic.provinces.map((p: string) => (
                  <Badge key={p} variant="outline">{p}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="px-6 py-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-brand-600">Lokasi dan Koordinat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-start justify-between space-y-2">
              <span className="font-sans font-medium text-gray-700">Koordinat:</span>
              <Badge variant="default">{data.coordinates.latitude}, {data.coordinates.longitude}</Badge>
            </div>
            <div className="flex flex-col items-start justify-between space-y-2">
              <span className="font-sans font-medium text-gray-700">Lokasi:</span>
              <p className="text-gray-700 text-sm font-bold">{data.coordinates.location}</p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="px-6 py-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-brand-600">Deskripsi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900">{data.description}</p>
          </CardContent>
        </Card>

        {/* Characteristics */}
        <Card className="px-6 py-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-brand-600">Karakteristik</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-gray-900">
              {data.characteristics.map((c: string, idx: number) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Navbar />
    </div>
  )
}