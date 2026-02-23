import { X } from 'lucide-react';

// Function untuk menampilkan laci statistik heatmap bacaan bulanan
export default function HeatmapStatsDrawer({ isOpen, onClose, readDays = [] }) {
  if (!isOpen) return null;

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <>
      <div
        className='fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='fixed z-50 bg-white dark:bg-slate-900 flex flex-col w-full bottom-0 left-0 max-h-[85vh] rounded-t-2xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] md:max-h-[80vh] md:rounded-2xl shadow-2xl transition-all border border-slate-100 dark:border-slate-800'>
        <div className='flex justify-center pt-3 pb-1 md:hidden'>
          <div className='w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full' />
        </div>

        <div className='flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800'>
          <h2 className='text-lg font-bold text-slate-800 dark:text-slate-100'>
            Statistik Bulan Ini
          </h2>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <X size={20} className='text-slate-600 dark:text-slate-400' />
          </button>
        </div>

        <div className='p-4 flex-1 overflow-y-auto'>
          <div className='grid grid-cols-10 gap-1 mb-2'>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <div
                  key={day}
                  className={`w-full aspect-square rounded-sm transition-colors ${
                    readDays.includes(day)
                      ? 'bg-green-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
