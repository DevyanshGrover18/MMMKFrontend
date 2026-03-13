import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Button,
  message,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { createCoupon } from '../../../apis/admin/coupon';

const CouponForm = ({ isModalVisible, handleCancel, tableQuery }) => {
  const [form] = useForm();

  const handleFinish = async (value) => {
    try {
      const res = await createCoupon(value);
      console.log(res);
      message.success('Coupon create successfully');
      handleCancel();
      tableQuery.refetch();
      form.resetFields();
    } catch (err) {
      console.log(err);
      message.error(err?.response?.data?.message || 'Failed  to create coupon');
    }
  };

  return (
    <Modal
      title="Create Coupon"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          firstOrder: false,
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
            { required: true, message: 'Please enter the discount code' },
          ]}
        >
          <Input type="number" placeholder="Enter discount percentage" />
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
