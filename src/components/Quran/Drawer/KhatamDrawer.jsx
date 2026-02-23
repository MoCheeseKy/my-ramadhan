// Function untuk menampilkan drawer atau popup ucapan selamat saat khatam
export default function KhatamDrawer({ isKhatam, onResetFull }) {
  if (!isKhatam) return null;

  return (
    <>
      <div className='fixed inset-0 bg-black/50 z-50 transition-opacity' />
      <div className='fixed z-50 bg-white w-full bottom-0 left-0 p-6 rounded-t-2xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm md:rounded-2xl shadow-xl transition-all'>
        <div className='flex justify-center mb-4 md:hidden'>
          <div className='w-12 h-1.5 bg-gray-300 rounded-full' />
        </div>
        <h2 className='text-2xl font-bold mb-2 text-green-600 text-center'>
          Alhamdulillah!
        </h2>
        <p className='mb-6 text-gray-700 text-center'>
          Selamat, Anda telah khatam menyelesaikan bacaan Al-Quran.
        </p>
        <button
          onClick={onResetFull}
          className='w-full bg-green-600 text-white px-4 py-3 md:py-2 rounded-xl hover:bg-green-700 transition font-medium'
        >
          Reset Progress & Hapus Terakhir Dibaca
        </button>
      </div>
    </>
  );
}
