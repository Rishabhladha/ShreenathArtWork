import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF6EF',
          border: '4px solid #D1C6B4',
          color: '#262320',
        }}
      >
        <span
          style={{
            fontSize: '76px',
            fontWeight: 700,
            fontFamily: 'serif',
            letterSpacing: '2px',
          }}
        >
          SAW
        </span>
        <span
          style={{
            fontSize: '14px',
            fontFamily: 'sans-serif',
            color: '#7C7467',
            letterSpacing: '3px',
            marginTop: '4px',
          }}
        >
          NATHDWARA
        </span>
      </div>
    ),
    { ...size }
  );
}
