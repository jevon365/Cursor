import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  confirmVariant,
  loading = false,
}) {
  // Hooks must be called before any early returns (Rules of Hooks)
  // Track when modal was opened to prevent immediate closing
  const [openedAt, setOpenedAt] = useState(null);
  const prevIsOpenRef = useRef(isOpen);
  
  useEffect(() => {
    // Only update openedAt when isOpen changes from false to true
    if (isOpen && !prevIsOpenRef.current) {
      setOpenedAt(Date.now());
    } else if (!isOpen) {
      setOpenedAt(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);
  
  const handleOverlayClick = (e) => {
    // Prevent closing if modal was just opened (within 300ms) to avoid click-through
    if (openedAt && Date.now() - openedAt < 300) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleOverlayClick} />

        <div 
          className="relative z-10 inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {variant === 'danger' ? (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant={confirmVariant || (variant === 'danger' ? 'danger' : 'primary')}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!loading && onConfirm) {
                  onConfirm();
                }
              }}
              disabled={loading}
              className="w-full sm:ml-3 sm:w-auto"
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              disabled={loading}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
