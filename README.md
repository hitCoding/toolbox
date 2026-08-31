# Toolbox

一个零依赖、可直接部署到 GitHub Pages 的个人工具导航工作台。

## 功能

- 搜索与分类筛选
- 收藏、最近访问和访问统计
- 网格 / 列表视图
- 添加自定义工具并保存在浏览器本地
- 导出个人配置
- 响应式移动端布局

## 本地运行

```bash
python3 -m http.server 4173
```

访问 <http://localhost:4173>。

## 发布

将仓库推送到 GitHub，在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。之后每次推送到 `main` 或 `master` 都会自动发布。
