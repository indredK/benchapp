import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import path from 'node:path';

import devConfig from './dev';
import prodConfig from './prod';

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge, { command, mode }) => {
  // 生产构建（build）把 @repo/api-mocks 指向空 stub，确保 mock 数据不进小程序包；
  // 开发构建（dev）指向真实源码。
  const isProd = command === 'build' && mode !== 'development';
  const apiMocksEntry = isProd
    ? path.resolve(__dirname, '..', '..', '..', 'packages', 'api-mocks', 'src', 'stub.ts')
    : path.resolve(__dirname, '..', '..', '..', 'packages', 'api-mocks', 'src');

  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'myApp',
    date: '2026-6-19',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
      '@repo/features': path.resolve(__dirname, '..', '..', '..', 'packages', 'features', 'src'),
      '@repo/api-mocks': apiMocksEntry,
    },
    plugins: ['@tarojs/plugin-generator'],
    defineConstants: {
      // 由 start.mjs 在启动时注入 TARO_APP_ENABLE_MOCK 环境变量
      __TARO_ENABLE_MOCK__: JSON.stringify(process.env.TARO_APP_ENABLE_MOCK === 'true'),
      __TARO_API_BASE_URL__: JSON.stringify(process.env.API_BASE_URL ?? ''),
    },
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: 'vite',
    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler',
            silenceDeprecations: ['legacy-js-api', 'import'],
          },
        },
      },
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  };

  // Taro dev 命令（taro build --type weapp --watch / taro dev）用开发配置
  // Taro build 命令用生产配置
  const isDev = command === 'dev' || mode === 'development';
  return merge({}, baseConfig, isDev ? devConfig : prodConfig);
});
