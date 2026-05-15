import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Button,
  message,
  Select,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { createCoupon } from '../../../apis/admin/coupon';
import { getAllCategories } from '../../../apis/admin/category';
import { getAllProducts } from '../../../apis/admin/product';

const { Option } = Select;

const CouponForm = ({ isModalVisible, handleCancel, tableQuery }) => {
  const [form] = useForm();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [scope, setScope] = useState('All');

  useEffect(() => {
    const fetchScopeData = async () => {
      try {
        const catRes = await getAllCategories();
        setCategories(catRes?.data || []);

        const prodRes = await getAllProducts({ pageSize: 1000 }); // Adjust as needed
        setProducts(prodRes?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories/products', err);
      }
    };

    if (isModalVisible) {
      fetchScopeData();
    }
  }, [isModalVisible]);

  const handleFinish = async (value) => {
    try {
      const res = await createCoupon(value);
      console.log(res);
      message.success('Coupon created successfully');
      handleCancel();
      tableQuery.refetch();
      form.resetFields();
      setScope('All');
    } catch (err) {
      console.log(err);
      message.error(err?.response?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <Modal
      title="Create Coupon"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          showToUsers: true,
          scope: 'All',
        }}
      >
        <Form.Item
          label="Coupon Name"
          name="couponName"
          rules={[{ required: true, message: 'Please enter the coupon name' }]}
        >
          <Input placeholder="Enter coupon name" />
        </Form.Item>

        <Form.Item
          label="Coupon Code"
          name="couponCode"
          rules={[{ required: true, message: 'Please enter the coupon code' }]}
        >
          <Input placeholder="Enter coupon code" />
        </Form.Item>

        <Form.Item
          label="Scope"
          name="scope"
          rules={[{ required: true, message: 'Please select scope' }]}
        >
          <Select onChange={(val) => setScope(val)}>
            <Option value="All">All</Option>
            <Option value="Category">Specific Category</Option>
            <Option value="Product">Specific Product</Option>
          </Select>
        </Form.Item>

        {scope === 'Category' && (
          <Form.Item
            label="Select Category"
            name="scopeCategory"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select
              showSearch
              placeholder="Search category"
              optionFilterProp="children"
            >
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name?.en || cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {scope === 'Product' && (
          <Form.Item
            label="Select Product"
            name="scopeProduct"
            rules={[{ required: true, message: 'Please select a product' }]}
          >
            <Select
              showSearch
              placeholder="Search product"
              optionFilterProp="children"
            >
              {products.map((prod) => (
                <Option key={prod._id} value={prod._id}>
                  {prod.productName?.en || prod.productName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label="Expiry Date"
          name="expiryDate"
          rules={[{ required: true, message: 'Please select the expiry date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Discount %"
          name="discount"
          rules={[
            { required: true, message: 'Please enter the discount percentage' },
          ]}
        >
          <Input type="number" placeholder="Enter discount percentage" />
        </Form.Item>

        <Form.Item name="showToUsers" valuePropName="checked">
          <Checkbox>Show to users in cart</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Submit
          </Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CouponForm;
