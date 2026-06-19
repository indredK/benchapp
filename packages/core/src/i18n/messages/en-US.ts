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

  // Organization
  'org.title': 'Organization',
  'org.searchPlaceholder': 'Search department or member',
  'org.searchBtn': 'Search',
  'org.department': 'Department',
  'org.member': 'Member',
  'org.addDepartment': 'Add Department',
  'org.addMember': 'Add Member',
  'org.departmentName': 'Department Name',
  'org.namePlaceholder': 'Enter name',
  'org.memberName': 'Member Name',
  'org.submit': 'Submit',

  // Form
  'form.title': 'Form',
  'form.name': 'Name',
  'form.namePlaceholder': 'Enter your name',
  'form.phone': 'Phone',
  'form.phonePlaceholder': 'Enter your phone',
  'form.email': 'Email',
  'form.emailPlaceholder': 'Enter your email',
  'form.remark': 'Remark',
  'form.remarkPlaceholder': 'Enter remarks',
  'form.submit': 'Submit',
  'form.submitSuccess': 'Submitted successfully',
  'form.reset': 'Reset',

  // Profile
  'profile.title': 'My',
  'profile.nickname': 'Nickname',
  'profile.nicknamePlaceholder': 'Enter nickname',
  'profile.phone': 'Phone',
  'profile.phonePlaceholder': 'Enter phone number',
  'profile.email': 'Email',
  'profile.emailPlaceholder': 'Enter email',
  'profile.save': 'Save',
  'profile.saveSuccess': 'Saved successfully',
  'profile.accountInfo': 'Account Info',
  'profile.settings': 'General Settings',
  'profile.about': 'About',
  'profile.aboutInfo': 'BenchApp v1.0.0',
  'profile.logoutConfirm': 'Confirm logout?',
  'profile.login': 'Login / Register',
} as const;

export default enUS;
export type EnUSMessages = typeof enUS;
