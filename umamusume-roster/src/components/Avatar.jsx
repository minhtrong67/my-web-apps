import { useEffect, useRef, useState } from 'react';
import { iconUrl } from '../data/characters';

export default function Avatar({ c, size = 240, className = '', textClass = 'text-2xl' }) {
  const [state, setState] = useState('loading');
  const img = useRef(null);
  const src = iconUrl(c, size);
  const initials = c.name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  useEffect(() => {
    setState('loading');
    if (img.current?.complete && img.current.naturalWidth) setState('loaded');
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-0 grid place-items-center font-black italic text-accent ${textClass} ${state === 'loading' ? 'shimmer' : 'bg-pc'}`}>
        {state === 'error' && initials}
      </div>
      {state !== 'error' && (
        <img
          ref={img}
          src={src}
          alt={c.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`avatar-zoom absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
