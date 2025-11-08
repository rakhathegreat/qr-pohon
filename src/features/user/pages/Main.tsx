import BottomNav from '@features/user/components/BottomNav';

import tree from '@assets/tree.jpg';
import tree2 from '@assets/tree2.jpg';

function App() {

  return (
    <div className="min-h-screen bg-brand-50 px-5 py-15">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-sans text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Temukan Kisah
                <span className='block text-brand-700'>di Balik Setiap Pohon</span>
              </h1>
              <p className="font-sans font-medium text-gray-600 mt-6">
                Setiap pohon punya kisahnya sendiri. Scan QR code dan biarkan pohon menceritakan siapa dirinya padamu!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='mb-10'>
        <div className='grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto px-4'>
          <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-xl">
            <img src={ tree } alt="Hero" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-xl">
            <img src={ tree2 } alt="Hero" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-brand-50 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-7">
            <h2 className="text-center font-sans text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              Kenali Pohon <span className='block text-brand-700'>dalam 2 Langkah</span>
            </h2>
          </div>

          <div className="flex flex-col gap-10">
            {/* Step 1 */}
            <div className="grid grid-cols-[2.5rem_1fr] gap-6">
              {/* kolom kiri: angka + garis */}
              <div className="flex flex-col items-center pt-2">
                <div className="bg-brand-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              {/* kolom kanan: konten */}
              <div className="pt-2">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Scan QR Code</h3>
                <p className="text-gray-600">Scan QR code pada pohon dengan kamera smartphone.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-[2.5rem_1fr] gap-6">
              {/* kolom kiri: angka + garis */}
              <div className="flex flex-col items-center pt-2">
                <div className="bg-brand-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>

              {/* kolom kanan: konten */}
              <div className="pt-2">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Lihat Informasi</h3>
                <p className="text-gray-600">Semua informasi pohon kini ada di genggamanmu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Informasi Pohon Lengkap
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dapatkan berbagai informasi menarik tentang pohon hanya dengan scan QR code
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-2xl hover:shadow-lg transition-all">
              <div className="bg-emerald-500 p-3 rounded-lg w-fit mb-6">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nama & Spesies</h3>
              <p className="text-gray-600">
                Lihat nama lokal, nama ilmiah, dan klasifikasi lengkap dari setiap pohon
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl hover:shadow-lg transition-all">
              <div className="bg-teal-500 p-3 rounded-lg w-fit mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Data Fisik</h3>
              <p className="text-gray-600">
                Informasi tinggi, diameter, usia, dan karakteristik fisik lainnya
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-lg transition-all">
              <div className="bg-green-500 p-3 rounded-lg w-fit mb-6">
                <TreePine className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fakta Menarik</h3>
              <p className="text-gray-600">
                Pelajari fakta unik, manfaat, dan cerita menarik di balik setiap pohon
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-all">
              <div className="bg-blue-500 p-3 rounded-lg w-fit mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lokasi & Habitat</h3>
              <p className="text-gray-600">
                Ketahui lokasi penanaman, habitat asli, dan persebaran geografis
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-lg transition-all">
              <div className="bg-purple-500 p-3 rounded-lg w-fit mb-6">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Galeri Foto</h3>
              <p className="text-gray-600">
                Lihat foto daun, bunga, buah, dan bagian lain dari pohon tersebut
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-lg transition-all">
              <div className="bg-orange-500 p-3 rounded-lg w-fit mb-6">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Scan Mudah</h3>
              <p className="text-gray-600">
                Cukup arahkan kamera ke QR code untuk mengakses semua informasi
              </p>
            </div>
          </div>
        </div>
      </section> */}



      <BottomNav />
    </div>
  );
}

export default App;
