import { motion } from 'motion/react';

interface FortuneCylinderProps {
  isShaking: boolean;
  revealedStickId: number | null;
}

export function FortuneCylinder({ isShaking, revealedStickId }: FortuneCylinderProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-4 select-none" aria-hidden="true">
      <motion.div
        className="relative w-40 h-56 flex items-center justify-center"
        animate={
          isShaking
            ? {
                rotate: [0, -7, 8, -9, 7, -6, 5, -3, 0],
                y: [0, -6, 3, -8, 2, -6, 2, -2, 0],
              }
            : { rotate: 0, y: 0 }
        }
        transition={
          isShaking
            ? {
                duration: 1.35,
                ease: 'easeInOut',
                times: [0, 0.12, 0.25, 0.38, 0.52, 0.66, 0.78, 0.9, 1],
              }
            : { duration: 0.25 }
        }
      >
        <svg
          viewBox="0 0 180 240"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle floor shadow */}
          <ellipse cx="90" cy="222" rx="46" ry="7" fill="#1F2937" fillOpacity="0.08" />

          {/* Background bamboo sticks inside cylinder */}
          <g>
            <rect x="64" y="34" width="7" height="90" rx="2" transform="rotate(-11 64 34)" fill="#E7D8B9" stroke="#B48A4E" strokeWidth="1.2" />
            <rect x="75" y="26" width="7" height="95" rx="2" transform="rotate(-5 75 26)" fill="#EFE2C6" stroke="#B48A4E" strokeWidth="1.2" />
            <rect x="86" y="22" width="7" height="98" rx="2" fill="#E4D2AE" stroke="#B48A4E" strokeWidth="1.2" />
            <rect x="97" y="26" width="7" height="95" rx="2" transform="rotate(5 97 26)" fill="#F2E7CF" stroke="#B48A4E" strokeWidth="1.2" />
            <rect x="108" y="32" width="7" height="92" rx="2" transform="rotate(11 108 32)" fill="#E5D4B2" stroke="#B48A4E" strokeWidth="1.2" />
            {/* Crimson painted stick tips */}
            <rect x="64" y="34" width="7" height="12" rx="1.5" transform="rotate(-11 64 34)" fill="#991B1B" />
            <rect x="75" y="26" width="7" height="12" rx="1.5" transform="rotate(-5 75 26)" fill="#991B1B" />
            <rect x="86" y="22" width="7" height="12" rx="1.5" fill="#991B1B" />
            <rect x="97" y="26" width="7" height="12" rx="1.5" transform="rotate(5 97 26)" fill="#991B1B" />
            <rect x="108" y="32" width="7" height="12" rx="1.5" transform="rotate(11 108 32)" fill="#991B1B" />
          </g>

          {/* Emerging winning stick during final moment or reveal */}
          <motion.g
            initial={{ y: 0, opacity: 0.9 }}
            animate={
              revealedStickId !== null
                ? { y: -26, opacity: 1 }
                : isShaking
                  ? { y: [0, -14, -4, -22], opacity: 1 }
                  : { y: 0, opacity: 0.9 }
            }
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <rect x="86" y="14" width="9" height="96" rx="2" fill="#FAF0DA" stroke="#991B1B" strokeWidth="1.5" />
            <rect x="86" y="14" width="9" height="14" rx="1.5" fill="#991B1B" />
          </motion.g>

          {/* Bamboo cylinder body */}
          <path
            d="M52 88 C52 82, 128 82, 128 88 L124 210 C124 218, 56 218, 56 210 Z"
            fill="#F3E9D7"
            stroke="#8B683B"
            strokeWidth="1.8"
          />
          {/* Cylinder rim opening */}
          <ellipse cx="90" cy="88" rx="38" ry="8" fill="#DFC9A4" stroke="#8B683B" strokeWidth="1.8" />
          <ellipse cx="90" cy="88" rx="32" ry="5.5" fill="#6E502B" fillOpacity="0.25" />

          {/* Bamboo node rings */}
          <path d="M53.5 130 Q90 137 126.5 130" stroke="#A6804D" strokeWidth="1.4" />
          <path d="M55 174 Q90 181 125 174" stroke="#A6804D" strokeWidth="1.4" />

          {/* Minimal temple seal plaque on cylinder */}
          <rect
            x="76"
            y="138"
            width="28"
            height="32"
            rx="2"
            fill="#FAF8F5"
            stroke="#991B1B"
            strokeWidth="1.3"
          />
          <text
            x="90"
            y="152"
            textAnchor="middle"
            fill="#991B1B"
            fontSize="11"
            fontWeight="600"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            車
          </text>
          <text
            x="90"
            y="165"
            textAnchor="middle"
            fill="#991B1B"
            fontSize="11"
            fontWeight="600"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            公
          </text>
        </svg>
      </motion.div>

      {/* Revealed stick number announcement */}
      <div className="h-7 flex items-center justify-center">
        {isShaking && (
          <p className="text-sm font-serif text-[#991B1B] tracking-widest">
            誠心搖簽中，請靜候靈簽⋯
          </p>
        )}
        {!isShaking && revealedStickId !== null && (
          <p className="text-sm font-serif font-semibold text-[#991B1B] tracking-wider tabular-nums">
            得第 {revealedStickId} 簽
          </p>
        )}
      </div>
    </div>
  );
}
