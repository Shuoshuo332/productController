// 生产环境配置 - 线上版本
const SUPABASE_CONFIG = {
    URL: 'https://kxkdgpqzhqkbfpfpkaww.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a2RncHF6aHFrYmZwZnBrYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODgwNDgsImV4cCI6MjA3OTM2NDA0OH0.yy4Z4YmG4TP7SYDg0dFBJN1xboraq3Tf1gXzMvlkxyg'
};

// 导出配置
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

// 创建 Supabase 客户端
if (typeof window.supabase !== 'undefined') {
    window.supabase = window.supabase.createClient(
        SUPABASE_CONFIG.URL,
        SUPABASE_CONFIG.ANON_KEY
    );
    console.log('✅ 线上 Supabase 客户端初始化成功');
}

// 应用配置
const APP_CONFIG = {
    APP_NAME: '仓库管理系统',
    VERSION: '1.0.0',
    CURRENCY_SYMBOL: '¥',
    DEFAULT_ITEMS_PER_PAGE: 10,
    TOAST_DURATION: 3000
};

// 数据库表名
const TABLES = {
    PRODUCTS: 'products',
    STOCK_TRANSACTIONS: 'stock_transactions',
    CATEGORIES: 'categories'
};

console.log('🔗 线上配置加载完成');
console.log('📊 Supabase URL:', SUPABASE_CONFIG.URL);
console.log('🗃️ 数据表:', Object.values(TABLES));