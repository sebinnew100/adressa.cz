import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: 180, height: 180, display: 'flex' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Rounded square background */}
        <rect width="180" height="180" rx="40" fill="#1DBF73" />
        {/* House-A mark, scaled up and centered */}
        <path
          fillRule="evenodd"
          fill="white"
          d="M90 22 L158 152 L124 152 L124 102 L56 102 L56 152 L22 152 Z M90 48 L122 102 L58 102 Z"
        />
      </svg>
    </div>,
    { ...size }
  );
}
