// src/pages/Main.tsx
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Main = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">

      <Navbar />

      {/* PENJELASAN & PENGENALAN */}
      <section className="container mx-auto px-6 pt-24 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-indigo-700">
          QR-Scanner Lite
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Aplikasi web super-ringan yang membantu kamu memindai kode QR
          secara instan <span className="text-indigo-600 font-semibold">tanpa instalasi apa pun</span>.
          Cukup tekan tombol “Scan QR”, arahkan kamera ke kode, dan kamu langsung
          diarahkan ke halaman detail yang sesuai.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/scan"
            className="inline-flex items-center px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
          >
            Scan QR
          </Link>

          <Link
            to="/history"
            className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-indigo-600 font-semibold border border-indigo-600 hover:bg-indigo-50 transition"
          >
            Riwayat Scan
          </Link>
        </div>
      </section>

      {/* ILUSTRASI KECIL (opsional) */}
      <section className="container mx-auto px-6 pb-16">
        <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur rounded-2xl p-6 shadow-md text-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-3">Cara Pakai</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Pilih tombol <b>Scan QR</b>.</li>
            <li>Izinkan akses kamera bila diminta.</li>
            <li>arahkan kamera ke kode QR.</li>
            <li>Otomatis masuk ke halaman detail.</li>
          </ol>
        </div>
      </section>
    </div>
  );
};

export default Main;