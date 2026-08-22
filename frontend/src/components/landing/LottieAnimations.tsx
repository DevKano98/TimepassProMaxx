import React from 'react';
import { Lottie } from 'lottie-react';

// Lightweight vectorized Lottie JSON for AI Scanner Pulse
const scannerAnimationData = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: 'Scanner Pulse',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Pulse Ring 1',
      sr: 1,
      ks: {
        o: {
          k: [
            { t: 0, s: [80] },
            { t: 90, s: [0] },
          ],
        },
        r: { k: 0 },
        p: { k: [100, 100, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { t: 0, s: [20, 20, 100] },
            { t: 90, s: [140, 140, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'el',
          d: 1,
          s: { k: [100, 100] },
          p: { k: [0, 0] },
          nm: 'Oval',
        },
        {
          ty: 'st',
          c: { k: [0, 0.32, 1, 1] }, // Coinbase Blue #0052ff
          o: { k: 100 },
          w: { k: 3 },
          nm: 'Stroke',
        },
      ],
      ao: 0,
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Pulse Ring 2',
      sr: 1,
      ks: {
        o: {
          k: [
            { t: 25, s: [80] },
            { t: 115, s: [0] },
          ],
        },
        r: { k: 0 },
        p: { k: [100, 100, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { t: 25, s: [20, 20, 100] },
            { t: 115, s: [140, 140, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'el',
          d: 1,
          s: { k: [100, 100] },
          p: { k: [0, 0] },
          nm: 'Oval',
        },
        {
          ty: 'st',
          c: { k: [0, 0.32, 1, 1] },
          o: { k: 100 },
          w: { k: 2 },
          nm: 'Stroke',
        },
      ],
      ao: 0,
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Center Dot',
      sr: 1,
      ks: {
        o: { k: 100 },
        r: { k: 0 },
        p: { k: [100, 100, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { t: 0, s: [80, 80, 100] },
            { t: 60, s: [110, 110, 100] },
            { t: 120, s: [80, 80, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'el',
          d: 1,
          s: { k: [24, 24] },
          p: { k: [0, 0] },
          nm: 'Oval',
        },
        {
          ty: 'fl',
          c: { k: [0, 0.32, 1, 1] },
          o: { k: 100 },
          nm: 'Fill',
        },
      ],
      ao: 0,
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
};

// Checkmark verified celebration animation
const verifiedAnimationData = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 80,
  w: 120,
  h: 120,
  nm: 'Verified Check',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle Ring',
      sr: 1,
      ks: {
        o: { k: 100 },
        r: { k: 0 },
        p: { k: [60, 60, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { t: 0, s: [0, 0, 100] },
            { t: 30, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'el',
          d: 1,
          s: { k: [90, 90] },
          p: { k: [0, 0] },
          nm: 'Oval',
        },
        {
          ty: 'st',
          c: { k: [0.02, 0.69, 0.41, 1] }, // semantic-up green #05b169
          o: { k: 100 },
          w: { k: 6 },
          nm: 'Stroke',
        },
      ],
      ao: 0,
      ip: 0,
      op: 80,
      st: 0,
      bm: 0,
    },
  ],
};

export const ScannerPulseLottie: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 120,
}) => {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={scannerAnimationData as any} loop={true} autoplay={true} className="w-full h-full" />
    </div>
  );
};

export const VerifiedCheckLottie: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 64,
}) => {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={verifiedAnimationData as any} loop={true} autoplay={true} className="w-full h-full" />
    </div>
  );
};
