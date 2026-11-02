import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF6EF',
          border: '1px solid #D1C6B4',
          color: '#262320',
          fontSize: '15px',
          fontWeight: 700,
          fontFamily: 'serif',
          letterSpacing: '-0.5px',
        }}
      >
        SAW
      </div>
    ),
    { ...size }
  );
}
