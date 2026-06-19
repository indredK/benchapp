// ============================================================
// i18n messages — en-US
// ============================================================

const enUS = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.back': 'Back',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.search': 'Search',
  'common.reset': 'Reset',
  'common.loading': 'Loading...',
  'common.noData': 'No data',
  'common.loadMore': 'Load more',
  'common.refresh': 'Refresh',
  'common.retry': 'Retry',
  'common.error': 'Something went wrong',
  'common.networkError': 'Network error, please try again',
  'common.operationSuccess': 'Success',
  'common.operationFailed': 'Failed',

  // Auth
  'auth.login': 'Login',
  'auth.logout': 'Logout',
  'auth.register': 'Register',
  'auth.phonePlaceholder': 'Enter phone number',
  'auth.codePlaceholder': 'Enter verification code',
  'auth.sendCode': 'Send code',
  'auth.codeSent': 'Code sent',
  'auth.loginSuccess': 'Login successful',

  // Theme
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  // Language
  'language.zhCN': '中文',
  'language.enUS': 'English',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.about': 'About',
  'settings.logout': 'Logout',

  // User
  'user.profile': 'Profile',
  'user.nickname': 'Nickname',
  'user.avatar': 'Avatar',
} as const;

export default enUS;
export type EnUSMessages = typeof enUS;
