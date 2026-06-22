// Recharts needs literal color strings (SVG fill/stroke don't reliably resolve
// CSS custom properties across all chart elements), so these mirror the dark
// theme tokens in app/globals.css exactly. The product is dark-first by design
// (see ThemeProvider defaultTheme="dark"), so charts are tuned for that palette.

export const CHART_COLORS = {
  signal: "hsl(220 100% 65%)", // brand / informational
  critical: "hsl(355 100% 65%)", // severity 8-10, pending requests
  warning: "hsl(36 100% 62%)", // severity 5-7, in-progress
  success: "hsl(145 64% 51%)", // severity 1-4, resolved, available
  violet: "hsl(265 85% 70%)", // secondary categorical series
  grid: "hsl(222 20% 18%)", // matches --border
  axis: "hsl(220 14% 60%)", // matches --muted-foreground
  tooltipBg: "hsl(222 26% 9%)", // matches --card
  tooltipBorder: "hsl(222 20% 18%)",
} as const;

export const SEVERITY_TIER_COLOR = (severity: number): string => {
  if (severity >= 8) return CHART_COLORS.critical;
  if (severity >= 5) return CHART_COLORS.warning;
  return CHART_COLORS.signal;
};

export const SKILL_COLORS: Record<string, string> = {
  doctor: CHART_COLORS.critical,
  driver: CHART_COLORS.signal,
  engineer: CHART_COLORS.violet,
  rescue_worker: CHART_COLORS.warning,
};

export const RESOURCE_COLORS: Record<string, string> = {
  food: CHART_COLORS.warning,
  water: CHART_COLORS.signal,
  medicine: CHART_COLORS.critical,
  ambulance: CHART_COLORS.violet,
};

export const chartTooltipStyle = {
  backgroundColor: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 8,
  fontSize: 12,
  padding: "8px 12px",
};
