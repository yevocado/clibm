/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#E8366F',
          dark:    '#C4234F',
          light:   '#F9839E',
          muted:   '#FFF0F4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted:   '#FFF0F4',
          border:  '#F0E0E5',
        },
        text: {
          primary:   '#1A1A1A',
          secondary: '#666666',
          disabled:  '#BBBBBB',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(232, 54, 111, 0.08)',
        'card-hover': '0 4px 20px rgba(232, 54, 111, 0.14)',
      },
      borderRadius: {
        card: '16px',
        btn:  '12px',
        input: '12px',
      },
    },
  },
  plugins: [],
}
