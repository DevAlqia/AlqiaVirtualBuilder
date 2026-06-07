/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        alqia: {
          blue: '#202D3D',
          orange: '#F98058',
        },
        bg: {
          dark:  '#18212D',
          ultra: '#111923',
        },
        content: {
          secondary: '#A7B3C2',
          muted:     '#718096',
        },
        status: {
          success: '#4ADE80',
          warning: '#FACC15',
          danger:  '#FB7185',
          info:    '#38BDF8',
        },
      },
      fontFamily: {
        questrial: ['Questrial', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
