-- 仓库管理系统数据库结构
-- Supabase PostgreSQL 数据库脚本

-- 1. 商品类别表 (categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 商品表 (products)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL REFERENCES categories(name),
    price DECIMAL(10,2) DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT '件',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 库存交易记录表 (stock_transactions)
CREATE TABLE IF NOT EXISTS stock_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('in', 'out')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2),
    batch_number VARCHAR(50),
    supplier VARCHAR(200),
    notes TEXT,
    operator VARCHAR(100) DEFAULT '系统',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_product_id ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON stock_transactions(transaction_type);

-- 插入默认商品类别
INSERT INTO categories (name, description) VALUES
('电子产品', '电子设备和配件'),
('服装', '衣物和配饰'),
('食品', '食品和饮料'),
('日用品', '日常用品'),
('其他', '其他商品')
ON CONFLICT (name) DO NOTHING;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建更新时间触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建库存更新触发器
CREATE OR REPLACE FUNCTION update_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type = 'in' THEN
        UPDATE products 
        SET current_stock = current_stock + NEW.quantity
        WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'out' THEN
        UPDATE products 
        SET current_stock = current_stock - NEW.quantity
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为库存交易表创建触发器
CREATE TRIGGER trigger_update_stock_on_transaction
    AFTER INSERT ON stock_transactions
    FOR EACH ROW EXECUTE FUNCTION update_stock_on_transaction();

-- 启用行级安全策略 (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- 创建安全策略（示例，实际应用中需要根据认证系统调整）
CREATE POLICY "允许所有操作" ON categories FOR ALL USING (true);
CREATE POLICY "允许所有操作" ON products FOR ALL USING (true);
CREATE POLICY "允许所有操作" ON stock_transactions FOR ALL USING (true);

-- 创建视图：库存汇总
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.category,
    p.price,
    p.current_stock,
    p.min_stock,
    CASE 
        WHEN p.current_stock = 0 THEN '缺货'
        WHEN p.current_stock <= p.min_stock THEN '低库存'
        ELSE '正常'
    END as stock_status,
    (p.current_stock * p.price) as total_value,
    p.created_at,
    p.updated_at
FROM products p;

-- 创建视图：每日入库统计
CREATE OR REPLACE VIEW daily_stock_in_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as transaction_count,
    SUM(quantity) as total_quantity,
    SUM(quantity * unit_price) as total_value
FROM stock_transactions 
WHERE transaction_type = 'in'
GROUP BY DATE(created_at)
ORDER BY date DESC;