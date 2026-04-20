# Performance Optimization Report — 2026-04-20

**项目:** time-corner.com (React + Vite + MUI)  
**时间:** 2026-04-20 14:30~15:00 CST  
**基准分数:** Performance 54, Accessibility 87, Best Practices 100, SEO 92

---

## 变更总结

### 1. 移除 vendor-editor / vendor-highlight / vendor-chart 的初始预加载

**文件:** `vite.config.ts`  
**变更:** 添加 `modulePreload.resolveDependencies` 过滤器，阻止 `vendor-editor`（503KB）、`vendor-highlight`（168KB）、`vendor-chart`（569KB）出现在 HTML 的 `<link rel="modulepreload">` 中。

**原理:** Vite 默认会将动态 import 的传递依赖也加入 `modulepreload`，导致首页加载时浏览器会提前下载这 3 个大 chunk（共约 1.24MB 未压缩 JS），即使首页完全不需要它们。过滤后，这些 chunk 仅在实际需要时（如进入博客编辑页）才加载。

**预期效果:** 首页初始下载量减少 ~1.24MB 未压缩 / ~300KB+ gzip，显著降低 Speed Index 和 TBT。

---

### 2. 将 Editor/MarkdownEditor 从 HookForm Field 对象中移除

**文件:**  
- `src/components/HookForm/fields.tsx` — 移除 `Field.Editor` 和 `Field.MarkdownEditor`
- `src/pages/Admin/Blog/components/BlogCreateEditForm/index.tsx` — 直接 lazy import `RHFEditor` / `RHFMarkdownEditor`

**原理:** `fields.tsx` 通过 barrel export (`HookForm/index.ts`) 被全站引用。虽然其中的 `lazy()` 是动态导入，但 Rollup 仍然将 `vendor-editor` 和 `vendor-highlight` 标记为 entry chunk 的依赖，导致它们被 modulepreload。将这两个组件从 `Field` 对象中移除，在唯一使用点（Admin Blog 编辑页）直接 lazy import，彻底切断 entry → vendor-editor 的模块图链接。

**预期效果:** 配合变更 1，确保 editor 相关 chunk 完全按需加载。

---

### 3. HomeMinimal / HomeHugePackElements 改为 lazy 加载

**文件:** `src/pages/Home/components/HomeBelowTheFold/index.tsx`

**变更:** 将 `HomeMinimal` 和 `HomeHugePackElements` 从静态 import 改为 `lazy()` 动态导入，与其他 below-the-fold 组件统一放入 `<Suspense>` 中。

**原理:** 这两个组件位于首屏下方，不需要在首次渲染时同步加载。lazy 化后可减少初始 JS 解析量，降低 main-thread blocking time。

**预期效果:** 减少 TBT ~50-100ms，改善 Speed Index。

---

### 4. 替换 framer-motion backgroundPosition 动画为 CSS animation

**文件:** `src/pages/Home/components/HomeHero/index.tsx`

**变更:** 将 Hero 区域的文字渐变动画从 framer-motion `animate={{ backgroundPosition: '200% center' }}` 改为 CSS `@keyframes` + `animation` 属性。组件从 `m.span` 改为普通 `span`。

**原理:** `backgroundPosition` 动画是 non-composited animation（在主线程执行，触发每帧 repaint）。framer-motion 通过 JS 驱动此动画会进一步增加主线程工作。改用 CSS animation 后：
- 浏览器可自行优化动画调度
- 移除该处对 framer-motion 运行时的依赖
- 解决 Lighthouse "Avoid non-composited animations" 警告

**预期效果:** 减少 main-thread work，改善 TBT 和 CLS。

---

### 5. 添加资源预连接提示

**文件:** `index.html`

**变更:** 添加 `<link rel="preconnect">` 和 `<link rel="dns-prefetch">` 用于外部域名（fonts.googleapis.com, api.iconify.design）。

**原理:** 提前建立 TLS 连接，减少后续请求延迟。

---

### 6. Nginx brotli_static 配置提示

**文件:** `deploy/nginx.conf`

**变更:** 添加 `brotli_static on` 注释提示（需要 ngx_brotli 模块）。

**原理:** 项目已通过 `vite-plugin-compression2` 生成 `.br` 文件，但 nginx 未配置 `brotli_static`。Brotli 压缩率比 gzip 高 15-25%，启用后可进一步减少传输大小。

---

## 已存在的优化（未重复）

1. framer-motion `domMax` → `domAnimation`
2. HomeBelowTheFold 内 8 个组件已 lazy 加载
3. vite-plugin-compression2 生成 gzip + brotli 预压缩文件
4. Admin 路由整体 lazy 化
5. nginx.conf 已有 `gzip_static on`

---

## 量化影响估算

| 指标 | 优化前 | 预期优化后 | 来源 |
|------|--------|-----------|------|
| 首页初始 JS 预加载量 | ~2.5MB | ~1.26MB | 移除 3 个 vendor chunk 预加载 |
| TBT | 260ms | ~150-180ms | lazy 化 + CSS animation 替换 |
| Speed Index | 8.2s | ~5-6s | 减少首屏 JS 解析 |
| LCP | - | 改善 | 减少主线程竞争 |
| Performance 分数 | 54 | ~65-75 | 综合改善 |

---

## 后续建议（未实施）

1. **DataGrid 主题抽离**: `src/theme/core/components/mui-x-data-grid.tsx` 通过 theme 系统被全局引用，将 `@mui/x-data-grid` 的 35KB 拉入初始 bundle。可通过条件导入或拆分 theme 来解决。
2. **Iconify 内联图标精简**: entry chunk 内含大量内联 SVG icon 数据（约 50KB+），可考虑按需加载。
3. **字体子集化**: `@fontsource-variable/public-sans` 变体字体较大，如果只使用拉丁字符，可以只导入 latin subset。
4. **ApexCharts 按需加载**: vendor-chart 569KB，仅在 admin 页面使用，应确保不被首页路由引用。
