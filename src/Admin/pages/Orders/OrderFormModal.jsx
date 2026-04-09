import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, InputNumber, message } from 'antd';
import { updateOrder } from '../../../apis/admin/order';

const { Option } = Select;

const OrderFormModal = ({ editData, onCancel, tableQuery }) => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      if (!editData?._id) {
        message.error('No order selected');
        return;
      }

      const res = await updateOrder(editData._id, { status: values.status });
      console.log(res);
      message.success('Order status updated successfully');
      tableQuery.refetch();
      form.resetFields();
      onCancel();
    } catch (err) {
      console.log(err);
      message.error(err?.response?.data?.message || 'failed to update status');
    }
  };

  useEffect(() => {
    if (editData) {
      form.setFieldsValue({
        user: editData?.userId?.firstName
          ? `${editData.userId.firstName} ${editData.userId.lastName || ''}`.trim()
          : '',
        amount: editData?.amount,
        paymentType: editData?.mode,
        status: editData?.status,
      });
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  return (
    <Modal
      open={Boolean(editData)}
      title="Update order status"
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        {/* User Field */}
        <Form.Item
          label="User"
          name="user"
          rules={[{ required: true, message: 'Please enter a user ID' }]}
        >
          <Input placeholder="User" disabled={true} />
        </Form.Item>

        {/* Status Field */}
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select>
            <Option value="Pending">Pending</Option>
            <Option value="Processing">Processing</Option>
            <Option value="Complete">Complete</Option>
            <Option value="Cancelled">Cancelled</Option>
          </Select>
        </Form.Item>

        {/* Amount Field */}
        <Form.Item
          label="Amount"
          name="amount"
          rules={[
            { required: true, message: 'Please enter an amount' },
            {
              type: 'number',
              min: 0,
              message: 'Amount must be a positive number',
            },
          ]}
        >
          <InputNumber
            placeholder="Enter amount"
            style={{ width: '100%' }}
            disabled={true}
          />
        </Form.Item>

        {/* Payment Type Field */}
        <Form.Item
          label="Payment Type"
          name="paymentType"
          rules={[{ required: true, message: 'Please enter a payment type' }]}
        >
          <Input placeholder="Enter payment type" disabled={true} />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderFormModal;
