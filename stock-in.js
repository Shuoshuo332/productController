// 商品入库页面 JavaScript 逻辑

// 表名常量
const TABLES = {
    PRODUCTS: 'products',
    STOCK_TRANSACTIONS: 'stock_transactions',
    CATEGORIES: 'categories'
};

document.addEventListener('DOMContentLoaded', function() {
    // 检查 Supabase SDK 是否已加载
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK 未加载');
        showError('系统初始化失败，请刷新页面重试');
        return;
    }
    
    // 确保 config.js 已加载
    if (typeof supabase === 'undefined') {
        console.error('config.js 未正确加载');
        showError('配置文件加载失败，请刷新页面重试');
        return;
    }
    
    initializeStockIn();
});

async function initializeStockIn() {
    try {
        await Promise.all([
            loadProducts(),
            loadTodayStockIn()
        ]);
        
        // 绑定表单提交事件
        document.getElementById('stockInForm').addEventListener('submit', handleStockIn);
        
    } catch (error) {
        console.error('初始化入库页面失败:', error);
        showError('加载数据失败，请检查网络连接');
    }
}

// 加载商品列表
async function loadProducts() {
    try {
        const { data: products, error } = await supabase
            .from(TABLES.PRODUCTS)
            .select('*')
            .order('name');
            
        if (error) throw error;
        
        const select = document.getElementById('productSelect');
        select.innerHTML = '<option value="">选择已有商品</option>';
        
        if (products) {
            products.forEach(product => {
                select.innerHTML += `<option value="${product.id}">${product.name} (${product.sku})</option>`;
            });
        }
        
    } catch (error) {
        console.error('加载商品列表失败:', error);
        showError('加载商品列表失败');
    }
}

// 加载今日入库记录
async function loadTodayStockIn() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data: transactions, error } = await supabase
            .from(TABLES.STOCK_TRANSACTIONS)
            .select(`
                *,
                products (name, sku)
            `)
            .eq('transaction_type', 'in')
            .gte('created_at', today + 'T00:00:00')
            .lte('created_at', today + 'T23:59:59')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const tbody = document.getElementById('todayStockInTable');
        
        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无今日入库记录</td></tr>';
            return;
        }
        
        let html = '';
        transactions.forEach(transaction => {
            const time = new Date(transaction.created_at).toLocaleTimeString('zh-CN');
            const productName = transaction.products?.name || '未知商品';
            const totalPrice = (transaction.quantity || 0) * (transaction.unit_price || 0);
            
            html += `
                <tr>
                    <td>${time}</td>
                    <td><strong>${productName}</strong></td>
                    <td>${transaction.quantity}</td>
                    <td>${APP_CONFIG.CURRENCY_SYMBOL}${(transaction.unit_price || 0).toFixed(2)}</td>
                    <td><strong>${APP_CONFIG.CURRENCY_SYMBOL}${totalPrice.toFixed(2)}</strong></td>
                    <td>${transaction.batch_number || '-'}</td>
                    <td>${transaction.operator || '系统'}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('加载今日入库记录失败:', error);
        document.getElementById('todayStockInTable').innerHTML = '<tr><td colspan="7" class="text-center text-danger">加载失败</td></tr>';
    }
}

// 切换新商品表单显示
function toggleNewProductForm() {
    const form = document.getElementById('newProductForm');
    const isVisible = form.style.display !== 'none';
    
    if (isVisible) {
        form.style.display = 'none';
        document.getElementById('productSelect').disabled = false;
        document.getElementById('productSelect').required = true;
    } else {
        form.style.display = 'block';
        document.getElementById('productSelect').disabled = true;
        document.getElementById('productSelect').required = false;
        document.getElementById('productSelect').value = '';
        
        // 生成自动SKU
        generateAutoSKU();
    }
}

// 生成自动SKU
function generateAutoSKU() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const autoSKU = `SKU${timestamp}${random}`;
    document.getElementById('newProductSKU').value = autoSKU;
}

// 处理商品入库
async function handleStockIn(event) {
    event.preventDefault();
    
    try {
        showLoading('正在处理入库...');
        
        const isCreatingNewProduct = document.getElementById('newProductForm').style.display !== 'none';
        let productId;
        
        if (isCreatingNewProduct) {
            // 创建新商品
            productId = await createNewProduct();
        } else {
            // 使用现有商品
            productId = document.getElementById('productSelect').value;
            if (!productId) {
                throw new Error('请选择商品');
            }
        }
        
        // 获取入库信息
        const quantity = parseInt(document.getElementById('stockInQuantity').value);
        const unitPrice = parseFloat(document.getElementById('stockInPrice').value);
        const batchNumber = document.getElementById('batchNumber').value;
        const supplier = document.getElementById('supplier').value;
        const notes = document.getElementById('notes').value;
        
        // 创建入库记录
        await createStockTransaction(productId, quantity, unitPrice, batchNumber, supplier, notes);
        
        // 更新商品库存
        await updateProductStock(productId, quantity);
        
        // 重置表单
        document.getElementById('stockInForm').reset();
        document.getElementById('newProductForm').style.display = 'none';
        document.getElementById('productSelect').disabled = false;
        document.getElementById('productSelect').required = true;
        
        // 刷新数据
        await Promise.all([
            loadProducts(),
            loadTodayStockIn()
        ]);
        
        hideLoading();
        showSuccess('商品入库成功！');
        
    } catch (error) {
        hideLoading();
        console.error('入库失败:', error);
        showError('入库失败：' + error.message);
    }
}

// 创建新商品
async function createNewProduct() {
    const name = document.getElementById('newProductName').value;
    const sku = document.getElementById('newProductSKU').value;
    const category = document.getElementById('newProductCategory').value;
    const price = parseFloat(document.getElementById('newProductPrice').value);
    const minStock = parseInt(document.getElementById('newProductMinStock').value);
    const description = document.getElementById('newProductDescription').value;
    
    if (!name || !sku || !category) {
        throw new Error('请填写完整的商品信息');
    }
    
    const { data: product, error } = await supabase
        .from(TABLES.PRODUCTS)
        .insert({
            name,
            sku,
            category,
            price: price || 0,
            min_stock: minStock || 0,
            description: description || '',
            current_stock: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
    if (error) throw error;
    
    return product.id;
}

// 创建入库交易记录
async function createStockTransaction(productId, quantity, unitPrice, batchNumber, supplier, notes) {
    const { error } = await supabase
        .from(TABLES.STOCK_TRANSACTIONS)
        .insert({
            product_id: productId,
            transaction_type: 'in',
            quantity: quantity,
            unit_price: unitPrice,
            batch_number: batchNumber || null,
            supplier: supplier || null,
            notes: notes || null,
            operator: '当前用户', // 实际应用中应该获取当前登录用户
            created_at: new Date().toISOString()
        });
        
    if (error) throw error;
}

// 更新商品库存
async function updateProductStock(productId, quantity) {
    // 首先获取当前库存
    const { data: product, error: fetchError } = await supabase
        .from(TABLES.PRODUCTS)
        .select('current_stock')
        .eq('id', productId)
        .single();
        
    if (fetchError) throw fetchError;
    
    const currentStock = product.current_stock || 0;
    const newStock = currentStock + quantity;
    
    // 更新库存
    const { error: updateError } = await supabase
        .from(TABLES.PRODUCTS)
        .update({
            current_stock: newStock,
            updated_at: new Date().toISOString()
        })
        .eq('id', productId);
        
    if (updateError) throw updateError;
}

// 工具函数
function showLoading(message = '加载中...') {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `
        <div class="toast-body">
            <div class="loading me-2"></div>
            ${message}
        </div>
    `;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
}

function hideLoading() {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        if (toast.textContent.includes('加载中') || toast.textContent.includes('正在')) {
            toast.remove();
        }
    });
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'danger');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `
        <div class="toast-body bg-${type} text-white">
            ${message}
        </div>
    `;
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}