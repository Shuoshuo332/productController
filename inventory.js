// 库存列表页面 JavaScript 逻辑

let currentInventory = [];
let editingProduct = null;

// 表名常量
const TABLES = {
    PRODUCTS: 'products',
    STOCK_TRANSACTIONS: 'stock_transactions',
    CATEGORIES: 'categories'
};

document.addEventListener('DOMContentLoaded', function() {
    // 等待 Supabase SDK 加载完成
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
    
    initializeInventory();
    
    // 绑定搜索事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterInventory, 300));
    }
});

async function initializeInventory() {
    try {
        await Promise.all([
            loadCategories(),
            loadInventory()
        ]);
    } catch (error) {
        console.error('初始化库存页面失败:', error);
        showError('加载数据失败，请检查网络连接');
    }
}

// 加载商品类别
async function loadCategories() {
    try {
        console.log('开始加载商品类别...');
        
        const { data: categories, error } = await window.supabase
            .from(TABLES.CATEGORIES)
            .select('*')
            .order('name');
            
        if (error) {
            console.error('Supabase 类别查询错误:', error);
            throw error;
        }
        
        console.log('加载到的类别数据:', categories);
        
        const categorySelect = document.getElementById('categoryFilter');
        const editCategorySelect = document.getElementById('editProductCategory');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">所有类别</option>';
            if (categories) {
                categories.forEach(category => {
                    categorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
                });
            }
        }
        
        if (editCategorySelect) {
            editCategorySelect.innerHTML = '<option value="">选择类别</option>';
            if (categories) {
                categories.forEach(category => {
                    editCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`;
                });
            }
        }
        
    } catch (error) {
        console.error('加载类别失败:', error);
    }
}

// 加载库存数据
async function loadInventory() {
    try {
        showLoading();
        
        console.log('开始加载库存数据...');
        console.log('supabase 客户端状态:', typeof supabase);
        console.log('TABLES.PRODUCTS:', TABLES.PRODUCTS);
        
        const { data: products, error } = await supabase
            .from(TABLES.PRODUCTS)
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Supabase 查询错误:', error);
            throw error;
        }
        
        console.log('加载到的商品数据:', products);
        console.log('商品数量:', products ? products.length : 0);
        
        currentInventory = products || [];
        renderInventoryTable(currentInventory);
        
    } catch (error) {
        console.error('加载库存失败:', error);
        console.error('错误堆栈:', error.stack);
        showError('加载库存数据失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 渲染库存表格
function renderInventoryTable(products) {
    const tbody = document.getElementById('inventoryTable');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">暂无库存数据</td></tr>';
        return;
    }
    
    console.log('开始渲染表格，商品数量:', products.length);
    
    let html = '';
    products.forEach((product, index) => {
        const totalValue = (product.current_stock || 0) * (product.price || 0);
        const stockStatus = getStockStatus(product.current_stock, product.min_stock);
        const statusClass = getStatusClass(stockStatus);
        
        html += `
            <tr>
                <td><small>${product.sku}</small></td>
                <td>
                    <strong>${product.name}</strong>
                    ${product.description ? `<br><small class="text-muted">${product.description}</small>` : ''}
                </td>
                <td><span class="badge bg-info">${product.category || '未分类'}</span></td>
                <td>
                    <span class="${statusClass}">${product.current_stock || 0}</span>
                    ${product.min_stock ? `<br><small class="text-muted">最小: ${product.min_stock}</small>` : ''}
                </td>
                <td>¥${(product.price || 0).toFixed(2)}</td>
                <td><strong>¥${totalValue.toFixed(2)}</strong></td>
                <td><span class="badge ${statusClass}">${stockStatus}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct('${product.id}')">
                        编辑
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                        删除
                    </button>
                </td>
            </tr>
        `;
    });
    
    console.log('渲染完成，HTML长度:', html.length);
    tbody.innerHTML = html;
    console.log('表格已插入到DOM');
}

// 获取库存状态
function getStockStatus(currentStock, minStock) {
    const stock = currentStock || 0;
    const min = minStock || 0;
    
    if (stock === 0) return '缺货';
    if (stock <= min) return '低库存';
    return '正常';
}

// 获取状态样式类
function getStatusClass(status) {
    switch (status) {
        case '缺货': return 'text-danger';
        case '低库存': return 'text-warning';
        case '正常': return 'text-success';
        default: return 'text-secondary';
    }
}

// 筛选库存
async function filterInventory() {
    try {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const stockFilter = document.getElementById('stockFilter').value;
        
        let filtered = currentInventory.filter(product => {
            // 搜索筛选
            if (searchTerm) {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                    product.sku.toLowerCase().includes(searchTerm);
                if (!matchesSearch) return false;
            }
            
            // 类别筛选
            if (categoryFilter && product.category !== categoryFilter) {
                return false;
            }
            
            // 库存状态筛选
            if (stockFilter) {
                const status = getStockStatus(product.current_stock, product.min_stock);
                if (stockFilter === 'low' && status !== '低库存') return false;
                if (stockFilter === 'normal' && status !== '正常') return false;
                if (stockFilter === 'out' && status !== '缺货') return false;
            }
            
            return true;
        });
        
        renderInventoryTable(filtered);
        
    } catch (error) {
        console.error('筛选失败:', error);
        showError('筛选失败');
    }
}

// 重置筛选
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('stockFilter').value = '';
    renderInventoryTable(currentInventory);
}

// 编辑商品
async function editProduct(productId) {
    try {
        const product = currentInventory.find(p => p.id === productId);
        if (!product) {
            showError('商品不存在');
            return;
        }
        
        editingProduct = product;
        
        // 填充表单
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductSKU').value = product.sku;
        document.getElementById('editProductCategory').value = product.category || '';
        document.getElementById('editProductPrice').value = product.price || 0;
        document.getElementById('editProductMinStock').value = product.min_stock || 0;
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
        
    } catch (error) {
        console.error('编辑商品失败:', error);
        showError('编辑商品失败');
    }
}

// 更新商品
async function updateProduct() {
    if (!editingProduct) return;
    
    try {
        const updateData = {
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            min_stock: parseInt(document.getElementById('editProductMinStock').value),
            updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from(TABLES.PRODUCTS)
            .update(updateData)
            .eq('id', editingProduct.id);
            
        if (error) throw error;
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        
        // 重新加载数据
        await loadInventory();
        
        showSuccess('商品更新成功！');
        
    } catch (error) {
        console.error('更新商品失败:', error);
        showError('更新商品失败');
    }
}

// 删除商品
async function deleteProduct(productId) {
    if (!confirm('确定要删除这个商品吗？此操作不可恢复。')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from(TABLES.PRODUCTS)
            .delete()
            .eq('id', productId);
            
        if (error) throw error;
        
        await loadInventory();
        showSuccess('商品删除成功！');
        
    } catch (error) {
        console.error('删除商品失败:', error);
        showError('删除商品失败');
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数
function showLoading() {
    // 简化的加载提示
    const tbody = document.getElementById('inventoryTable');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">加载中...</span>
                    </div>
                    <div class="mt-2">正在加载库存数据...</div>
                </td>
            </tr>
        `;
    }
}

function hideLoading() {
    // 加载完成后隐藏提示
    console.log('加载完成');
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