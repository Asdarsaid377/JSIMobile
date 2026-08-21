/**
 * PLACEHOLDER tokens — seeded from the web app's src/css/tailwind.config.js
 * (/Users/asdarsaid/JSI/client) since no mobile design export exists yet.
 * Replace with real values once a design lands in context/designs/ and
 * context/ui-tokens.md is updated — see context/ui-tokens.md for the rule.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#ffffff",
        "surface-secondary": "#f1f5f9",
        border: "#cbd5e1",
        "text-primary": "#1e293b",
        "text-secondary": "#334155",
        "text-muted": "#64748b",
        primary: "#1e293b",
        accent: "#3b82f6",
        "accent-soft": "#dbeafe",
        "on-accent": "#ffffff",
        success: "#16a34a",
        "success-soft": "#dcfce7",
        warning: "#b45309",
        "warning-soft": "#fef3c7",
        danger: "#dc2626",
        "danger-soft": "#fee2e2",
      },
      spacing: {
        xs: "4px",
        sm: "12px",
        md: "24px",
        lg: "48px",
        xl: "80px",
        "margin-mobile": "16px",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
