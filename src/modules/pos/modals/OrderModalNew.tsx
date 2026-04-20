'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, Table, InputNumber, message, Divider, Row, Col, Typography, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import ProductSelector from '@/modules/inventory/components/ProductSelector';
import posService from '@/services/posService';
import { Product as BaseProduct } from '@/services/inventoryService';

const { Text, Title } = Typography;

// Extended Product interface for POS with stock info
interface Product extends BaseProduct {
  available_stock?: string;
}

interface OrderLine {
  key: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  subtotal: number;
}

interface OrderModalNewProps {
  open: boolean;
  onClose: () => void;
  sessionId?: string;
  onSuccess: () => void;
}

const OrderModalNew: React.FC<OrderModalNewProps> = ({ open, onClose, sessionId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (open && !orderId) {
      createDraftOrder();
    }
  }, [open]);

  const createDraftOrder = async () => {
    if (!sessionId) {
      message.error('No active session. Please open a session first.');
      onClose();
      return;
    }

    try {
      setLoading(true);
      const response = await posService.createOrder({
        customer_name: '',
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        payment_method: '',
        status: 'pending',
      } as any);
      setOrderId(response.data.id);
    } catch (error) {
      console.error('Error creating draft order:', error);
      message.error('Failed to create order');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (productId: string, product?: Product) => {
    if (!product || !orderId) return;

    try {
      setLoading(true);
      
      // Add line to order via API
      await posService.addOrderLine(orderId, {
        product_id: productId,
        quantity: 1,
      });

      // Add to local state
      const newLine: OrderLine = {
        key: Date.now().toString(),
        product_id: productId,
        product_name: product.name,
        sku: product.internal_reference,
        quantity: 1,
        unit_price: Number(product.list_price),
        discount_percent: 0,
        subtotal: Number(product.list_price),
      };

      setOrderLines([...orderLines, newLine]);
      message.success(`Added ${product.name} to order`);
    } catch (error: any) {
      console.error('Error adding product to order:', error);
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Failed to add product to order');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (key: string, quantity: number) => {
    setOrderLines(
      orderLines.map((line) => {
        if (line.key === key) {
          const subtotal = quantity * line.unit_price * (1 - line.discount_percent / 100);
          return { ...line, quantity, subtotal };
        }
        return line;
      })
    );
  };

  const handleDiscountChange = (key: string, discount: number) => {
    setOrderLines(
      orderLines.map((line) => {
        if (line.key === key) {
          const subtotal = line.quantity * line.unit_price * (1 - discount / 100);
          return { ...line, discount_percent: discount, subtotal };
        }
        return line;
      })
    );
  };

  const handleRemoveLine = async (key: string, lineId?: string) => {
    if (!orderId) return;

    try {
      if (lineId) {
        await posService.removeOrderLine(orderId, lineId);
      }
      setOrderLines(orderLines.filter((line) => line.key !== key));
      message.success('Item removed from order');
    } catch (error) {
      console.error('Error removing line:', error);
      message.error('Failed to remove item');
    }
  };

  const calculateTotals = () => {
    const subtotal = orderLines.reduce((sum, line) => sum + line.subtotal, 0);
    const discount = 0; // Can add order-level discount if needed
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const handlePayment = async () => {
    if (!orderId || orderLines.length === 0) {
      message.error('Please add at least one item to the order');
      return;
    }

    const values = await form.validateFields();
    const { subtotal, total } = calculateTotals();

    try {
      setLoading(true);

      // Process payment
      await posService.processPayment(orderId, {
        payments: [
          {
            method: values.payment_method || 'cash',
            amount: total.toString(),
          },
        ],
      });

      message.success('Order completed successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else {
        message.error('Failed to process payment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderLines([]);
    setOrderId(null);
    form.resetFields();
    onClose();
  };

  const { subtotal, discount, total } = calculateTotals();

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text: string, record: OrderLine) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            SKU: {record.sku}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (value: number, record: OrderLine) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleQuantityChange(record.key, val || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      render: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      title: 'Discount %',
      dataIndex: 'discount_percent',
      key: 'discount_percent',
      width: 120,
      render: (value: number, record: OrderLine) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) => handleDiscountChange(record.key, val || 0)}
          style={{ width: '100%' }}
          formatter={(value) => `${value}%`}
          parser={(value) => value?.replace('%', '') as any}
        />
      ),
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (value: number) => (
        <Text strong>KES {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_: any, record: OrderLine) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveLine(record.key)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>New Order</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handlePayment}
          loading={loading}
          disabled={orderLines.length === 0}
        >
          Complete Payment
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Customer Name" name="customer_name">
              <Input placeholder="Enter customer name (optional)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Payment Method"
              name="payment_method"
              initialValue="cash"
              rules={[{ required: true, message: 'Please select payment method' }]}
            >
              <Select>
                <Select.Option value="cash">Cash</Select.Option>
                <Select.Option value="card">Card</Select.Option>
                <Select.Option value="mpesa">M-Pesa</Select.Option>
                <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>Add Products</Divider>

        <Form.Item label="Search and Add Product">
          <ProductSelector
            placeholder="Search by product name, SKU, or barcode..."
            showStock={true}
            showPrice={true}
            filterSaleable={true}
            onChange={handleProductSelect}
            value={undefined}
            allowClear={false}
          />
        </Form.Item>

        <Divider>Order Items</Divider>

        {orderLines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <ShoppingCartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>No items in order. Search and add products above.</div>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={orderLines}
              pagination={false}
              size="small"
              style={{ marginBottom: '24px' }}
            />

            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <Row justify="end">
                <Col span={8}>
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Row justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text strong>
                        KES {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </Row>
                    {discount > 0 && (
                      <Row justify="space-between">
                        <Text>Discount:</Text>
                        <Text type="danger">
                          -KES {discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </Row>
                    )}
                    <Divider style={{ margin: '8px 0' }} />
                    <Row justify="space-between">
                      <Title level={5} style={{ margin: 0 }}>
                        Total:
                      </Title>
                      <Title level={5} style={{ margin: 0 }}>
                        KES {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Title>
                    </Row>
                  </Space>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default OrderModalNew;
