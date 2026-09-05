/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        // Display: short bursts only — headlines, scores, HUD labels.
        // Terminal: the workhorse pixel face — nav, panels, longer labels.
        pixel: ["var(--font-pixel)", "monospace"],
        terminal: ["var(--font-terminal)", "var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // The command-center surface tones. Shared by the marketing shell
        // and the authenticated app — one dark HUD, not two themes.
        ink: {
          DEFAULT: "#0A0D11",
          surface: "#121821",
          line: "#2B3542",
        },
        paper: {
          dark: "#E7ECE8",
        },
        // Functional signal colors — never decorative. Green means a real
        // opportunity, amber means review it yourself, red means rejected.
        signal: {
          DEFAULT: "#3ADD82",
          soft: "#8FF0B8",
        },
        amber: {
          DEFAULT: "#FFC53D",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'float': '0 0 40px -10px rgba(0, 0, 0, 0.1), 0 0 20px -10px rgba(0, 0, 0, 0.05)',
        // Hard-edge "pressed button" shadow — no blur, pixel-offset only.
        // The "-lg" variants are the hover-lifted state; buttons grow their
        // shadow and pull away from it, then collapse to none on press.
        'pixel': '3px 3px 0 0 #2B3542',
        'pixel-sm': '2px 2px 0 0 #2B3542',
        'pixel-lg': '5px 5px 0 0 #2B3542',
        'pixel-signal': '3px 3px 0 0 #1F7A45',
        'pixel-signal-lg': '5px 5px 0 0 #1F7A45',
      },
    },
  },
  plugins: [],
}
