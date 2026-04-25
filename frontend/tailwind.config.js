/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        pink: {
          50:  '#FBF0F4',
          100: '#F4C0D1',
          150: '#EDD0DC',
          200: '#ED93B1',
          300: '#D88CA6',
          400: '#D4537E',
          500: '#B5607E',
          600: '#993556',
        },
        neutral: {
          50:  '#F5F3F0',
          100: '#D3D1C7',
          400: '#888780',
          800: '#444441',
        },
        primary: {
          DEFAULT: '#D88CA6',
          dark:    '#D4537E',
          light:   '#ED93B1',
          muted:   '#FBF0F4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#FBF0F4',
          border:  '#EDD0DC',
        },
        text: {
          primary:   '#444441',
          secondary: '#888780',
          disabled:  '#D3D1C7',
        },
      },
      borderRadius: {
        card:  '12px',
        btn:   '8px',
        input: '8px',
      },
      maxWidth: {
        content: '720px',
      },
    },
  },
  plugins: [],
}
