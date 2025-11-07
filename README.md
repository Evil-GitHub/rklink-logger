# RKLINK Logger

一个简单、轻量级的前端日志记录工具，支持日志分级、本地存储和导出功能。

---

## ✨ 功能特性

- **日志分级**: 支持 `debug`, `info`, `warn`, `error` 四个级别。
- **本地存储**: 所有日志自动保存到浏览器的 `LocalStorage` 中，方便追溯。
- **日志导出**: 可随时将日志下载为 JSON 文件，便于离线分析。
- **轻量无依赖**: 核心代码简洁，无任何外部依赖。
- **TypeScript 支持**: 提供完整的类型定义。

---

## 📦 安装

```bash
npm install @Evil-GitHub/rklink-logger
```

**注意**: 由于这是一个发布在 GitHub Packages 上的私有包，您需要在项目的根目录下创建一个 `.npmrc` 文件，并添加以下内容，以确保 NPM 能正确找到并下载它：

```
@Evil-GitHub:registry=https://npm.pkg.github.com/
```

---

## 🚀 快速使用

在您的代码中，直接导入 `logger` 实例即可使用。

```typescript
import { logger } from "@Evil-GitHub/rklink-logger";

// 记录不同级别的日志
logger.info("User logged in", { username: "test" });
logger.warn("API response is slow", { duration: 3000 });
logger.error("Failed to fetch data", { error: "Network Error" });

// 在需要时下载日志文件
function handleDownloadLogs() {
  logger.downloadLogs();
}
```

---

## 📖 API 参考

### `logger.debug(message, data?)`

记录一条 `DEBUG` 级别的日志。

### `logger.info(message, data?)`

记录一条 `INFO` 级别的日志。

### `logger.warn(message, data?)`

记录一条 `WARN` 级别的日志。

### `logger.error(message, data?)`

记录一条 `ERROR` 级别的日志。

### `logger.getLogs()`

获取存储在 `LocalStorage` 中的所有日志条目数组。

### `logger.clearLogs()`

清除 `LocalStorage` 中的所有日志。

### `logger.downloadLogs(filename?)`

触发浏览器下载，将所有日志保存为一个 JSON 文件。

### `logger.getLogsSummary()`

获取日志的统计信息，包括总数、错误数、警告数等。

---

## 📜 更新日志

### v1.0.0 (2025-11-07)

- 初始版本发布。
- 实现 `debug`, `info`, `warn`, `error` 日志记录。
- 支持将日志存储到 `LocalStorage`。
- 提供 `getLogs`, `clearLogs`, `downloadLogs` 和 `getLogsSummary` 等辅助功能。

---

## 💻 开发与发布

### 1. 开发

在本地修改代码后，您可以通过 `npm link` 将本地包链接到测试项目中，以实时查看修改效果。

### 2. 构建

在发布新版本之前，务必运行 `build` 命令来编译 TypeScript 代码。

```bash
npm run build
```

### 3. 更新版本

根据您的修改，更新 `package.json` 中的 `version` 字段。例如，从 `1.0.0` 更新到 `1.0.1`。

### 4. 登录

如果您是第一次发布，或登录已过期，需要先登录到 GitHub Packages。**密码**应为您在 GitHub 上生成的 **Personal Access Token (PAT)**。

```bash
npm login --scope=@Evil-GitHub --registry=https://npm.pkg.github.com
```

### 5. 发布

最后，运行 `npm publish` 将新版本发布到 GitHub Packages。

```bash
npm publish
```
