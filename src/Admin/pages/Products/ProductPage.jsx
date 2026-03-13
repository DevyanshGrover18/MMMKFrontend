import { useMemo, useState } from 'react';
import ProductModalForm from './ProductModalForm';
import { Button, message, Popconfirm, Select, Space, Table } from 'antd';
import { deleteProduct, getAllProducts } from '../../../apis/admin/product';
import { useQuery } from '@tanstack/react-query';
import PageTitle from '../../UI/PageTitle';
import SearchInTable from '../../UI/SearchInTable';
import { DeleteButton, EditButton, RefreshButton } from '../../UI/Buttons';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { confirmDelete } from '../../UI/Modals';
import { tablePageSizes } from '../../../utils/staticData';
import { getAllCategories } from '../../../apis/admin/category';

export default function AdminProductPage() {
  const { screenSizeFactor } = useGlobalContext();
  const [utils, setUtils] = useState({
    isModalVisible: false,
    currentEditProduct: null,
  });
  const updateUtils = (newUtils) =>
    setUtils((prev) => ({ ...prev, ...newUtils }));

  const [search, setSearch] = useState({
    searchKey: null,
    searchValue: null,
    category: null,
  });
  const updateSearch = (newSearch) =>
    setSearch((prev) => ({ ...prev, ...newSearch }));
  const [pagination, setPagination] = useState({
    pageSize: 10,
    currentPage: 1,
    total: 0,
  });
  const updatePagination = (newPagination) =>
    setPagination((prev) => ({ ...prev, ...newPagination }));

  const Products = useQuery({
    queryKey: ['products', search, pagination.pageSize, pagination.currentPage],
    queryFn: async () => {
      const res = await getAllProducts({ ...search, ...pagination });
      updatePagination({
        total: res?.total || 0,
      });
      return res;
    },
  });

  const categories = useQuery({
    queryKey: ['getAllCategories'],
    queryFn: getAllCategories,
  });

  const handleEdit = (record) => {
    updateUtils({
      isModalVisible: true,
      currentEditProduct: record,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted successfully');
      Products.refetch();
    } catch (err) {
      console.log(err);
      message.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'S/N',
        dataIndex: 'key',
        render: (text, record, index) =>
          (pagination.currentPage - 1) * pagination.pageSize + index + 1,
        width: 100,
      },
      {
        title: 'Product Name',
        dataIndex: 'productName',
        // render: (text, record) => `${record._id} ${record?.productName?.en}`,
        render: (text, record) => text?.en,
        width: 150,
      },
      {
        title: 'Category Name',
        dataIndex: 'categoryName',
        render: (text, record) => record?.category?.name?.en,
        width: 150,
      },
      {
        title: 'Sub Category Name',
        dataIndex: 'subCategoryName',
        render: (text, record) =>
          record?.category?.subcategories?.find(
            (list) => list._id == record?.subCategory
          )?.en,
        width: 150,
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        width: 100,
        align: 'center',
        render: (quantity) => quantity || 0,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 120,
        align: 'center',
      },
      {
        title: 'Action',
        align: 'center',
        key: 'action',
        fixed: screenSizeFactor > 3 && 'right',
        width: 100,
        render: (_, record) => (
          <div className="flex items-center gap-2 justify-center">
            <EditButton onClick={() => handleEdit(record)} />
            <DeleteButton
              onClick={() =>
                confirmDelete({
                  title: 'Delete the Product',
                  content: 'Are you sure to delete this product?',
                  onOk: () => handleDelete(record._id),
                })
              }
            />
          </div>
        ),
      },
    ],
    [pagination, screenSizeFactor]
  );

  return (
    <>
      <ProductModalForm
        isOpen={utils.isModalVisible}
        onClose={() =>
          updateUtils({ isModalVisible: false, currentEditProduct: null })
        }
        selected={utils.currentEditProduct}
        refetchTable={Products.refetch}
        mode={utils.currentEditProduct ? 'edit' : 'add'}
      />
      <PageTitle title="Product Management" />
      <div className="p-4 bg-white shadow-lg rounded-lg overflow-x-auto">
        <div className="flex sm:flex-row flex-col sm:items-center justify-between mb-4">
          <Space.Compact className="flex items-end">
            <Select
              className="w-[200px] mb-0 mt-0"
              popupClassName="min-w-[300px]"
              placeholder="Select Category"
              allowClear
              showSearch
              onChange={(value) => {
                updateSearch({ category: value });
                updatePagination({ currentPage: 1 });
              }}
              options={[
                {
                  label: 'Categories',
                  options: categories.data?.data?.map((item) => ({
                    label: item.name.en,
                    value: item._id,
                  })),
                },
              ]}
            />
            <SearchInTable
              searchBy={[
                { label: 'Product Name', value: 'productName' },
                { label: 'Subcategory Name', value: 'subcategoryName' },
              ]}
              onSearch={(value, key) => {
                updateSearch({ searchKey: key, searchValue: value });
                updatePagination({ currentPage: 1 });
              }}
              onClear={() => {
                updateSearch({ searchKey: null, searchValue: null });
                updatePagination({ currentPage: 1 });
              }}
              isLoading={Products.isFetching}
              className="sm:order-1 order-2"
            />
          </Space.Compact>
          <div className="flex items-center gap-2 sm:order-2 order-1 ms-auto">
            <RefreshButton
              onClick={Products.refetch}
              isLoading={Products.isFetching}
            />
            <Button
              onClick={() =>
                updateUtils({ isModalVisible: true, currentEditProduct: null })
              }
              type="primary"
            >
              Add Product
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={Products.data?.data || []}
          loading={Products.isLoading}
          bordered
          rowKey="_id"
          scroll={{ x: 600 }}
          pagination={{
            current: pagination.currentPage,
            total: pagination.total,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: tablePageSizes,
            onChange: (page, pageSize) => {
              updatePagination({ currentPage: page, pageSize });
            },
          }}
        />
      </div>
    </>
  );
}
