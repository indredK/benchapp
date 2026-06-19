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

  // Organization
  'org.title': '组织架构',
  'org.searchPlaceholder': '搜索部门或成员',
  'org.searchBtn': '搜索',
  'org.department': '部门',
  'org.member': '成员',
  'org.addDepartment': '新增部门',
  'org.addMember': '新增成员',
  'org.departmentName': '部门名称',
  'org.namePlaceholder': '请输入名称',
  'org.memberName': '成员姓名',
  'org.submit': '提交',

  // Form
  'form.title': '表单',
  'form.name': '姓名',
  'form.namePlaceholder': '请输入姓名',
  'form.phone': '手机号',
  'form.phonePlaceholder': '请输入手机号',
  'form.email': '邮箱',
  'form.emailPlaceholder': '请输入邮箱',
  'form.remark': '备注',
  'form.remarkPlaceholder': '请输入备注信息',
  'form.submit': '提交',
  'form.submitSuccess': '提交成功',
  'form.reset': '重置',

  // Profile
  'profile.title': '我的',
  'profile.nickname': '昵称',
  'profile.nicknamePlaceholder': '请输入昵称',
  'profile.phone': '手机号',
  'profile.phonePlaceholder': '请输入手机号',
  'profile.email': '邮箱',
  'profile.emailPlaceholder': '请输入邮箱',
  'profile.save': '保存',
  'profile.saveSuccess': '保存成功',
  'profile.accountInfo': '账户信息',
  'profile.settings': '通用设置',
  'profile.about': '关于',
  'profile.aboutInfo': 'BenchApp v1.0.0',
  'profile.logoutConfirm': '确认退出登录？',
  'profile.login': '登录 / 注册',
} as const;

export default zhCN;
export type ZhCNMessages = typeof zhCN;
