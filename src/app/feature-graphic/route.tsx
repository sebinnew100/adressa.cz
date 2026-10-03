import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export async function GET() {
  const width = 1024;
  const height = 500;
  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1DBF73, #14883f)',
        }}
      >
        <svg width="140" height="140" viewBox="0 0 32 32" style={{ marginBottom: 24 }}>
          <circle cx="16" cy="16" r="16" fill="white" />
          <path
            fillRule="evenodd"
            fill="#1DBF73"
            d="M16 4 L28 27 L22 27 L22 18 L10 18 L10 27 L4 27 Z M16 8.5 L21.5 18 L10.5 18 Z"
          />
        </svg>
        <div style={{ color: 'white', fontSize: 64, fontWeight: 800, letterSpacing: -1 }}>
          adressa.cz
        </div>
        <div style={{ color: '#d7f9e6', fontSize: 28, marginTop: 8 }}>
          Místní poskytovatelé služeb
        </div>
      </div>
    ),
    { width, height }
  );
}
