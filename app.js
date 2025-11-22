// 主页面 JavaScript 逻辑

// 等待 Supabase SDK 加载完成
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
    
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadRecentTransactions()
        ]);
    } catch (error) {
        console.error('初始化仪表板失败:', error);
        showError('加载数据失败，请检查网络连接');
    }
}

// 加载仪表板统计数据
async function loadDashboardStats() {
    try {
        // 获取所有商品
        const { data: products, error: productsError } = await supabase
            .from(TABLES.PRODUCTS)
            .select('*');
            
        if (productsError) throw productsError;
        
        // 计算总库存价值
        let totalValue = 0;
        let productTypes = products ? products.length : 0;
        
        if (products) {
            products.forEach(product => {
                totalValue += (product.current_stock || 0) * (product.price || 0);
            });
        }
        
        // 获取今日入库记录
        const today = new Date().toISOString().split('T')[0];
        const { data: todayTransactions, error: transactionsError } = await supabase
            .from(TABLES.STOCK_TRANSACTIONS)
            .select('*')
            .gte('created_at', today + 'T00:00:00')
            .lte('created_at', today + 'T23:59:59');
            
        if (transactionsError) throw transactionsError;
        
        let todayStockIn = 0;
        if (todayTransactions) {
            todayTransactions.forEach(transaction => {
                if (transaction.transaction_type === 'in') {
                    todayStockIn += transaction.quantity;
                }
            });
        }
        
        // 更新页面显示
        document.getElementById('totalValue').textContent = APP_CONFIG.CURRENCY_SYMBOL + totalValue.toFixed(2);
        document.getElementById('productTypes').textContent = productTypes;
        document.getElementById('todayStockIn').textContent = todayStockIn;
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 加载最近交易记录
async function loadRecentTransactions() {
    try {
        const { data: transactions, error } = await supabase
            .from(TABLES.STOCK_TRANSACTIONS)
            .select(`
                *,
                products (name, sku)
            `)
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        
        const container = document.getElementById('recentTransactions');
        
        if (!transactions || transactions.length === 0) {
            container.innerHTML = '<p class="text-muted">暂无记录</p>';
            return;
        }
        
        let html = '';
        transactions.forEach(transaction => {
            const time = new Date(transaction.created_at).toLocaleString('zh-CN');
            const productName = transaction.products?.name || '未知商品';
            const typeClass = transaction.transaction_type === 'in' ? 'success' : 'danger';
            const typeText = transaction.transaction_type === 'in' ? '入库' : '出库';
            
            html += `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                        <strong>${productName}</strong>
                        <span class="badge bg-${typeClass} ms-2">${typeText}</span>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">${time}</small><br>
                        <strong>${transaction.quantity} 件</strong>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('加载最近交易失败:', error);
        document.getElementById('recentTransactions').innerHTML = '<p class="text-danger">加载失败</p>';
    }
}

// 导出数据功能
async function exportData() {
    try {
        showLoading('正在导出数据...');
        
        // 获取所有商品数据
        const { data: products, error } = await supabase
            .from(TABLES.PRODUCTS)
            .select('*');
            
        if (error) throw error;
        
        // 创建 CSV 内容
        let csvContent = '\uFEFF'; // BOM for UTF-8
        csvContent += 'SKU,商品名称,类别,当前库存,单价,总价值,安全库存,创建时间\n';
        
        if (products) {
            products.forEach(product => {
                const totalValue = (product.current_stock || 0) * (product.price || 0);
                csvContent += `"${product.sku}","${product.name}","${product.category}",${product.current_stock || 0},${product.price || 0},${totalValue.toFixed(2)},${product.min_stock || 0},"${product.created_at}"\n`;
            });
        }
        
        // 创建下载链接
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `库存数据_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        hideLoading();
        showSuccess('数据导出成功！');
        
    } catch (error) {
        hideLoading();
        console.error('导出数据失败:', error);
        showError('导出数据失败，请重试');
    }
}

// 工具函数
function showLoading(message = '加载中...') {
    // 显示加载提示
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
    
    // 3秒后自动移除
    setTimeout(() => {
        toast.remove();
    }, 3000);
}