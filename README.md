# 仓库管理系统

一个基于 Supabase（后端服务）和 Netlify（前端部署）的现代化仓库管理系统。

## 功能特性

- 📊 **仪表板概览** - 实时库存价值、商品种类统计
- 📦 **库存管理** - 商品列表、库存状态监控、编辑删除
- 📥 **商品入库** - 批量入库、批次管理、供应商记录
- 🔍 **搜索筛选** - 按名称、SKU、类别、库存状态筛选
- 📈 **数据导出** - CSV 格式库存数据导出

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **后端**: Supabase (PostgreSQL + REST API)
- **部署**: Netlify (静态网站托管)
- **数据库**: PostgreSQL (通过 Supabase)

## 数据库设计

### 3 张核心数据表

1. **categories** - 商品类别表
   ```sql
   - id (UUID, 主键)
   - name (VARCHAR, 类别名称)
   - description (TEXT, 类别描述)
   ```

2. **products** - 商品表
   ```sql
   - id (UUID, 主键)
   - sku (VARCHAR, 商品编码)
   - name (VARCHAR, 商品名称)
   - category (VARCHAR, 商品类别)
   - price (DECIMAL, 商品单价)
   - current_stock (INTEGER, 当前库存)
   - min_stock (INTEGER, 安全库存)
   ```

3. **stock_transactions** - 库存交易记录表
   ```sql
   - id (UUID, 主键)
   - product_id (UUID, 商品ID)
   - transaction_type (VARCHAR, 交易类型: in/out)
   - quantity (INTEGER, 数量)
   - unit_price (DECIMAL, 单价)
   - batch_number (VARCHAR, 批次号)
   - supplier (VARCHAR, 供应商)
   ```

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd warehouse-management-system
```

### 2. 设置 Supabase

1. 访问 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL 编辑器中执行 `database.sql` 文件
3. 在设置中获取项目 URL 和 API Key
4. 更新 `config.js` 中的配置：

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

### 4. 部署到 Netlify

1. 将代码推送到 GitHub 仓库
2. 在 Netlify 中创建新站点
3. 连接 GitHub 仓库
4. 配置环境变量：
   - `SUPABASE_URL`: 你的 Supabase 项目 URL
   - `SUPABASE_ANON_KEY`: 你的 Supabase 匿名密钥
5. 部署完成！

## 页面结构

- **index.html** - 主页/仪表板
- **inventory.html** - 库存列表页面
- **stock-in.html** - 商品入库页面

## 主要功能

### 仪表板
- 总库存价值统计
- 商品种类数量
- 今日入库统计
- 最近交易记录
- 快速操作入口

### 库存管理
- 商品列表展示
- 库存状态指示（正常/低库存/缺货）
- 搜索和筛选功能
- 商品信息编辑
- 商品删除功能

### 商品入库
- 选择已有商品或创建新商品
- 批量入库操作
- 批次号管理
- 供应商信息记录
- 实时库存更新
- 今日入库记录查看

## 部署配置

项目已包含 Netlify 部署配置：
- `netlify.toml` - 部署配置文件
- `package.json` - 项目依赖和脚本
- 自动 HTTPS 和 CDN 加速
- 优化的缓存策略

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License