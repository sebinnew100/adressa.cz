import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export async function GET() {
  const size = 192;
  return new ImageResponse(
    (
      <div style={{ width: size, height: size, display: 'flex' }}>
        <svg width={size} height={size} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#1DBF73" />
          <path
            fillRule="evenodd"
            fill="white"
            d="M16 4 L28 27 L22 27 L22 18 L10 18 L10 27 L4 27 Z M16 8.5 L21.5 18 L10.5 18 Z"
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
