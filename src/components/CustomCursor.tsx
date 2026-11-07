import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer');
        setIsPointer(Boolean(isClickable));
      }
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let frameId: number;
    const lerpTrail = () => {
      setTrail((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.22,
        y: prev.y + (pos.y - prev.y) * 0.22,
      }));
      frameId = requestAnimationFrame(lerpTrail);
    };
    frameId = requestAnimationFrame(lerpTrail);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(frameId);
    };
  }, [pos.x, pos.y]);

  if (isTouchDevice || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer aura glow */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-100 ease-out pointer-events-none"
        style={{
          left: `${trail.x}px`,
          top: `${trail.y}px`,
          width: isPointer ? '48px' : '32px',
          height: isPointer ? '48px' : '32px',
          border: isPointer ? '1.5px solid rgba(251, 191, 36, 0.7)' : '1.5px solid rgba(34, 211, 238, 0.6)',
          backgroundColor: isPointer ? 'rgba(251, 191, 36, 0.12)' : 'rgba(34, 211, 238, 0.08)',
          boxShadow: isPointer ? '0 0 16px rgba(251, 191, 36, 0.5)' : '0 0 14px rgba(34, 211, 238, 0.4)',
        }}
      />
      {/* Center point */}
      <div
        className="fixed -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-75"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: isPointer ? '8px' : '5px',
          height: isPointer ? '8px' : '5px',
          backgroundColor: isPointer ? '#fbbf24' : '#ffffff',
          boxShadow: isPointer ? '0 0 8px #fbbf24' : '0 0 6px #22d3ee',
        }}
      />
    </div>
  );
}
