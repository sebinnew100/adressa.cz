import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        backgroundColor: '#0a1f13',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Decorative background circles */}
      <div style={{
        position: 'absolute', top: -120, right: -80,
        width: 400, height: 400,
        borderRadius: '50%',
        backgroundColor: '#1DBF73',
        opacity: 0.08,
        display: 'flex',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -60,
        width: 300, height: 300,
        borderRadius: '50%',
        backgroundColor: '#1DBF73',
        opacity: 0.06,
        display: 'flex',
      }} />

      {/* Logo mark */}
      <div style={{ display: 'flex', marginBottom: 36 }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r="55" fill="#1DBF73" />
          <path
            fillRule="evenodd"
            fill="white"
            d="M55 14 L96 93 L76 93 L76 62 L34 62 L34 93 L14 93 Z M55 30 L74 62 L36 62 Z"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{
          fontSize: 80,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-3px',
        }}>adressa</span>
        <span style={{
          fontSize: 80,
          fontWeight: 800,
          color: '#1DBF73',
          letterSpacing: '-3px',
        }}>.cz</span>
      </div>

      {/* Tagline */}
      <div style={{
        display: 'flex',
        marginTop: 16,
        fontSize: 26,
        color: '#6ee7a8',
        fontWeight: 400,
        letterSpacing: 1,
      }}>
        Najděte ověřené profesionály ve vašem okolí
      </div>
    </div>,
    { ...size }
  );
}
