import {
  LuBox,
  LuCreditCard,
  LuSearch,
  LuShoppingCart,
  LuUser,
} from 'react-icons/lu';
import { Link } from 'react-router-dom';
import LineChart from '../UI/charts/LineChart';
import PageTitle from '../UI/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../../apis/admin/dashboard';
import { useEffect, useState } from 'react';
import { Button, DatePicker, Select, Space } from 'antd';
import { RefreshButton } from '../UI/Buttons';
import Loading from '../UI/Loading';
import dayjs from 'dayjs';
import BarChart from '../UI/charts/BarChart';
import PieChart from '../UI/charts/PieChart';

const revenueData = [
  { month: 'Jan', revenue: 1000 },
  { month: 'Feb', revenue: 1500 },
  { month: 'Mar', revenue: 1200 },
  { month: 'Apr', revenue: 1800 },
  { month: 'May', revenue: 2000 },
  { month: 'Jun', revenue: 2400 },
];

const userData = [
  { month: 'Jan', users: 100 },
  { month: 'Feb', users: 150 },
  { month: 'Mar', users: 200 },
  { month: 'Apr', users: 180 },
  { month: 'May', users: 220 },
  { month: 'Jun', users: 250 },
];

const productData = [
  { category: 'Electronics', count: 120 },
  { category: 'Clothing', count: 80 },
  { category: 'Books', count: 60 },
  { category: 'Home', count: 40 },
  { category: 'Sports', count: 30 },
];

const chartColors = [
  'rgba(213, 240, 175)',
  'rgba(188, 141, 167)',
  'rgba(186, 237, 248)',
  'rgba(250, 230, 117)',
];

export default function Dashboard() {
  const [utils, setUtils] = useState({
    monthRange: [dayjs().subtract(5, 'months').startOf('month'), dayjs()],
    monthRangeToShow: [dayjs().subtract(5, 'months').startOf('month'), dayjs()],
  });
  const updateUtils = (newUtils) =>
    setUtils((prev) => ({ ...prev, ...newUtils }));

  const Dashboard = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await getDashboardData({ monthRange: utils.monthRange });
      updateUtils({ monthRangeToShow: utils.monthRange });
      return res;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    Dashboard.refetch();
  }, []);

  console.log(Dashboard.data);

  console.log(utils);

  return (
    <div className="container min-h-screen mx-auto">
      <PageTitle
        title="Dashboard"
        extra={
          <div className="flex items-end gap-2">
            <Space.Compact>
              <DatePicker.RangePicker
                format="MMM YYYY"
                size="small"
                picker="month"
                value={utils.monthRange}
                onChange={(value) => updateUtils({ monthRange: value })}
                disabled={Dashboard.isFetching}
              />
              <Button
                className="mt-0"
                type="primary"
                disabled={Dashboard.isFetching}
                onClick={Dashboard.refetch}
              >
                Apply
              </Button>
            </Space.Compact>
            <RefreshButton
              onClick={Dashboard.refetch}
              isLoading={Dashboard.isFetching}
            />
          </div>
        }
      />
      {Dashboard.isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-2 mb-4">
            <Card
              title="Total Revenue"
              icon={<LuCreditCard size={24} color="rgb(143, 221, 33)" />}
              value={Dashboard.data?.totalRevenue || 0}
              suffix="AED"
              bgColor="rgba(213, 240, 175, 0.5)"
              moreInfoTo={'/admin/payment'}
            />
            <Card
              title="Total Orders"
              icon={<LuShoppingCart size={24} color="rgb(137, 54, 99)" />}
              value={Dashboard.data?.totalOrders || 0}
              moreInfoTo={'/admin/orders'}
              bgColor="rgba(188, 141, 167, 0.5)"
            />
            <Card
              title="Total Products"
              icon={<LuBox size={24} color="rgb(1, 151, 246)" />}
              value={Dashboard.data?.totalProducts || 0}
              moreInfoTo={'/admin/products'}
              color="rgb(104, 197, 219)"
              bgColor="rgba(186, 237, 248, 0.5)"
            />
            <Card
              title="Total Users"
              icon={<LuUser size={24} color="rgb(246, 170, 28)" />}
              value={Dashboard.data?.totalUsers || 0}
              moreInfoTo={'/admin/users'}
              bgColor="rgba(250, 230, 117, 0.5)"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg shadow-md card">
              <LineChart
                title="Revenue"
                subTitle={utils.monthRangeToShow
                  .map((item) => dayjs(item).format('MMM YYYY'))
                  .join(' - ')}
                labels={
                  Dashboard.data?.revenueByMonth?.map((item) =>
                    dayjs(item.month).format('MMM YYYY')
                  ) || []
                }
                values={[
                  {
                    name: 'Revenue',
                    data: Dashboard.data?.revenueByMonth?.map(
                      (item) => item.value
                    ),
                  },
                ]}
                area
                chartColors={chartColors}
              />
            </div>

            <div className="p-4 pb-8 border rounded-lg shadow-md card">
              <BarChart
                title="Users"
                subTitle={utils.monthRangeToShow
                  .map((item) => dayjs(item).format('MMM YYYY'))
                  .join(' - ')}
                labels={
                  Dashboard.data?.usersByMonth?.map((item) =>
                    dayjs(item.month).format('MMM YYYY')
                  ) || []
                }
                values={[
                  {
                    name: 'Users',
                    data: Dashboard.data?.usersByMonth?.map(
                      (item) => item.value
                    ),
                  },
                ]}
                chartColors={[chartColors[3]]}
              />
            </div>

            <div className="p-4 pb-8 border rounded-lg shadow-md card">
              <LineChart
                title="Orders"
                subTitle={utils.monthRangeToShow
                  .map((item) => dayjs(item).format('MMM YYYY'))
                  .join(' - ')}
                labels={
                  Dashboard.data?.ordersByMonth?.map((item) =>
                    dayjs(item.month).format('MMM YYYY')
                  ) || []
                }
                values={[
                  {
                    name: 'Orders',
                    data: Dashboard.data?.ordersByMonth?.map(
                      (item) => item.value
                    ),
                  },
                ]}
                markerSize={5}
                chartColors={[chartColors[2]]}
              />
            </div>

            <div className="p-4 pb-8 border rounded-lg shadow-md card">
              <PieChart
                title="Orders by status"
                labels={Dashboard.data?.orderByStatus?.map(
                  (item) => item.status
                )}
                values={Dashboard.data?.orderByStatus?.map(
                  (item) => item.count
                )}
                markerSize={5}
                chartColors={[
                  chartColors[3],
                  chartColors[2],
                  chartColors[0],
                  chartColors[1],
                ]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Card = ({ title, icon, value, suffix, moreInfoTo, bgColor = '#aaa' }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md card relative overflow-hidden">
      <div
        className="rotate-45 h-full w-[200%] z-[-1] absolute top-0"
        style={{ background: bgColor }}
      ></div>

      <div className="flex items-center gap-4 justify-between">
        <h3>{title}</h3>
        {icon}
      </div>
      <p className="flex items-end gap-2">
        <strong className="text-2xl font-bold">{value}</strong>
        <span className="text-sm text-gray-500">{suffix}</span>
      </p>
      {moreInfoTo && (
        <div className="flex mt-2">
          <Link to={moreInfoTo} className="text-sm text-blue-500">
            More Info
          </Link>
        </div>
      )}
    </div>
  );
};
