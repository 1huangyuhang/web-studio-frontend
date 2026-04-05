import type { ThemeConfig } from 'antd/es/config-provider/context';
import { theme } from 'antd';
import type { ThemeMode } from '@/redux/slices/themeSlice';

const shared = {
  borderRadius: 11,
  borderRadiusLG: 18,
  borderRadiusSM: 8,
  fontFamily:
    "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  fontSize: 16,
  lineHeight: 1.72,
  controlHeight: 40,
};

const darkTokens: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...shared,
    colorPrimary: '#d4655c',
    colorSuccess: '#6bc98a',
    colorWarning: '#d4a574',
    colorError: '#ff6b6b',
    colorText: 'rgba(244, 244, 245, 0.96)',
    colorTextSecondary: 'rgba(161, 161, 170, 0.9)',
    colorTextTertiary: 'rgba(113, 113, 122, 0.62)',
    colorBorder: 'rgba(255, 255, 255, 0.1)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
    colorBgBase: '#09090b',
    colorBgContainer: '#18181b',
    colorBgLayout: '#09090b',
    colorBgElevated: '#27272a',
    colorFillAlter: 'rgba(255, 255, 255, 0.04)',
    colorLink: '#f0a8a0',
    colorLinkHover: '#fecaca',
    colorLinkActive: '#d4655c',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.45)',
    boxShadowSecondary: '0 8px 28px rgba(0,0,0,0.4)',
    controlOutline: 'rgba(212, 101, 92, 0.22)',
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'transparent',
      footerBg: 'transparent',
    },
    Card: {
      borderRadiusLG: 18,
      paddingLG: 24,
    },
    Button: {
      primaryShadow: '0 4px 20px rgba(212, 101, 92, 0.35)',
      dangerShadow: '0 2px 0 rgba(255, 107, 107, 0.12)',
    },
    Input: {
      activeBorderColor: '#d4655c',
      hoverBorderColor: '#e0786f',
    },
    Select: {
      optionSelectedBg: 'rgba(212, 101, 92, 0.15)',
    },
    Menu: {
      itemSelectedBg: 'rgba(212, 101, 92, 0.14)',
      itemHoverBg: 'rgba(255, 255, 255, 0.06)',
      horizontalItemSelectedColor: '#fecaca',
      itemColor: 'rgba(212, 212, 216, 0.88)',
    },
    Table: {
      headerBg: 'rgba(255, 255, 255, 0.04)',
      headerColor: 'rgba(250, 250, 250, 0.94)',
      rowHoverBg: 'rgba(255, 255, 255, 0.04)',
    },
    Pagination: {
      itemActiveBg: 'rgba(212, 101, 92, 0.12)',
    },
    Modal: {
      borderRadiusLG: 14,
      titleFontSize: 18,
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(22, 18, 32, 0.94)',
    },
    Popover: {
      colorBgElevated: 'rgba(32, 28, 42, 0.96)',
    },
    Divider: {
      colorSplit: 'rgba(255, 255, 255, 0.08)',
    },
  },
};

const lightTokens: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...shared,
    colorPrimary: '#b03d36',
    colorSuccess: '#3d9b5c',
    colorWarning: '#b8894a',
    colorError: '#d94a4a',
    colorText: 'rgba(15, 23, 42, 0.92)',
    colorTextSecondary: 'rgba(51, 65, 85, 0.82)',
    colorTextTertiary: 'rgba(100, 116, 139, 0.62)',
    colorBorder: 'rgba(15, 23, 42, 0.1)',
    colorBorderSecondary: 'rgba(15, 23, 42, 0.06)',
    colorBgBase: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgElevated: '#ffffff',
    colorFillAlter: 'rgba(15, 23, 42, 0.04)',
    colorLink: '#b03d36',
    colorLinkHover: '#d4655c',
    colorLinkActive: '#8a2e28',
    boxShadow:
      '0 0 0 1px rgba(15, 23, 42, 0.06), 0 12px 36px rgba(15, 23, 42, 0.08)',
    boxShadowSecondary: '0 8px 24px rgba(15, 23, 42, 0.06)',
    controlOutline: 'rgba(176, 61, 54, 0.2)',
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'transparent',
      footerBg: 'transparent',
    },
    Card: {
      borderRadiusLG: 18,
      paddingLG: 24,
    },
    Button: {
      primaryShadow: '0 4px 16px rgba(176, 61, 54, 0.28)',
      dangerShadow: '0 2px 0 rgba(217, 74, 74, 0.1)',
    },
    Input: {
      activeBorderColor: '#b03d36',
      hoverBorderColor: '#c94a42',
    },
    Select: {
      optionSelectedBg: 'rgba(176, 61, 54, 0.1)',
    },
    Menu: {
      itemSelectedBg: 'rgba(176, 61, 54, 0.1)',
      itemHoverBg: 'rgba(15, 23, 42, 0.04)',
      horizontalItemSelectedColor: '#b03d36',
      itemColor: 'rgba(51, 65, 85, 0.9)',
    },
    Table: {
      headerBg: 'rgba(15, 23, 42, 0.04)',
      headerColor: 'rgba(15, 23, 42, 0.88)',
      rowHoverBg: 'rgba(15, 23, 42, 0.03)',
    },
    Pagination: {
      itemActiveBg: 'rgba(176, 61, 54, 0.1)',
    },
    Modal: {
      borderRadiusLG: 14,
      titleFontSize: 18,
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(42, 36, 34, 0.92)',
    },
    Popover: {
      colorBgElevated: '#ffffff',
    },
    Divider: {
      colorSplit: 'rgba(60, 44, 38, 0.1)',
    },
  },
};

export function buildAntdAppTheme(mode: ThemeMode): ThemeConfig {
  return mode === 'light' ? lightTokens : darkTokens;
}

/** 默认夜间；管理端备用入口等仍可直接引用 */
export const antdAppTheme = buildAntdAppTheme('dark');
