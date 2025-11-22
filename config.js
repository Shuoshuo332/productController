// Supabase 配置
const SUPABASE_URL = 'https://kxkdgpqzhqkbfpfpkaww.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a2RncHF6aHFrYmZwZnBrYXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODgwNDgsImV4cCI6MjA3OTM2NDA0OH0.yy4Z4YmG4TP7SYDg0dFBJN1xboraq3Tf1gXzMvlkxyg';

// 初始化 Supabase 客户端
const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 数据库表名
const TABLES = {
    PRODUCTS: 'products',
    STOCK_TRANSACTIONS: 'stock_transactions',
    CATEGORIES: 'categories'
};

// 应用配置
const APP_CONFIG = {
    // 分页设置
    PAGE_SIZE: 20,
    
    // 库存警告阈值
    LOW_STOCK_THRESHOLD: 10,
    
    // 日期格式
    DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    
    // 货币符号
    CURRENCY_SYMBOL: '¥'
};

// 默认商品类别
const DEFAULT_CATEGORIES = [
    { name: '电子产品', description: '电子设备和配件' },
    { name: '服装', description: '衣物和配饰' },
    { name: '食品', description: '食品和饮料' },
    { name: '日用品', description: '日常用品' },
    { name: '其他', description: '其他商品' }
];