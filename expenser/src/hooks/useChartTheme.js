import { useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';

/** Recharts styling derived from the active theme (follows light/dark + custom colour). */
export function useChartTheme() {
  const { colors, isDark } = useSettings();
  return useMemo(
    () => ({
      // Chart colours are deliberately stronger than the UI roles (which turn pastel in dark mode).
      income: isDark ? '#22C55E' : '#15803D',
      expense: isDark ? '#EF4444' : '#DC2626',
      primary: colors.primary,
      grid: colors.outlineVariant,
      tick: { fontSize: 11, fill: colors.onSurfaceVariant },
      tooltip: {
        contentStyle: {
          borderRadius: 16,
          border: 'none',
          fontSize: 12,
          background: colors.surfaceContainer,
          color: colors.onSurface,
          boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.25)',
        },
        itemStyle: { color: colors.onSurface },
        labelStyle: { color: colors.onSurface, fontWeight: 600 },
      },
      cursor: { fill: colors.onSurface, fillOpacity: 0.06 },
    }),
    [colors, isDark],
  );
}
