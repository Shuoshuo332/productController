-- 向仓库管理系统插入示例数据

-- 1. 插入商品类别（如果不存在）
INSERT INTO categories (name, description) VALUES
    ('电子产品', '电子设备和配件'),
    ('服装', '衣物和配饰'),
    ('食品', '食品和饮料'),
    ('日用品', '日常用品'),
    ('其他', '其他商品')
ON CONFLICT (name) DO NOTHING;

-- 2. 插入商品数据
INSERT INTO products (sku, name, category, price, current_stock, min_stock, description) VALUES
    ('PHONE001', 'iPhone 15 Pro', '电子产品', 7999.00, 25, 10, '苹果最新款手机'),
    ('LAPTOP001', 'MacBook Air M2', '电子产品', 8999.00, 15, 5, '轻薄笔记本电脑'),
    ('SHIRT001', '纯棉T恤', '服装', 89.00, 100, 50, '100%纯棉材质'),
    ('JEANS001', '牛仔裤', '服装', 299.00, 50, 20, '经典款牛仔裤'),
    ('SNACK001', '薯片', '食品', 12.00, 200, 100, '原味薯片'),
    ('DRINK001', '矿泉水', '食品', 3.00, 500, 200, '500ml瓶装水'),
    ('SOAP001', '香皂', '日用品', 8.00, 150, 50, '滋润型香皂'),
    ('PAPER001', '卫生纸', '日用品', 25.00, 80, 30, '10卷装卫生纸')
ON CONFLICT (sku) DO NOTHING;

-- 3. 插入示例交易记录
-- 注意：这里使用已知的商品ID，实际执行时可能需要先查询获取正确的ID

-- iPhone 15 Pro 交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'PHONE001'), 'in', 30, 7999.00, 'BATCH202411001', '苹果官方', '新品入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'PHONE001'), 'out', 5, 7999.00, 'BATCH202411001', NULL, '客户购买', '系统'),
    ((SELECT id FROM products WHERE sku = 'PHONE001'), 'in', 10, 7999.00, 'BATCH202411002', '苹果官方', '补货入库', '管理员')
ON CONFLICT DO NOTHING;

-- MacBook Air M2 交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'LAPTOP001'), 'in', 20, 8999.00, 'BATCH202411003', '苹果官方', '新品入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'LAPTOP001'), 'out', 5, 8999.00, 'BATCH202411003', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 纯棉T恤交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'SHIRT001'), 'in', 150, 89.00, 'BATCH202411004', '服装厂A', '新货入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'SHIRT001'), 'out', 50, 89.00, 'BATCH202411004', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 牛仔裤交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'JEANS001'), 'in', 80, 299.00, 'BATCH202411005', '服装厂B', '新货入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'JEANS001'), 'out', 30, 299.00, 'BATCH202411005', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 薯片交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'SNACK001'), 'in', 300, 12.00, 'BATCH202411006', '食品公司A', '新货入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'SNACK001'), 'out', 100, 12.00, 'BATCH202411006', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 矿泉水交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'DRINK001'), 'in', 1000, 3.00, 'BATCH202411007', '饮料公司A', '新货入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'DRINK001'), 'out', 500, 3.00, 'BATCH202411007', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 香皂交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'SOAP001'), 'in', 200, 8.00, 'BATCH202411008', '日用品公司A', '新货入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'SOAP001'), 'out', 50, 8.00, 'BATCH202411008', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 卫生纸交易记录
INSERT INTO stock_transactions (product_id, transaction_type, quantity, unit_price, batch_number, supplier, notes, operator) VALUES
    ((SELECT id FROM products WHERE sku = 'PAPER001'), 'in', 100, 25.00, 'BATCH202411009', '日用品公司B', '新货入库', '管理员'),
    ((SELECT id FROM products WHERE sku = 'PAPER001'), 'out', 20, 25.00, 'BATCH202411009', NULL, '客户购买', '系统')
ON CONFLICT DO NOTHING;

-- 插入完成提示
DO $$
BEGIN
    RAISE NOTICE '✅ 示例数据插入完成！';
    RAISE NOTICE '📦 已插入 5 个商品类别';
    RAISE NOTICE '📱 已插入 8 个商品';
    RAISE NOTICE '📋 已插入多个交易记录';
    RAISE NOTICE '🎉 现在可以开始使用仓库管理系统了！';
END $$;