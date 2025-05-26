
import type { Config } from "tailwindcss";

const config = {
    content: [ // Ensure dark mode is not explicitly set if not needed, or set to "class" if you plan to toggle
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  	extend: {
  		colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          '1': 'hsl(var(--chart-1))', // Neon Blue
          '2': 'hsl(var(--chart-2))', // Neon Purple
          '3': 'hsl(var(--chart-3))', // Neon Pink
          '4': 'hsl(var(--chart-4))', // Neon Cyan
          '5': 'hsl(var(--chart-5))'  // Neon Green (complementary)
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          hover: 'hsl(var(--sidebar-hover-background))',
          'active-foreground': 'hsl(var(--sidebar-active-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
  		},
  		borderRadius: {
  			lg: "var(--radius)", // 8px
  			md: "calc(var(--radius) - 2px)", // 6px
  			sm: "calc(var(--radius) - 4px)", // 4px
  		},
  		keyframes: {
  			"accordion-down": {
  				from: { height: "0" },
  				to: { height: "var(--radix-accordion-content-height)" },
  			},
  			"accordion-up": {
  				from: { height: "var(--radix-accordion-content-height)" },
  				to: { height: "0" },
  			},
  		},
  		animation: {
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  		},
      fontFamily: {
        sans: ["var(--font-montserrat)"], // Changed from --font-inter
      },
  	},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
