/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Table, Button, Empty } from 'antd';
import { FaEye, FaExchangeAlt } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../apis/user/order';
import { useState } from 'react';
import ParticularOrder from './ParticularOrder';
import { LuSearch } from 'react-icons/lu';
import Loading from '../../Admin/UI/Loading';
import { useTranslationContext } from '../../context/TranslationContext';

const RETURNABLE_STATUSES = ['delivered', 'completed'];

const MyOrders = () => {
  const {
    content: { profile, common },
  } = useTranslationContext();
  const [activeOrder, setActiveOrder] = useState(null);
  const [searchOrder, setSearchOrder] = useState(null);

  const Orders = useQuery({
    queryKey: ['orders'],
    queryFn: () => getOrders({ orderId: searchOrder }),
  });

  const columns = [
    {
      title: profile.orderId,
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: profile.date,
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 100,
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: profile.status,
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
    },
    {
      title: profile.paymentMethod,
      dataIndex: 'mode',
      key: 'mode',
      align: 'center',
    },
    {
      title: common.price,
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      width: 120,
    },
    {
      title: profile.quantity,
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'center',
      width: 100,
    },
    {
      title: profile.action,
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => setActiveOrder(record)}
          icon={<FaEye />}
          title="View Order"
        />
      ),
    },
  ];

  return activeOrder ? (
    <ParticularOrder
      activeOrder={activeOrder}
      setActiveOrder={setActiveOrder}
    />
  ) : (
    <div className="container p-4 mx-auto">
      <div className="flex sm:items-center sm:flex-row flex-col gap-2 justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-4">{profile.myOrders}</h2>
          <hr className="w-32 h-[2px] mb-6 bg-black" />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            Orders.refetch();
          }}
          className="flex items-center"
        >
          <input
            type="text"
            className="border p-2 border-black mb-0 flex-1"
            value={searchOrder || ''}
            onChange={(e) => setSearchOrder(e.target.value)}
          />
          <button
            type="submit"
            className="h-[41px] w-10 mb-[9px] border-l-0 border border-black flex items-center justify-center"
          >
            <LuSearch />
          </button>
        </form>
      </div>

      {Orders.isLoading ? (
        <Loading />
      ) : Orders.data?.data?.length === 0 ? (
        <Empty />
      ) : (
        <Table
          dataSource={Orders.data?.data}
          columns={columns}
          rowKey="orderId"
          bordered
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
          loading={Orders.isFetching}
        />
      )}
    </div>
  );
};

export default MyOrders;