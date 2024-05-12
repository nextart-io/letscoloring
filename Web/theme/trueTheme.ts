import {ThemeVars} from "@mysten/dapp-kit";

// Light theme copied from dapp-kit
export const trueTheme: ThemeVars = {
  blurs: {
    modalOverlay: "blur(0)",
  },
  backgroundColors: {
    primaryButton: "#fd5153",
    primaryButtonHover: "#ffd003",
    outlineButtonHover: "#F4F4F5",
    modalOverlay: "rgba(24 36 53 / 20%)",
    modalPrimary: "#fda2a2",
    modalSecondary: "#fd5153",
    iconButton: "transparent",
    iconButtonHover: "#F0F1F2",
    dropdownMenu: "#fd5153",
    dropdownMenuSeparator: "#F3F6F8",
    walletItemSelected: "white",
    walletItemHover: "#3C424226",
  },
  borderColors: {
    outlineButton: "#E4E4E7",
  },
  colors: {
    primaryButton: "#ffffff",
    outlineButton: "#373737",
    iconButton: "#000000",
    body: "#ffffff",
    bodyMuted: "#767A81",
    bodyDanger: "#FF794B",
  },
  radii: {
    small: "12px",
    medium: "16px",
    large: "24px",
    xlarge: "32px",
  },
  shadows: {
    primaryButton: "0px 4px 12px rgba(247,82,81,0.5)",
    walletItemSelected: "0px 2px 6px rgba(0, 0, 0, 0.05)",
  },
  fontWeights: {
    normal: "700",
    medium: "800",
    bold: "1000",
  },
  fontSizes: {
    small: "14px",
    medium: "16px",
    large: "18px",
    xlarge: "20px",
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontStyle: "normal",
    lineHeight: "1.3",
    letterSpacing: "1",
  },
};
