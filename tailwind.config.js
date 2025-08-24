import animate from 'tailwindcss-animate';
// Make sure the module name starts with '@'
import lineClamp from '@tailwindcss/line-clamp'; 
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			'custom-color': '#f0e1d2',
  			'custom-black': '#3e3a37',
		},
  		screens: {
  			mdl: '375px',
			sh: { 'raw': '(max-height: 700px)' },
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		fontFamily: {
        cinzel: ['Cinzel', 'serif'],
      },
  	}
  },
  plugins: [animate, lineClamp]
}

