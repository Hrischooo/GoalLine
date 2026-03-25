import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatTextValue } from '../utils/playerMetrics';
import { getLeagueName } from '../utils/dataset';
import { getDiscoveryPreviewMetrics } from '../utils/playerViews';

function isTouchLikeDevice() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(hover: none)').matches : false;
}

export default function PlayerHoverPreview({ children, metrics, player }) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const previewRef = useRef(null);
  const previewMetrics = useMemo(() => getDiscoveryPreviewMetrics(player, metrics).filter((metric) => metric.formattedValue && metric.formattedValue !== '-'), [metrics, player]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event) {
      if (!triggerRef.current?.contains(event.target) && !previewRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !previewRef.current) {
      return;
    }

    const rect = previewRef.current.getBoundingClientRect();
    const padding = 12;
    let top = anchorPoint.y + 16;
    let left = anchorPoint.x + 16;

    if (left + rect.width > window.innerWidth - padding) {
      left = anchorPoint.x - rect.width - 16;
    }

    if (top + rect.height > window.innerHeight - padding) {
      top = anchorPoint.y - rect.height - 16;
    }

    if (left < padding) {
      left = padding;
    }

    if (top < padding) {
      top = padding;
    }

    setPosition({ top, left });
  }, [anchorPoint, isOpen]);

  function openAtPoint(x, y) {
    setAnchorPoint({ x, y });
    setIsOpen(true);
  }

  function handleTouchPreview(event) {
    if (!isTouchLikeDevice()) {
      return;
    }

    if (!isOpen) {
      event.preventDefault();
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      openAtPoint(rect.left + rect.width / 2, rect.bottom);
    }
  }

  return (
    <>
      <span
        className="player-hover-preview-trigger"
        onClickCapture={handleTouchPreview}
        onMouseEnter={(event) => {
          if (!isTouchLikeDevice()) {
            openAtPoint(event.clientX, event.clientY);
          }
        }}
        onMouseLeave={() => {
          if (!isTouchLikeDevice()) {
            setIsOpen(false);
          }
        }}
        onMouseMove={(event) => {
          if (!isTouchLikeDevice() && isOpen) {
            setAnchorPoint({ x: event.clientX, y: event.clientY });
          }
        }}
        ref={triggerRef}
      >
        {children}
      </span>

      {isOpen
        ? createPortal(
            <div className="player-hover-card" ref={previewRef} style={{ top: `${position.top}px`, left: `${position.left}px` }}>
              <div className="player-hover-card__header">
                <strong>{formatTextValue(player?.player, 'Unknown Player')}</strong>
                {metrics?.exactPosition ? <span>{metrics.exactPosition}</span> : null}
              </div>
              <p className="player-hover-card__meta">
                {[formatTextValue(player?.squad, ''), formatTextValue(getLeagueName(player), ''), player?.age ? `Age ${player.age}` : ''].filter(Boolean).join(' \u2022 ')}
              </p>
              <div className="player-hover-card__stats">
                {previewMetrics.map((metric) => (
                  <div key={metric.key}>
                    <span>{metric.label}</span>
                    <strong>{metric.formattedValue}</strong>
                  </div>
                ))}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
