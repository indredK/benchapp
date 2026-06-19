export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/form/index',
    'pages/profile/index',
  ],
  darkmode: true,
  tabBar: {
    color: '#999999',
    selectedColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '组织架构',
        iconPath: 'assets/home.png',
        selectedIconPath: 'assets/home.png',
      },
      {
        pagePath: 'pages/form/index',
        text: '表单',
        iconPath: 'assets/form.png',
        selectedIconPath: 'assets/form.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/profile.png',
        selectedIconPath: 'assets/profile.png',
      },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'BenchApp',
    navigationBarTextStyle: 'black',
  },
  themeLocation: 'theme.json',
});
