# PDF → JPG

报销医保时需要上传 JPG，但电子发票默认是 PDF。其他在线转换工具要把文件上传到服务器，存在隐私风险——尤其是医疗发票包含个人信息。

于是用 Vibe Coding 写了这个工具：**全程在浏览器本地运行，零上传，零服务器。**

🔗 **在线使用：[pdf2jpg.tairan.org](https://pdf2jpg.tairan.org)**

---

## 核心特点

- **隐私优先** — 文件只在你自己的浏览器里处理，不会离开你的设备
- **无需安装** — 打开网页即用，无 App、无插件
- **拼接模式** — 多页 PDF 可合并成一张长图，方便整单上传
- **调节间距** — 页与页之间的间距可自定义（0–200px）
- **批量下载** — 多页模式下打包成 ZIP 一键下载

## 技术栈

| 用途 | 库 |
|------|-----|
| PDF 渲染 | [PDF.js](https://mozilla.github.io/pdf.js/) |
| 前端构建 | [Vite](https://vitejs.dev/) |
| ZIP 打包 | [JSZip](https://stuk.github.io/jszip/) |
| 文件下载 | [FileSaver.js](https://github.com/eligrey/FileSaver.js) |

## 本地开发

```bash
npm install
npm run dev
```

## 构建部署

```bash
npm run build   # 输出到 dist/
```

部署到 Netlify：直接导入 GitHub 仓库，`netlify.toml` 已配置好构建命令。

---

> Vibe Coded with GitHub Copilot
