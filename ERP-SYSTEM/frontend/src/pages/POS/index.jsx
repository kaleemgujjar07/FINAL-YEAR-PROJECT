import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Input, Divider, List, Avatar, message, Empty } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@/request';
import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';

const { Title, Text } = Typography;

export default function POS() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { moneyFormatter } = useMoney();
  const translate = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await request.listAll({ entity: 'product' });
      if (response && response.success) {
        setProducts(response.result);
        setFilteredProducts(response.result);
      }
    } catch (err) {
      message.error('Failed to load products');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(value) || (p.category && p.category.name.toLowerCase().includes(value)));
    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, cartQty: item.cartQty + 1 } : item));
    } else {
      setCart([...cart, { ...product, cartQty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const checkout = () => {
    if (cart.length === 0) return message.warning('Cart is empty!');
    message.success('Payment Received! Invoice Generated Successfully.');
    setCart([]); // Clear cart
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQty), 0);
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + tax;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[24, 24]}>
        
        {/* Product Grid - Left Side */}
        <Col xs={24} md={16}>
          <Card title="Point of Sale" bordered={false} style={{ borderRadius: '12px', minHeight: '80vh' }}
            extra={<Input prefix={<SearchOutlined />} placeholder="Search products..." onChange={handleSearch} style={{ width: 250, borderRadius: '20px' }} />}
          >
            <Row gutter={[16, 16]}>
              {loading ? <div style={{width: '100%', textAlign: 'center', padding: '50px'}}><Text>Loading products...</Text></div> : null}
              {!loading && filteredProducts.length === 0 ? <Empty style={{margin: 'auto', marginTop: '50px'}} /> : null}
              
              {filteredProducts.map(product => (
                <Col xl={6} lg={8} md={12} sm={12} xs={24} key={product._id}>
                  <Card 
                    hoverable 
                    onClick={() => addToCart(product)}
                    style={{ borderRadius: '12px', textAlign: 'center', border: '1px solid #e8e8e8', overflow: 'hidden' }}
                    styles={{ body: { padding: '15px' } }}
                  >
                    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '8px', marginBottom: '10px' }}>
                      <ShopOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    </div>
                    <Text strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</Text>
                    <Text type="secondary" style={{ display: 'block' }}>{product.category?.name || 'General'}</Text>
                    <Text strong style={{ color: '#52c41a', fontSize: '16px', marginTop: '5px', display: 'block' }}>
                      {moneyFormatter({ amount: product.price })}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Cart - Right Side */}
        <Col xs={24} md={8}>
          <Card title={<><ShoppingCartOutlined /> Current Order</>} bordered={false} style={{ borderRadius: '12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '50vh', paddingRight: '10px' }}>
              <List
                itemLayout="horizontal"
                dataSource={cart}
                locale={{ emptyText: 'No items in cart' }}
                renderItem={item => (
                  <List.Item
                    actions={[<Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeFromCart(item._id)} />]}
                  >
                    <List.Item.Meta
                      title={<Text strong>{item.name}</Text>}
                      description={`Qty: ${item.cartQty} x ${moneyFormatter({ amount: item.price })}`}
                    />
                    <div style={{ fontWeight: 'bold' }}>
                      {moneyFormatter({ amount: item.price * item.cartQty })}
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <Divider dashed />

            <div style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text type="secondary">Subtotal</Text>
                <Text strong>{moneyFormatter({ amount: subtotal })}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text type="secondary">Tax (10%)</Text>
                <Text strong>{moneyFormatter({ amount: tax })}</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Total</Title>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{moneyFormatter({ amount: total })}</Title>
              </div>
            </div>

            <Button 
              type="primary" 
              size="large" 
              icon={<CheckCircleOutlined />} 
              style={{ width: '100%', marginTop: '20px', height: '50px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }}
              onClick={checkout}
            >
              Checkout / Pay
            </Button>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
// Hack import since I used ShopOutlined directly in map but didn't import it at top.
import { ShopOutlined } from '@ant-design/icons';
