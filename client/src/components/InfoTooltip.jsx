import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function InfoTooltip({ description, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event) {
      if (!buttonRef.current?.contains(event.target) && !tooltipRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current || !tooltipRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 12;
    let top = buttonRect.bottom + 10;
    let left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;

    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    if (left < padding) {
      left = padding;
    }

    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = buttonRect.top - tooltipRect.height - 10;
    }

    if (top < padding) {
      top = padding;
    }

    setPosition({ top, left });
  }, [isOpen]);

  return (
    <>
      <button
        aria-label={`${label}: ${description}`}
        className="floating-info-button"
        onBlur={() => setIsOpen(false)}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
        onFocus={() => setIsOpen(true)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        ref={buttonRef}
        type="button"
      >
        i
      </button>

      {isOpen
        ? createPortal(
            <div className="floating-tooltip" ref={tooltipRef} style={{ top: `${position.top}px`, left: `${position.left}px` }}>
              <strong>{label}</strong>
              <p>{description}</p>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
