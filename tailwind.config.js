/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html', './src/**/*.js'],
  safelist: ['bg-pink-50'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#ff7f65',
          400: '#ff9a7a',
          300: '#ffb89f',
          100: '#ffe3dc',
          50:  '#fff4f1',
        },
        neutral: {
          900: '#1a1a1a',
          800: '#333333',
          600: '#666666',
          400: '#999999',
          200: '#e5e5e5',
          100: '#f0f0f0',
          50:  '#f5f5f5',
          0:   '#ffffff',
        },
        'warm-grey': {
          300: '#e5d1c9',
          200: '#ecded9',
          100: '#f5edeb',
          50:  '#f8f4f3',
          25:  '#fbf9f9',
        },
        success: { 500: '#4caf50', 100: '#e8f5e9' },
        warning: { 500: '#ff9800', 100: '#fff3e0' },
        error:   { 500: '#f44336', 100: '#ffebee' },
        info:    { 500: '#2196f3', 100: '#e3f2fd' },
      },
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        8:  '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        button: '8px',
        card:   '8px',
        search: '24px',
        badge:  '4px',
        pill:   '999px',
      },
      width: {
        'icon-sm': '24px',
        'icon-md': '32px',
        'icon-lg': '36px',
      },
      height: {
        'icon-sm': '24px',
        'icon-md': '32px',
        'icon-lg': '36px',
      },
      fontFamily: {
        base: [
          'Pretendard Variable', 'Pretendard',
          '-apple-system', 'BlinkMacSystemFont',
          'Apple SD Gothic Neo', 'sans-serif',
        ],
      },
      maxWidth: {
        content: '1212px',
      },
      backgroundImage: {
        'gradient-fluid':
          'linear-gradient(135deg, #FFAA00 0%, #FF2D9E 33%, #80BFFF 66%, #67E8D8 100%)',
      },
    },
  },
  plugins: [],
}
