/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
      colors: {
        'cyber-blue': '#00ffff',
        'cyber-dark': '#0a0a0a',
      },
      fontFamily: {
        'mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 255, 0.5)',
        'glow-lg': '0 0 40px rgba(0, 255, 255, 0.3)',
      },
    },
  },
  plugins: [],
};