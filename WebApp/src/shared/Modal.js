import { useEffect } from 'react';
import { FaWindowClose } from 'react-icons/fa';

function Modal({ children, onClose }) {
  useEffect(() => {
    const closeModal = (e) => {
      if (e.target.id === 'modalBackdrop') {
        onClose();
      }
    };
    document.addEventListener('click', closeModal);
    return () => {
      document.removeEventListener('click', closeModal);
    };
  }, [onClose]);

  return (
    <div id="modalBackdrop" className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[1000]">
      <div className="bg-white p-6 max-h-[80dvh] overflow-y-auto shadow-lg max-w-2xl w-full">
        <div className="sticky float-right top-0">
            <button className="transition duration-300 text-green-500 hover:text-green-700 text-4xl" onClick={onClose}><FaWindowClose /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;