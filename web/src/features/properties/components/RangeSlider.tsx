import { useCallback, useRef } from "react";

export function RangeSlider({
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChange,
  formatLabel = (v: number) => String(v),
}: {
  min: number;
  max: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  formatLabel?: (v: number) => string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = useCallback((v: number) => ((v - min) / (max - min)) * 100, [min, max]);

  const handleMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), valueMax - step);
    onChange(next, valueMax);
  };

  const handleMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), valueMin + step);
    onChange(valueMin, next);
  };

  return (
    <div>
      <div ref={trackRef} className="relative h-1 w-full rounded-full bg-[#E4E1D9]">
        <div
          className="absolute h-1 rounded-full bg-[#240270]"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={handleMin}
          className="range-thumb pointer-events-none absolute inset-0 h-1 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={handleMax}
          className="range-thumb pointer-events-none absolute inset-0 h-1 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[12px] text-[#3E3A31]">
        <span>{formatLabel(valueMin)}</span>
        <span>{formatLabel(valueMax)}</span>
      </div>

      <style>{`
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #240270;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          cursor: pointer;
          margin-top: -7.5px;
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid #240270;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .range-thumb::-webkit-slider-runnable-track { background: transparent; }
        .range-thumb::-moz-range-track { background: transparent; }
      `}</style>
    </div>
  );
}