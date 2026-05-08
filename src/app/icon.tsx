import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, display: 'flex' }}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Green circle background */}
        <circle cx="16" cy="16" r="16" fill="#1DBF73" />
        {/* House-A mark: outer A shape with counter cut out using evenodd */}
        <path
          fillRule="evenodd"
          fill="white"
          d="M16 4 L28 27 L22 27 L22 18 L10 18 L10 27 L4 27 Z M16 8.5 L21.5 18 L10.5 18 Z"
        />
      </svg>
    </div>,
    { ...size }
  );
}
