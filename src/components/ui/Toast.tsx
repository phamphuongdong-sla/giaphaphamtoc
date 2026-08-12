import { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast = ({ message, duration = 2000, onClose }: ToastProps) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(() => onClose?.(), 220);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${hide ? 'hide' : ''}`}>
      <Icon name="check-circle" size={15} />
      {message}
    </div>
  );
};