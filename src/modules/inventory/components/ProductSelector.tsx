'use client';

import React, { useState, useCallback } from 'react';
import { Select, Spin, Tag, Typography, Space } from 'antd';
import { SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import inventoryService, { Product as BaseProduct } from '@/services/inventoryService';

const { Text } = Typography;

// Extended Product interface for search results that include stock info
interface Product extends BaseProduct {
  available_stock?: string;
}

interface ProductSelectorProps {
  value?: string;
  onChange?: (value: string, product?: Product) => void;
  placeholder?: string;
  showStock?: boolean;
  showPrice?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  filterSaleable?: boolean;
  allowClear?: boolean;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Search products...',
  showStock = true,
  showPrice = true,
  disabled = false,
  style,
  filterSaleable = false,
  allowClear = true,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        const response = await inventoryService.searchProducts(query);
        let filteredProducts = response.data.products || [];

        // Filter for saleable products if needed
        if (filterSaleable) {
          filteredProducts = filteredProducts.filter((p: Product) => p.can_be_sold);
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [filterSaleable]
  );

  const handleSearch = (query: string) => {
    setSearchValue(query);
    debouncedSearch(query);
  };

  const handleChange = (productId: string) => {
    const selectedProduct = products.find((p) => p.id === productId);
    onChange?.(productId, selectedProduct);
  };

  const handleClear = () => {
    setSearchValue('');
    setProducts([]);
    onChange?.('', undefined);
  };

  // Format option label with product details
  const formatOptionLabel = (product: Product) => {
    const stockNum = parseFloat(product.available_stock || '0');
    const isLowStock = stockNum < 10 && stockNum > 0;
    const isOutOfStock = stockNum === 0;

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="vertical" size={0} style={{ flex: 1 }}>
          <Text strong>{product.name}</Text>
          <Space size="small">
            {product.internal_reference && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                SKU: {product.internal_reference}
              </Text>
            )}
            {product.barcode && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                | Barcode: {product.barcode}
              </Text>
            )}
          </Space>
        </Space>
        <Space size="small" style={{ marginLeft: '16px' }}>
          {showPrice && (
            <Tag color="blue">
              KES {Number(product.list_price).toLocaleString()}
            </Tag>
          )}
          {showStock && product.available_stock && (
            <Tag color={isOutOfStock ? 'red' : isLowStock ? 'orange' : 'green'}>
              {isOutOfStock ? (
                <>
                  <InboxOutlined /> Out of Stock
                </>
              ) : (
                <>Stock: {stockNum.toLocaleString()}</>
              )}
            </Tag>
          )}
        </Space>
      </div>
    );
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      defaultActiveFirstOption={false}
      suffixIcon={<SearchOutlined />}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      onClear={handleClear}
      notFoundContent={
        loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="small" />
            <div style={{ marginTop: '8px' }}>Searching products...</div>
          </div>
        ) : searchValue.length < 2 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Type at least 2 characters to search
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No products found
          </div>
        )
      }
      loading={loading}
      disabled={disabled}
      allowClear={allowClear}
      options={products.map((product) => ({
        value: product.id,
        label: formatOptionLabel(product),
      }))}
    />
  );
};

export default ProductSelector;
