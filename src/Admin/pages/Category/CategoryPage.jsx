import { useMemo, useState } from 'react';
import CategoryModal from './CategoryModal';
import { useQuery } from '@tanstack/react-query';
import {
  deleteCategory,
  getAllCategories,
  reorderCategories,
} from '../../../apis/admin/category';
import { Button, Image, message, Space, Table } from 'antd';
import PageTitle from '../../UI/PageTitle';
import { DeleteButton, EditButton, RefreshButton } from '../../UI/Buttons';
import SearchInTable from '../../UI/SearchInTable';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { confirmDelete } from '../../UI/Modals';
import { tablePageSizes } from '../../../utils/staticData';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';

// ─── Drag Handle ─────────────────────────────────────────────────────────────

const RowDragHandle = ({ rowKey }) => {
  const { listeners, attributes } = useSortable({ id: rowKey });
  return (
    <HolderOutlined
      {...listeners}
      {...attributes}
      style={{
        cursor: 'grab',
        color: '#999',
        fontSize: 16,
        touchAction: 'none',
      }}
    />
  );
};

// ─── Sortable Row ─────────────────────────────────────────────────────────────

const SortableRow = ({ id, children, ...props }) => {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={{
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? '#fafafa' : undefined,
      }}
    >
      {children}
    </tr>
  );
};

const tableComponents = {
  body: {
    row: ({ children, ...props }) => (
      <SortableRow id={props['data-row-key']} {...props}>
        {children}
      </SortableRow>
    ),
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CategoryPage = () => {
  const { screenSizeFactor } = useGlobalContext();
  

  const [utils, setUtils] = useState({
    isModalVisible: false,
    currentEditCategory: null,
  });
  const updateUtils = (newUtils) =>
    setUtils((prev) => ({ ...prev, ...newUtils }));

  const [search, setSearch] = useState({ searchKey: null, searchValue: null });
  const [pagination, setPagination] = useState({
    pageSize: 10,
    currentPage: 1,
    total: 0,
  });
  const updatePagination = (newPagination) =>
    setPagination((prev) => ({ ...prev, ...newPagination }));

  // Local display order — initialised from server data, updated on drag
  const [orderedIds, setOrderedIds] = useState(null);

  const Categories = useQuery({
    queryKey: [
      'categories',
      search,
      pagination.pageSize,
      pagination.currentPage,
    ],
    queryFn: async () => {
      const res = await getAllCategories({ ...search, ...pagination });
      updatePagination({ total: res?.total || 0 });
      return res;
    },
    // When fresh server data arrives reset local order so it reflects DB order
    onSuccess: (res) => {
      const ids = (res?.data || []).map((c) => c._id);
      setOrderedIds(ids);
    },
  });

  // Map of _id -> category object for quick lookup
  const categoryMap = useMemo(() => {
    const arr = Categories.data?.data || [];
    return Object.fromEntries(arr.map((c) => [c._id, c]));
  }, [Categories.data]);

  // Apply local drag order over the server data
  const sortedData = useMemo(() => {
    if (!orderedIds) return Categories.data?.data || [];
    return orderedIds.map((id) => categoryMap[id]).filter(Boolean);
  }, [orderedIds, categoryMap]);

  // ── DnD ──────────────────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async ({ active, over }) => {
    if (!orderedIds) return; // 🔥 fix
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(active.id);
    const newIndex = orderedIds.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newIds = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(newIds);

    try {
      await reorderCategories(newIds);
    } catch (err) {
      message.error('Failed to save new order.');
      setOrderedIds(orderedIds);
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────────

  const handleEdit = (record) =>
    updateUtils({ isModalVisible: true, currentEditCategory: record });

  const handleDelete = async (record) => {
    try {
      await deleteCategory(record._id);
      Categories.refetch();
      message.success('Category deleted successfully');
    } catch (err) {
      message.error(err.response?.data.message || 'Failed to delete category');
    }
  };

  const handleSubmit = () => updateUtils({ isModalVisible: false });

  const handleCloseModal = () =>
    updateUtils({ isModalVisible: false, currentEditCategory: null });

  // ── Columns ───────────────────────────────────────────────────────────────────

  const columns = useMemo(
    () => [
      {
        title: '',
        key: 'sort',
        width: 40,
        align: 'center',
        render: (_, record) => <RowDragHandle rowKey={record._id} />,
      },
      {
        title: 'S/N',
        key: 'index',
        width: 80,
        render: (_, __, index) =>
          (pagination.currentPage - 1) * pagination.pageSize + index + 1,
      },
      {
        title: 'Name',
        dataIndex: ['name', 'en'],
        key: 'name',
      },
      {
        title: 'Subcategories',
        dataIndex: 'subcategories',
        key: 'subcategories',
        render: (subcategories) => (
          <Space wrap>
            {subcategories.map((subcategory, index) => (
              <span
                className="border border-black text-black p-1 rounded"
                key={index}
              >
                {subcategory.en}
              </span>
            ))}
          </Space>
        ),
      },
      {
        title: 'Image',
        dataIndex: 'image',
        key: 'image',
        align: 'center',
        render: (image) => (
          <Image
            src={`${import.meta.env.VITE_IMAGE_URL}${image}`}
            alt="category"
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
          />
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        align: 'center',
        fixed: screenSizeFactor > 3 && 'right',
        width: 100,
        render: (_, record) => (
          <div className="flex items-center gap-2 justify-center">
            <EditButton onClick={() => handleEdit(record)} />
            <DeleteButton
              onClick={() =>
                confirmDelete({
                  title: 'Delete the Category',
                  content: 'Are you sure to delete this category?',
                  onOk: () => handleDelete(record),
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
      <CategoryModal
        isVisible={utils.isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        tableQuery={Categories}
        currentEditCategory={utils.currentEditCategory}
        setCurrentEditCategory={(bool) =>
          updateUtils({ isModalVisible: bool, currentEditCategory: null })
        }
      />

      <PageTitle title="Category Management" />

      <div className="p-4 bg-white shadow-lg rounded-lg overflow-x-auto">
        <div className="flex sm:flex-row flex-col sm:items-center justify-between mb-4">
          <SearchInTable
            searchBy={[
              { label: 'Category Name', value: 'name' },
              { label: 'Subcategory Name', value: 'subcategoryName' },
            ]}
            onSearch={(value, key) => {
              setSearch({ searchKey: key, searchValue: value });
              updatePagination({ currentPage: 1 });
            }}
            onClear={() => {
              setSearch({ searchKey: null, searchValue: null });
              updatePagination({ currentPage: 1 });
            }}
            isLoading={Categories.isFetching}
            className="sm:order-1 order-2"
          />
          <div className="flex items-center gap-2 sm:order-2 order-1 ms-auto">
            <RefreshButton
              onClick={Categories.refetch}
              isLoading={Categories.isFetching}
            />
            <Button
              onClick={() =>
                updateUtils({ isModalVisible: true, currentEditCategory: null })
              }
              type="primary"
            >
              Add Category
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedData.map((c) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              columns={columns}
              dataSource={sortedData}
              loading={Categories.isLoading}
              bordered
              rowKey="_id"
              scroll={{ x: 600 }}
              components={tableComponents}
              pagination={{
                current: pagination.currentPage,
                total: pagination.total,
                pageSize: pagination.pageSize,
                showSizeChanger: true,
                pageSizeOptions: tablePageSizes,
                onChange: (page, pageSize) =>
                  updatePagination({ currentPage: page, pageSize }),
              }}
            />
          </SortableContext>
        </DndContext>
      </div>
    </>
  );
};

export default CategoryPage;
