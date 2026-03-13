import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Popconfirm, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteCoupon } from '../../../apis/admin/coupon';

const CouponTable = ({ data, tableQuery }) => {
  // Sample data
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const dataFiltering = data.filter(
      (item) =>
        item.couponName.toLowerCase().includes(value) ||
        item.couponCode.toLowerCase().includes(value)
    );

    setFilteredData(dataFiltering);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteCoupon(id);
      message.success('Coupon deleted successfuly');
      tableQuery.refetch();
    } catch (err) {
      console.log(err);
      message.error(err?.response?.data?.message || 'Failed to delete coupon');
    }
  };

  useEffect(() => {
    setFilteredData(data || []);
  }, [data]);

  // Column configuration
  const columns = [
    {
      title: 'Coupon Name',
      dataIndex: 'couponName',
      key: 'couponName',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Coupon Code',
      dataIndex: 'couponCode',
      key: 'couponCode',
      render: (text) => (
        <Tag color="blue" className="px-3 text-sm">
          {text}
        </Tag>
      ),
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (text) => (
        <span className="text-gray-500">{new Date(text).toDateString()}</span>
      ),
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount',
      key: 'discount',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this record?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            className="transition-all transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Search Bar */}
      <Input
        placeholder="Search by Coupon Name or Coupon Code"
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4"
        allowClear
      />

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        bordered
        pagination={{ pageSize: 10 }}
        rowClassName="hover:bg-gray-50"
        className="rounded-lg"
      />
    </div>
  );
};

export default CouponTable;
