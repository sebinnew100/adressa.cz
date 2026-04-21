import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1DBF73',
          hover: '#19a463',
          light: '#e9f9f0',
          dark: '#14883f',
        },
        ink: {
          DEFAULT: '#404145',
          light: '#62646a',
          lighter: '#95979d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.09)',
        'card-hover': '0 4px 20px 0 rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
