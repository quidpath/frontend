'use client';

import React, { useState } from 'react';
import { Card, Space, Typography, Divider, Button, message, Descriptions, Tag } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import ProductSelector from '@/modules/inventory/components/ProductSelector';
import inventoryService from '@/services/inventoryService';

const { Title, Text, Paragraph } = Typography;

export default function TestProductSelectorPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any>(null);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleProductSelect = async (productId: string, product?: any) => {
    setSelectedProductId(productId);
    setSelectedProduct(product);
    setProductDetails(null);
    setStockInfo(null);

    if (productId && product) {
      message.success(`Selected: ${product.name}`);
      
      // Fetch detailed product info
      try {
        setLoading(true);
        const details = await inventoryService.queryProduct(productId);
        setProductDetails(details);

        // Fetch stock info
        const stock = await inventoryService.getProductStock(productId);
        setStockInfo(stock);
      } catch (error) {
        console.error('Error fetching product details:', error);
        message.error('Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    }
  };

  const testSearchProducts = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.searchProducts('test');
      message.success(`Found ${response.data.count} products`);
      console.log('Search results:', response.data);
    } catch (error) {
      console.error('Error searching products:', error);
      message.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const testGetProductsForSale = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getProductsForSale();
      message.success(`Found ${response.data.count} products for sale`);
      console.log('Products for sale:', response.data);
    } catch (error) {
      console.error('Error getting products for sale:', error);
      message.error('Failed to get products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>
        <SearchOutlined /> Product Selector Test Page
      </Title>
      <Paragraph type="secondary">
        Test the ProductSelector component and inventory service integration
      </Paragraph>

      <Divider />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Product Selector Test */}
        <Card title="Product Selector Component" extra={<ShoppingCartOutlined />}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>Select a Product:</Text>
              <div style={{ marginTop: '8px' }}>
                <ProductSelector
                  value={selectedProductId}
                  onChange={handleProductSelect}
                  placeholder="Search by product name, SKU, or barcode..."
                  showStock={true}
                  showPrice={true}
                  filterSaleable={true}
                />
              </div>
            </div>

            {selectedProduct && (
              <Card size="small" title="Selected Product (from selector)">
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="ID">{selectedProduct.id}</Descriptions.Item>
                  <Descriptions.Item label="Name">{selectedProduct.name}</Descriptions.Item>
                  <Descriptions.Item label="SKU">{selectedProduct.internal_reference}</Descriptions.Item>
                  <Descriptions.Item label="Barcode">{selectedProduct.barcode || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="List Price">
                    KES {Number(selectedProduct.list_price).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Available Stock">
                    <Tag color={Number(selectedProduct.available_stock || 0) > 0 ? 'green' : 'red'}>
                      {Number(selectedProduct.available_stock || 0).toLocaleString()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {productDetails && (
              <Card size="small" title="Product Details (from API)" loading={loading}>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Name">{productDetails.name}</Descriptions.Item>
                  <Descriptions.Item label="SKU">{productDetails.internal_reference}</Descriptions.Item>
                  <Descriptions.Item label="Category">{productDetails.category_name || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="UOM">{productDetails.uom_name || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="List Price">
                    KES {Number(productDetails.list_price).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Standard Price">
                    KES {Number(productDetails.standard_price).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Product Type">{productDetails.product_type}</Descriptions.Item>
                  <Descriptions.Item label="Can Be Sold">
                    <Tag color={productDetails.can_be_sold ? 'green' : 'red'}>
                      {productDetails.can_be_sold ? 'Yes' : 'No'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {stockInfo && (
              <Card size="small" title="Stock Information" loading={loading}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Product">{stockInfo.product_name}</Descriptions.Item>
                  <Descriptions.Item label="Total Available">
                    <Tag color="blue" style={{ fontSize: '16px' }}>
                      {parseFloat(stockInfo.total_available).toLocaleString()}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
                {stockInfo.by_location && stockInfo.by_location.length > 0 && (
                  <>
                    <Divider style={{ margin: '12px 0' }} />
                    <Text strong>By Location:</Text>
                    <div style={{ marginTop: '8px' }}>
                      {stockInfo.by_location.map((loc: any, index: number) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                          <Tag>{loc.location}</Tag>
                          <Text>{parseFloat(loc.quantity).toLocaleString()}</Text>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}
          </Space>
        </Card>

        {/* API Test Buttons */}
        <Card title="API Tests">
          <Space wrap>
            <Button onClick={testSearchProducts} loading={loading}>
              Test Search Products
            </Button>
            <Button onClick={testGetProductsForSale} loading={loading}>
              Test Get Products for Sale
            </Button>
          </Space>
        </Card>

        {/* Instructions */}
        <Card title="Testing Instructions">
          <Space direction="vertical">
            <Text>1. Type at least 2 characters in the search box to search for products</Text>
            <Text>2. Select a product from the dropdown</Text>
            <Text>3. View the selected product details and stock information</Text>
            <Text>4. Test the API buttons to verify backend connectivity</Text>
            <Text strong type="success">
              ✓ If you can search and select products, the integration is working!
            </Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
