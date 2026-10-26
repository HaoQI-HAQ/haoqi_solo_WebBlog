import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './modal-dialog.css';

/** Native modal isolation keeps keyboard focus and assistive navigation inside
 * the top layer, including while an authored closing animation is playing. */
export default function ModalDialog({ children, className = '', label, onRequestClose, returnFocus, onKeyDown }) {
  const dialog = useRef(null), close = useRef(onRequestClose);
  close.current = onRequestClose;
  useLayoutEffect(() => {
    const node = dialog.current, opener = returnFocus || document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    node.querySelector('[data-modal-close],button')?.focus({ preventScroll: true });
    return () => {
      if (node.open) node.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(<dialog ref={dialog} className={`site-modal ${className}`} aria-label={label}
    onCancel={event => { event.preventDefault(); event.stopPropagation(); close.current?.(); }}
    onClick={event => { if (event.target === event.currentTarget) close.current?.(); }}
    onKeyDown={event => { event.stopPropagation(); onKeyDown?.(event); }}>
    {children}
  </dialog>, document.body);
}
