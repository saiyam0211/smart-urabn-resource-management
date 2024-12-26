import toast, { Toaster } from 'react-hot-toast';

export const showToast = (message, type = 'success') => {
  const options = {
    duration: 4000,
    position: 'top-right',
    style: {
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: 'white',
      padding: '16px',
      borderRadius: '10px',
    },
  };
  
  toast(message, options);
};

export const ToastContainer = () => (
  <Toaster />
);