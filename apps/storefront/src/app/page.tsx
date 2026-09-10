import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl font-bold text-emerald-600 mb-4">LYNKO-X</div>
      <p className="text-xl text-gray-600 max-w-xl mb-8">
        O'zbekiston uchun onlayn-do'kon platformasi. O'z do'koningizni bir necha
        daqiqada oching.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <a
          href="http://localhost:3000/register"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-6 py-3 transition"
        >
          Do'kon ochish
        </a>
        <Link
          href="/demo"
          className="border border-gray-300 hover:border-emerald-500 text-gray-700 font-medium rounded-xl px-6 py-3 transition"
        >
          Demo do'konni ko'rish
        </Link>
      </div>
    </div>
  );
}
