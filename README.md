# EN Reciter

一个支持网页端与安卓端（Capacitor 打包）的单词背诵 App MVP，包含用户注册登录、单词书、生词本、每日任务和单词卡片复习流程。

## 功能

- 用户注册 / 登录：当前版本使用浏览器 localStorage 做本地演示存储。
- 单词书：内置四级、六级、雅思、托福、考研 5 类独立示例单词书，可扩展到数千词。
- 选择单词书页面：单词书选择与背诵首页分离，支持添加和移除词库。
- 每日任务：可设置每天新词数量和复习数量。
- 主页面：集中展示今日待学、词书、生词本和任务概览。
- 每日任务页：独立设置新词 30–300、复习词 30–600 的常见档位。
- 单词卡片：默认隐藏完整汉译和例句，点击“显示汉译”后同时展示多词性释义、例句和例句汉译，也可单独显示例句。
- 记忆反馈：支持“不需要再看了 / 一般 / 不认识”，其中“不认识”会加入生词本。
- 跨端运行：同一套 React 代码可在网页运行，也可通过 Capacitor 生成安卓工程。

## 本地运行

```bash
npm install
npm run dev
```

## 构建网页版本

```bash
npm run build
npm run preview
```

## 生成安卓版本

首次生成安卓工程：

```bash
npm install
npm run build
npx cap add android
```

后续同步网页构建到安卓工程：

```bash
npm run android:sync
npm run android:open
```

打开 Android Studio 后即可运行到模拟器或真机。
