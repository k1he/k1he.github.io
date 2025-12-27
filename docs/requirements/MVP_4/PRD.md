# MVP_4 产品需求文档 (PRD)

## 文档版本
- **版本**: 1.0
- **创建日期**: 2025-12-27
- **负责人**: Product Team
- **状态**: Draft

## 1. 产品概述

### 1.1 背景
在 MVP_1 至 MVP_3 的基础上，博客系统已实现核心功能、内容渲染增强和视觉体验优化。MVP_4 阶段聚焦于完善博客的基础页面和提升内容发现效率，通过实现 About 页面和搜索功能，让博客更加完整和易用。

### 1.2 目标
- 实现 About（关于）页面，展示博主个人信息和博客介绍
- 在首页添加搜索功能，支持按标签和文章标题进行快速检索
- 提升用户发现和定位内容的效率

### 1.3 范围
本次迭代包括：
- About 页面的设计与实现
- 首页搜索栏的设计与实现
- 搜索逻辑（标签匹配、标题匹配）

## 2. 需求详情

### 2.1 需求一：About 页面实现

#### 2.1.1 需求描述
实现一个独立的 About（关于）页面，用于展示博主的个人介绍、技术栈、联系方式等信息，让访客更好地了解博主背景。

#### 2.1.2 当前状态
- 侧边栏导航中已有"About"菜单项
- 点击后无对应页面（或跳转到空白/404）
- 个人信息仅在侧边栏简要展示

#### 2.1.3 期望效果
- 点击侧边栏"About"菜单项，跳转至 About 页面
- 页面内容包括：
  - **个人介绍**：详细的自我介绍（支持 Markdown 渲染）
  - **技术栈**：擅长的技术/工具（可用图标或标签展示）
  - **工作经历**：时间线形式展示职业经历
  - **联系方式**：GitHub、Email、社交媒体链接等
  - **博客介绍**：博客的定位和内容方向
- 页面风格与整体博客保持一致（深色科技风）
- 支持响应式布局

#### 2.1.4 页面结构建议

```
About 页面布局
├── 页面标题（About / 关于我）
├── 个人介绍区
│   ├── 大头像
│   ├── 姓名/昵称
│   └── 详细自我介绍（Markdown）
├── 技术栈区
│   └── 技术图标/标签列表
├── 工作经历区（时间线）
│   ├── 公司 A（时间、职位、简述）
│   ├── 公司 B
│   └── ...
├── 联系方式区
│   ├── GitHub 链接
│   ├── Email
│   └── 其他社交链接
└── 博客介绍区（可选）
```

#### 2.1.5 技术实现要点
- 创建 `about.html` 页面，复用现有的侧边栏和整体布局
- About 内容可存储在：
  - **方案 A**：独立的 `about.md` 文件，客户端渲染
  - **方案 B**：直接在 HTML 中硬编码
  - **方案 C**：JSON 配置文件 + 模板渲染
- 技术栈图标可使用 [Simple Icons](https://simpleicons.org/) 或 [Devicon](https://devicon.dev/)
- 工作经历时间线使用 CSS 实现，无需额外库

#### 2.1.6 验收标准
- [ ] 点击侧边栏"About"可正常跳转至 About 页面
- [ ] 页面包含个人介绍、技术栈、工作经历、联系方式
- [ ] 页面风格与博客整体一致
- [ ] 响应式布局在移动端正常显示
- [ ] 联系方式链接可正常点击跳转
- [ ] 页面加载性能良好

---

### 2.2 需求二：首页搜索功能

#### 2.2.1 需求描述
在首页（Home）添加搜索栏，支持用户按文章标题和标签进行快速搜索，实时过滤文章列表。

#### 2.2.2 当前状态
- 首页展示所有文章列表
- 无搜索/筛选功能
- 用户只能通过滚动浏览或点击标签筛选

#### 2.2.3 期望效果
- 在首页文章列表上方显示搜索栏
- 搜索支持：
  - **标题匹配**：输入关键词匹配文章标题
  - **标签匹配**：输入标签名匹配文章标签
  - **混合搜索**：同时匹配标题和标签
- 搜索为实时过滤（输入即搜索），无需点击搜索按钮
- 搜索结果高亮匹配的关键词
- 无匹配结果时显示友好提示
- 支持清空搜索恢复完整列表

#### 2.2.4 搜索栏设计

```
搜索栏布局
┌─────────────────────────────────────────────┐
│ 🔍  搜索文章标题或标签...            [×]    │
└─────────────────────────────────────────────┘
```

- **位置**：文章列表上方，侧边栏右侧的主内容区顶部
- **样式**：
  - 背景色：`#161b22`（与代码块背景一致）
  - 边框：`#30363d`
  - 文字色：`#c9d1d9`
  - 图标色：`#8b949e`
  - 聚焦时边框色：`#58a6ff`
- **交互**：
  - 输入框聚焦时有边框高亮
  - 右侧清空按钮（有内容时显示）
  - 支持键盘快捷键（如 `/` 聚焦搜索框，`Esc` 清空）

#### 2.2.5 搜索逻辑

```javascript
// 搜索匹配规则
function matchArticle(article, query) {
  const normalizedQuery = query.toLowerCase().trim();
  
  // 标题匹配（模糊匹配）
  const titleMatch = article.title.toLowerCase().includes(normalizedQuery);
  
  // 标签匹配（精确或模糊匹配）
  const tagMatch = article.tags.some(tag => 
    tag.toLowerCase().includes(normalizedQuery)
  );
  
  return titleMatch || tagMatch;
}
```

- **匹配规则**：
  - 不区分大小写
  - 支持部分匹配（如输入 "java" 可匹配 "JavaScript"）
  - 标题和标签任一匹配即显示
- **性能优化**：
  - 使用防抖（debounce）避免频繁过滤，建议 200-300ms
  - 文章数据已在内存中，无需网络请求

#### 2.2.6 搜索结果展示

- **有结果**：
  - 实时过滤文章列表，仅显示匹配的文章
  - 匹配关键词高亮显示（可选）
  - 显示搜索结果数量（如 "找到 3 篇相关文章"）
- **无结果**：
  - 显示友好提示（如 "未找到匹配的文章"）
  - 提供清空搜索的快捷方式
- **空搜索**：
  - 搜索框为空时显示所有文章

#### 2.2.7 技术实现要点
- 在 `index.html` 中添加搜索栏 HTML 结构
- 在 `js/app.js` 或新建 `js/search.js` 中实现搜索逻辑
- 使用事件监听器监听 `input` 事件
- 实现防抖函数优化性能
- 更新文章列表渲染逻辑，支持过滤显示

#### 2.2.8 验收标准
- [ ] 搜索栏在首页正确显示
- [ ] 输入关键词可实时过滤文章列表
- [ ] 支持按标题搜索
- [ ] 支持按标签搜索
- [ ] 搜索不区分大小写
- [ ] 无结果时显示友好提示
- [ ] 清空按钮可正常使用
- [ ] 搜索性能良好（无明显卡顿）
- [ ] 移动端搜索栏正常显示和使用
- [ ] 支持键盘快捷键（可选）

---

## 3. 设计规范

### 3.1 颜色规范（保持一致）
- **Background**: `#0d1117` (GitHub Dark)
- **Secondary Background**: `#161b22`
- **Text**: `#c9d1d9`
- **Secondary Text**: `#8b949e`
- **Accent**: `#58a6ff`
- **Border**: `#30363d`
- **Success**: `#3fb950`

### 3.2 搜索栏样式规范
```css
.search-bar {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  color: #c9d1d9;
  font-size: 14px;
}

.search-bar:focus {
  border-color: #58a6ff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
}

.search-bar::placeholder {
  color: #8b949e;
}
```

### 3.3 About 页面样式规范
- **标题**：使用 `h1`，字体大小 2rem，颜色 `#c9d1d9`
- **段落**：行高 1.6，段落间距 1.5em
- **技术标签**：
  - 背景：`#21262d`
  - 边框：`#30363d`
  - 圆角：4px
  - 内边距：4px 8px
- **时间线**：
  - 线条颜色：`#30363d`
  - 节点颜色：`#58a6ff`
  - 节点大小：12px

### 3.4 交互规范
- **搜索框聚焦**：边框变为 `#58a6ff`，添加外发光
- **清空按钮**：hover 时颜色变为 `#c9d1d9`
- **搜索结果过渡**：使用 `opacity` 和 `transform` 实现平滑过渡

---

## 4. 技术栈

### 4.1 新增/增强
- **搜索功能**：纯 JavaScript 实现，无需额外库
- **防抖函数**：自定义实现或使用 lodash.debounce（可选）
- **About 页面**：复用现有 Markdown 渲染逻辑

### 4.2 现有技术（保持）
- Vanilla JavaScript
- CSS Grid / Flexbox
- marked.js（Markdown 渲染）
- Prism.js（代码高亮）

---

## 5. 实施计划

### 5.1 开发阶段划分

#### Phase 1: About 页面实现（2-3 天）
- [ ] 创建 `about.html` 页面结构
- [ ] 设计 About 页面 CSS 样式
- [ ] 实现个人介绍区域
- [ ] 实现技术栈展示区域
- [ ] 实现工作经历时间线
- [ ] 实现联系方式区域
- [ ] 响应式适配

#### Phase 2: 搜索功能实现（2-3 天）
- [ ] 添加搜索栏 HTML 结构
- [ ] 实现搜索栏 CSS 样式
- [ ] 实现搜索逻辑（标题匹配）
- [ ] 实现搜索逻辑（标签匹配）
- [ ] 实现防抖优化
- [ ] 实现搜索结果展示
- [ ] 实现无结果提示
- [ ] 实现清空功能

#### Phase 3: 测试与优化（1-2 天）
- [ ] 跨浏览器测试
- [ ] 移动端测试
- [ ] 性能测试
- [ ] Bug 修复
- [ ] 代码优化

### 5.2 总工期
预计 **5-8 个工作日**

---

## 6. 验收标准

### 6.1 功能完整性
- [ ] About 页面完整实现
- [ ] 搜索功能完整实现
- [ ] 无功能回归问题

### 6.2 视觉效果
- [ ] About 页面风格与博客一致
- [ ] 搜索栏设计符合整体风格
- [ ] 响应式布局正常

### 6.3 性能指标
- [ ] 搜索响应时间 < 100ms
- [ ] 页面加载时间无明显增加
- [ ] Lighthouse Performance Score ≥ 90

### 6.4 兼容性
- [ ] 支持主流浏览器（Chrome, Firefox, Safari, Edge）
- [ ] 移动端体验良好
- [ ] 响应式布局正常（320px - 1920px）

### 6.5 可访问性
- [ ] 搜索框支持键盘操作
- [ ] 适当的 ARIA 标签
- [ ] 颜色对比度符合 WCAG 2.1 AA 标准

---

## 7. 风险与注意事项

### 7.1 技术风险
- **搜索性能**：文章数量较多时可能影响搜索性能
  - 缓解：使用防抖、优化匹配算法
  
- **About 内容维护**：硬编码内容难以维护
  - 缓解：使用 Markdown 文件或 JSON 配置

### 7.2 用户体验风险
- **搜索结果不准确**：模糊匹配可能返回不相关结果
  - 缓解：优化匹配规则，考虑权重排序
  
- **About 页面内容过长**：影响阅读体验
  - 缓解：合理分区，使用折叠或锚点导航

### 7.3 依赖项
- 无外部 API 依赖
- 所有资源使用本地文件或 CDN

---

## 8. 后续优化方向

MVP_4 完成后，可考虑的增强功能：
1. **全文搜索**：集成 lunr.js 实现文章内容搜索
2. **搜索历史**：记录用户搜索历史
3. **搜索建议**：输入时显示搜索建议
4. **高级筛选**：支持日期范围、多标签组合筛选
5. **About 页面增强**：添加技能进度条、项目展示等

---

## 9. 参考资料

- [Simple Icons](https://simpleicons.org/) - 技术图标
- [Devicon](https://devicon.dev/) - 开发者图标
- [CSS Timeline](https://freefrontend.com/css-timelines/) - 时间线设计参考
- [Search UX Best Practices](https://www.nngroup.com/articles/search-visible-and-simple/)

---

## 10. 附录

### 10.1 文件清单（预计新增/修改）
- `about.html` - 新增：About 页面
- `css/about.css` - 新增：About 页面样式（可选，或合并到 style.css）
- `js/search.js` - 新增：搜索功能逻辑（可选，或合并到 app.js）
- `index.html` - 修改：添加搜索栏
- `css/style.css` - 修改：添加搜索栏样式
- `js/app.js` - 修改：集成搜索逻辑

### 10.2 About 页面内容模板
```markdown
# About Me

## 个人介绍
你好，我是 k1he，一名热爱技术的全栈开发者...

## 技术栈
- 前端：JavaScript, TypeScript, React, Vue
- 后端：Node.js, Go, Python
- 数据库：MySQL, PostgreSQL, Redis
- 其他：Docker, Kubernetes, AWS

## 工作经历
### 公司 A（2023 - 至今）
- 职位：高级开发工程师
- 主要工作：...

### 公司 B（2021 - 2023）
- 职位：开发工程师
- 主要工作：...

## 联系方式
- GitHub: [@k1he](https://github.com/k1he)
- Email: example@email.com
```

### 10.3 搜索功能伪代码
```javascript
// 防抖函数
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 搜索处理
const handleSearch = debounce((query) => {
  if (!query.trim()) {
    renderArticles(allArticles);
    return;
  }
  
  const filtered = allArticles.filter(article => 
    matchArticle(article, query)
  );
  
  renderArticles(filtered);
  showResultCount(filtered.length);
}, 200);

// 绑定事件
searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

---

**文档状态**: Draft  
**下一步**: 技术评审 → 开发排期 → 实施开发
