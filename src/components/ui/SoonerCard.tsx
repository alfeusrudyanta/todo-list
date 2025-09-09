import { X } from 'lucide-react';
import { toast } from 'sonner';

const SoonerCardSuccess = (message: string) => {
  toast.custom((id) => (
    <div className='bg-accent-green flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-[6px] text-white md:w-[300px]'>
      <span className='custom-text-sm-semibold'>{message}</span>
      <button
        onClick={() => toast.dismiss(id)}
        className='cursor-pointer transition hover:scale-105'
      >
        <X size={16} />
      </button>
    </div>
  ));
};

const SoonerCardError = (message: string) => {
  toast.custom((id) => (
    <div className='bg-accent-red flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-[6px] text-white md:w-[300px]'>
      <span className='custom-text-sm-semibold'>{message}</span>
      <button
        onClick={() => toast.dismiss(id)}
        className='cursor-pointer transition hover:scale-105'
      >
        <X size={16} />
      </button>
    </div>
  ));
};

export { SoonerCardSuccess, SoonerCardError };
