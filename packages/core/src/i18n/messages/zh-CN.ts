// ============================================================
// i18n messages — zh-CN
// ============================================================
// Key naming: module.action (e.g. "login.title")

const zhCN = {
  // Common
  'common.ok': '确定',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.back': '返回',
  'common.save': '保存',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.search': '搜索',
  'common.reset': '重置',
  'common.loading': '加载中...',
  'common.noData': '暂无数据',
  'common.loadMore': '加载更多',
  'common.refresh': '刷新',
  'common.retry': '重试',
  'common.error': '出错了',
  'common.networkError': '网络异常，请稍后重试',
  'common.operationSuccess': '操作成功',
  'common.operationFailed': '操作失败',

  // Auth
  'auth.login': '登录',
  'auth.logout': '退出登录',
  'auth.register': '注册',
  'auth.phonePlaceholder': '请输入手机号',
  'auth.codePlaceholder': '请输入验证码',
  'auth.sendCode': '发送验证码',
  'auth.codeSent': '验证码已发送',
  'auth.loginSuccess': '登录成功',

  // Theme
  'theme.light': '浅色',
  'theme.dark': '深色',
  'theme.system': '跟随系统',

  // Language
  'language.zhCN': '中文',
  'language.enUS': 'English',

  // Settings
  'settings.title': '设置',
  'settings.language': '语言',
  'settings.theme': '主题',
  'settings.about': '关于',
  'settings.logout': '退出登录',

  // User
  'user.profile': '个人中心',
  'user.nickname': '昵称',
  'user.avatar': '头像',
} as const;

export default zhCN;
export type ZhCNMessages = typeof zhCN;
