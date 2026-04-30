/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Upload,
  Table,
  InputNumber,
  Switch,
} from 'antd';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { createProduct, updateProduct } from '../../../apis/admin/product';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '../../../apis/admin/category';
import { AddButton, DeleteButton } from '../../UI/Buttons';
import { LANGUAGECODES, LANGUAGECODETONAME } from '../../../utils/staticData';
import { FormTabs } from '../../UI/Tabs';
import { getTranslatedFields } from '../../../utils/getTranslatedFields';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const { Option } = Select;

const ProductModalForm = ({
  onClose,
  selected,
  mode = 'add',
  refetchTable,
  isOpen = false,
}) => {
  const [form] = Form.useForm();

  const [utils, setUtils] = useState({
    activeTab: 0,
    isTabLoading: false,
    deletedImages: [],
  });
  const updateUtils = (newUtils) =>
    setUtils((prev) => ({ ...prev, ...newUtils }));

  const handleAutoTranslate = async (fieldName) => {
    try {
      const values = form.getFieldsValue();
      const translatedFields = await getTranslatedFields(values[fieldName]);
      form.setFieldsValue({
        [fieldName]: translatedFields,
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (selected) {
        const images =
          selected?.images?.map((list) => {
            return {
              uid: list,
              name: list,
              status: 'done',
              url: resolveAssetUrl(list),
            };
          }) || [];
        const image = [
          {
            uid: selected?.image,
            name: selected?.image,
            status: 'done',
            url: resolveAssetUrl(selected?.image),
          },
        ];
        form.setFieldsValue({
          productName: selected?.productName || {},
          productDescription: selected?.productDescription || {},
          benefits: selected?.benefits || {},
          uses: selected?.uses || {},
          price: selected?.price || '',
          discount: selected?.discount || '',
          category: selected?.category?._id || '',
          gender: selected?.gender || '',
          subCategory: selected?.subCategory || '',
          weight: selected?.weight,
          brand: selected?.brand,
          websitePrice: selected?.websitePrice || '',
          homePageBottomSection: selected?.homePageBottomSection || false,
          status: selected?.status,
          showOnHomepage: selected?.showOnHomepage || false,
          skus: selected?.skus || [],
          filters: selected?.filters || [],
          images,
          image,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          skus: [{ sku: null, quantity: null, price: null }],
          images: [],
          image: [],
        });
      }
      updateUtils({ activeTab: 0, isTabsLoading: false, deletedImages: [] });
    }
  }, [isOpen]);

  const tabs = useMemo(
    () => [
      {
        key: 0,
        label: 'Product Details',
        children: (
          <PrimaryDetails
            form={form}
            selected={selected}
            isOpen={isOpen}
            addDeletedImage={(image) =>
              updateUtils({ deletedImages: [...utils.deletedImages, image] })
            }
            handleAutoTranslate={handleAutoTranslate}
          />
        ),
      },
      {
        key: 1,
        label: 'Product Description',
        children: (
          <div>
            {/* Product Description */}
            {LANGUAGECODES.map((code) => (
              <Form.Item
                label={`Description (${LANGUAGECODETONAME[code]})`}
                key={code}
                name={['productDescription', code]}
                valuePropName="data"
                getValueFromEvent={(_, editor) => editor.getData()}
              >
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    language: code,
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      '|',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo',
                    ],
                  }}
                  onBlur={() => handleAutoTranslate('productDescription')}
                />
              </Form.Item>
            ))}
          </div>
        ),
      },
      {
        key: 2,
        label: 'Product Benefits',
        children: (
          <div>
            {/* Benefits */}
            {LANGUAGECODES.map((code) => (
              <Form.Item
                label={`Benefits (${LANGUAGECODETONAME[code]})`}
                key={code}
                name={['benefits', code]}
                valuePropName="data"
                getValueFromEvent={(_, editor) => editor.getData()}
              >
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    language: code,
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      '|',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo',
                    ],
                  }}
                  onBlur={() => handleAutoTranslate('benefits')}
                />
              </Form.Item>
            ))}
          </div>
        ),
      },
      {
        key: 3,
        label: 'Direction of Use',
        children: (
          <div>
            {/* Uses */}
            {LANGUAGECODES.map((code) => (
              <Form.Item
                label={`Uses (${LANGUAGECODETONAME[code]})`}
                key={code}
                name={['uses', code]}
                valuePropName="data"
                getValueFromEvent={(_, editor) => editor.getData()}
              >
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    language: code,
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      '|',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'outdent',
                      'indent',
                      '|',
                      'blockQuote',
                      'insertTable',
                      '|',
                      'undo',
                      'redo',
                    ],
                  }}
                  onBlur={() => handleAutoTranslate('uses')}
                />
              </Form.Item>
            ))}
          </div>
        ),
      },
    ],
    [form, selected, isOpen]
  );

  const handleTranslateTab = async (tabIndex) => {
    try {
      const values = form.getFieldsValue();
      switch (tabIndex) {
        case 0:
          const translatedNames = await getTranslatedFields(values.productName);
          form.setFieldsValue({
            productName: translatedNames,
          });
          break;
        case 1:
          const translatedDescriptions = await getTranslatedFields(
            values.productDescription
          );
          form.setFieldsValue({
            productDescription: translatedDescriptions,
          });
          break;
        case 2:
          const translatedBenefits = await getTranslatedFields(values.benefits);
          form.setFieldsValue({
            benefits: translatedBenefits,
          });
          break;
        case 3:
          const translatedUses = await getTranslatedFields(values.uses);
          form.setFieldsValue({
            uses: translatedUses,
          });
          break;
        default:
          return;
      }
    } catch (error) {
      console.error('Translation error:', error);
      // message.error("Failed to translate fields");
    }
  };

  const handleFormSubmit = async () => {
    try {
      await form.validateFields();
      updateUtils({ isTabLoading: true });
      await handleTranslateTab(utils.activeTab);
      if (utils.activeTab < 3) {
        return updateUtils({
          activeTab: utils.activeTab + 1,
          isTabLoading: false,
        });
      }

      const product = form.getFieldsValue();

      const images = form.getFieldValue('images') || [];
      const image = form.getFieldValue('image') || [];
      if (product.skus?.length === 0) {
        message.error('Please add at least one SKU');
        return;
      }
      if (!image[0]) {
        message.error('Please upload a primary image');
        return;
      }
      const formData = new FormData();
      images.forEach((file) => {
        if (file.originFileObj) formData.append('images', file.originFileObj);
      });
      if (image[0]?.originFileObj)
        formData.append('image', image[0].originFileObj);

      console.log(product);

      Object.keys(product).forEach((key) => {
        if (['images', 'image'].includes(key)) return;
        if (product[key])
          formData.append(
            key,
            [
              'filters',
              'skus',
              'productName',
              'productDescription',
              'uses',
              'benefits',
            ].includes(key)
              ? JSON.stringify(product[key])
              : product[key]
          );
      });

      try {
        let res = null;
        if (selected) {
          console.log('selected', selected);
          formData.append(
            'deletedImages',
            JSON.stringify(utils.deletedImages || [])
          );
          res = await updateProduct(selected?._id, formData);
        } else {
          res = await createProduct(formData);
        }
        message.success('Product created successfully');
        refetchTable();
        onClose();
      } catch (err) {
        console.log(err);
        message.error(
          err.response?.data?.message || `Failed to ${mode} product`
        );
      } finally {
        updateUtils({ isTabLoading: false });
      }
    } catch (errorInfo) {
      console.log('Validation Failed:', errorInfo);
      updateUtils({ isTabLoading: false });
      return;
    }
  };

  return (
    <Modal
      title={`${mode === 'add' ? 'Add' : 'Edit'} Product`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={800}
      classNames={{ body: 'max-h-[80vh] overflow-y-auto pt-8' }}
    >
      <Form
        name="productForm"
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
      >
        <FormTabs
          items={tabs}
          isLoading={utils.isTabLoading}
          activeTab={utils.activeTab}
          updateUtils={updateUtils}
          onCancel={onClose}
          onSave={handleFormSubmit}
        />
      </Form>
    </Modal>
  );
};

export default ProductModalForm;

const PrimaryDetails = ({
  form,
  selected,
  isOpen,
  addDeletedImage,
  handleAutoTranslate,
}) => {
  const skus = Form.useWatch('skus', form);
  const filters = Form.useWatch('filters', form);
  const images = Form.useWatch('images', form);
  const image = Form.useWatch('image', form);

  const price = Form.useWatch('price', form);
  const websitePrice = Form.useWatch('websitePrice', form);

  const [dynamicData, setDynamicData] = useState({
    subCategoryOptions: [],
    filterOptions: [],
    filterOptionsMap: {},
    deletedImages: [],
    fileList: [],
    primaryImageList: [],
    isPreviewOpen: false,
    previewImage: '',
  });
  const updateDynamicData = (newData) =>
    setDynamicData((prev) => ({ ...prev, ...newData }));

  const categoryQuery = useQuery({
    queryKey: ['productCategory'],
    queryFn: getAllCategories,
    enabled: false,
  });

  const filtersQuery = useQuery({
    queryKey: ['all-filters-for-product'],
    queryFn: async () => {
      const { getAllFilters } = await import('../../../apis/admin/filter');
      const res = await getAllFilters({ pageSize: 1000 });
      return res;
    },
    enabled: false,
  });

  const categoryChange = (value, reset = false) => {
    if (reset) {
      form.resetFields(['subCategory', 'filters']);
    }
    const foundCategory = categoryQuery.data?.data.find(
      (list) => list?._id == value
    );
    const categoryFilters = foundCategory?.filters?.map((f) => f.name) || [];

    // Build filter options map with actual filter options
    const filterOptionsMap = {};
    categoryFilters.forEach((filterName) => {
      const filterData = filtersQuery.data?.data?.find(
        (f) => f.filterName === filterName
      );
      if (filterData) {
        filterOptionsMap[filterName] = filterData.options || [];
      }
    });

    updateDynamicData({
      subCategoryOptions:
        foundCategory?.subcategories?.map((list) => ({
          value: list?._id,
          label: list.en,
        })) || [],
      filterOptions:
        foundCategory?.filters?.map((list) => ({
          value: list.name,
          label: list.name,
        })) || [],
      filterOptionsMap,
    });
  };

  const handleDeleteSKU = (index) => {
    const skus = form.getFieldValue('skus') || [];
    skus.splice(index, 1);
    form.setFieldsValue({ skus });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handlePreview = async (file) => {
    updateUtils({
      isPreviewOpen: true,
      previewImage: file.url || file.preview,
      previewTitle:
        file.name || file?.url?.substring(file.url.lastIndexOf('/') + 1),
    });
  };

  const handleDeleteImage = (value, field = 'images') => {
    console.log('handleDeleteImage', value, field);
    addDeletedImage(value.uid);
    if (field === 'image') {
      form.setFieldsValue({ image: [] });
    } else {
      const prevFileList = form.getFieldValue('images') || [];
      form.setFieldsValue({
        images: prevFileList.filter((file) => file.uid !== value.uid),
      });
    }
  };

  useEffect(() => {
    // setting subCategory list according to comming category
    if (isOpen) {
      categoryQuery.refetch();
      filtersQuery.refetch().then(() => {
        categoryChange(selected?.category?._id);
      });
      updateDynamicData({
        fileList:
          selected?.images?.map((list) => {
            return {
              uid: list,
              name: list,
              status: 'done',
              url: resolveAssetUrl(list),
            };
          }) || [],
        primaryImageList: [
          {
            uid: selected?.image,
            name: selected?.image,
            status: 'done',
            url: resolveAssetUrl(selected?.image),
          },
        ],
        subCategoryOptions: [],
        filterOptions: [],
        filterOptionsMap: {},
        isPreviewOpen: false,
        previewImage: '',
      });
    }
  }, [selected, isOpen]);

  useEffect(() => {
    if (price && websitePrice) {
      const numPrice = Number(price);
      const numWebsitePrice = Number(websitePrice);

      // Ensure websitePrice is lower than price
      if (numWebsitePrice >= numPrice) {
        form.setFieldsValue({ discount: 0 });
        return;
      }

      // Calculate discount percentage
      const discountValue = ((numPrice - numWebsitePrice) / numPrice) * 100;
      form.setFieldsValue({
        discount: Math.round(discountValue),
      });
    } else if (price && !websitePrice) {
      // Reset discount if websitePrice is cleared
      form.setFieldsValue({ discount: 0 });
    }
  }, [price, websitePrice, form]);

  useEffect(() => {
    if (!Array.isArray(skus) || skus.length === 0) return;

    const totalStock = skus.reduce(
      (sum, sku) => sum + Number(sku?.quantity || 0),
      0
    );
    const currentStatus = form.getFieldValue('status');

    if (totalStock <= 0 && currentStatus !== 'Out of stock') {
      form.setFieldValue('status', 'Out of stock');
      return;
    }

    if (
      totalStock > 0 &&
      (!currentStatus || currentStatus === 'Out of stock')
    ) {
      form.setFieldValue('status', 'Active');
    }
  }, [skus, form]);

  return (
    <div>
      {/* Product Name */}
      {LANGUAGECODES.map((code) => (
        <Form.Item
          label={`Product Name (${LANGUAGECODETONAME[code]})`}
          key={code}
          name={['productName', code]}
          rules={[
            {
              required: code === 'en',
              message: 'Please enter the product name',
            },
          ]}
        >
          <Input
            placeholder="Enter product name"
            dir={code === 'ar' ? 'rtl' : 'ltr'}
            allowClear
            onBlur={() => handleAutoTranslate('productName')}
          />
        </Form.Item>
      ))}

      {/* brand */}
      <Form.Item
        label="brand"
        name="brand"
        rules={[{ required: false, message: 'Please enter brand name' }]}
      >
        <Input type="text" placeholder="Enter brand name" />
      </Form.Item>

      {/* Price */}
      <Form.Item
        label="Price"
        name="price"
        rules={[{ required: false, message: 'Please enter the product price' }]}
      >
        <Input type="number" placeholder="Enter price" />
      </Form.Item>

      {/* Price */}
      <Form.Item
        label="Print To Show"
        name="websitePrice"
        rules={[
          { required: false, message: 'Please enter the price to show' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const price = getFieldValue('price');
              if (!value || !price) return Promise.resolve();
              if (Number(value) >= Number(price)) {
                return Promise.reject(
                  'Price to show must be lower than the original price'
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input type="number" placeholder="Enter price to show" />
      </Form.Item>

      {/* Discount */}
      <Form.Item
        label="Discount"
        name="discount"
        rules={[
          { required: false, message: 'Please enter the product discount' },
        ]}
      >
        <Input
          type="number"
          readOnly
          placeholder="Enter discount percentage"
          min={0}
        />
      </Form.Item>

      {/* Gender */}
      <Form.Item
        label="Gender"
        name="gender"
        rules={[{ required: false, message: 'Please select a category' }]}
      >
        <Select>
          <Option value={'Men'}>Men</Option>
          <Option value={'Women'}>Women</Option>
          <Option value={'Unisex'}>Unisex</Option>
        </Select>
      </Form.Item>

      {/* Category */}
      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: false, message: 'Please select a category' }]}
        getValueFromEvent={(value) => {
          categoryChange(value, true);
          return value;
        }}
      >
        <Select
          loading={categoryQuery.isFetching}
          options={categoryQuery.data?.data?.map((category) => ({
            label: category.name.en,
            value: category._id,
          }))}
        />
      </Form.Item>

      {/* Subcategory */}
      <Form.Item label="Subcategory" name="subCategory">
        <Select options={dynamicData.subCategoryOptions} />
      </Form.Item>

      <Form.Item name="filters" label="Filters">
        <Select
          placeholder="Select Filters"
          options={dynamicData.filterOptions}
          mode="multiple"
          showSearch
        />
      </Form.Item>

      <div className="flex items-end gap-2 justify-between mb-2">
        <p>SKUs</p>
        <AddButton
          title={filters?.length ? 'Add SKU' : 'Select filters to add SKU'}
          onClick={() => {
            const skus = form.getFieldValue('skus') || [];
            skus.push({ sku: null, quantity: null, price: null });
            form.setFieldsValue({ skus });
          }}
          disabled={!filters?.length}
        >
          Add SKU
        </AddButton>
      </div>

      <Form.Item name="skus" valuePropName="dataSource">
        <Table
          columns={[
            {
              title: 'SKU',
              dataIndex: 'sku',
              key: 'sku',
              render: (text, record, index) => (
                <Form.Item
                  name={['skus', index, 'sku']}
                  rules={[{ required: true, message: 'SKU is required' }]}
                  className="mb-0"
                >
                  <Input placeholder="Enter SKU" />
                </Form.Item>
              ),
            },
            ...(filters?.map((filter) => {
              const filterData = filtersQuery.data?.data?.find(
                (f) => f.filterName === filter
              );
              const isPrice = filter === 'Price';
              const options = isPrice
                ? (filterData?.options || []).map((opt) => ({
                    label: `${opt.from} - ${opt.to}`,
                    value: `${opt.from}-${opt.to}`,
                  }))
                : (filterData?.options || []).map((opt) => ({
                    label: opt,
                    value: opt,
                  }));

              return {
                title: `${filter} (Filter)`,
                dataIndex: filter,
                key: filter,
                render: (text, record, index) => (
                  <Form.Item
                    name={['skus', index, 'filters', filter]}
                    rules={[
                      { required: true, message: `Filter value is required` },
                    ]}
                    className="mb-0"
                  >
                    {options.length > 0 ? (
                      <Select
                        placeholder={`Select ${filter}`}
                        options={options}
                        showSearch
                      />
                    ) : (
                      <Input placeholder={`Enter ${filter}`} />
                    )}
                  </Form.Item>
                ),
              };
            }) || []),
            {
              title: 'Available Quantity',
              dataIndex: 'quantity',
              key: 'quantity',
              render: (text, record, index) => (
                <Form.Item
                  name={['skus', index, 'quantity']}
                  rules={[{ required: true, message: 'Quantity is required' }]}
                  className="mb-0"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="Enter Quantity"
                  />
                </Form.Item>
              ),
            },

            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              align: 'center',
              width: 80,
              render: (_, record, index) => (
                <DeleteButton
                  disabled={skus.length === 1}
                  onClick={() => handleDeleteSKU(index)}
                />
              ),
            },
          ]}
          scroll={{ x: 600 + (filters?.length || 0) * 150 }}
          pagination={false}
        />
      </Form.Item>

      {/* Active Switch */}
      <Form.Item label="Status" name="status" className="w-full mt-6">
        <Select
          className="w-full"
          placeholder="Select a status"
          optionFilterProp="label"
          options={[
            {
              value: 'Active',
              label: 'Active',
            },
            {
              value: 'Inactive',
              label: 'Inactive',
            },
            {
              value: 'Out of stock',
              label: 'Out of stock',
            },
          ]}
        />
      </Form.Item>

      {/* Weight */}
      <Form.Item
        label="Weight (In KG)"
        name="weight"
        rules={[{ required: false, message: 'Please enter the weight' }]}
        extra="Weight can only be, eg: 1, 1.5, 2, 2.5..., Min : 0.5 and max : 45"
      >
        <Input
          type="number"
          placeholder="Enter product weight"
          min={0.5}
          max={45}
          step={0.5}
        />
      </Form.Item>

      <Form.Item
        label="Upload Primary Image"
        name="image"
        rules={[
          {
            required: true,
            message: 'Please upload a primary image',
          },
        ]}
        valuePropName="fileList"
      >
        <Upload
          listType="picture-card"
          // fileList={dynamicData.primaryImageList}
          onPreview={handlePreview}
          onChange={({ fileList }) => {
            form.setFieldsValue({ image: fileList });
            // updateDynamicData({ primaryImageList: fileList });
          }}
          beforeUpload={beforeUpload}
          onRemove={(val) => handleDeleteImage(val, 'image')}
        >
          {image?.length < 1 && (
            <button type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          )}
        </Upload>
      </Form.Item>
      <Form.Item
        label="Upload Product Images (Gallery)"
        name="images"
        rules={[
          {
            required: false,
            message: 'Please upload product images',
          },
        ]}
        valuePropName="fileList"
      >
        <Upload
          listType="picture-card"
          // fileList={dynamicData.fileList}
          onPreview={handlePreview}
          onChange={({ fileList }) => {
            form.setFieldsValue({ images: fileList });
            // updateDynamicData({ fileList });
          }}
          beforeUpload={beforeUpload}
          multiple
          onRemove={(val) => handleDeleteImage(val, 'images')}
        >
          {images?.length >= 5 ? null : (
            <button type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          )}
        </Upload>
      </Form.Item>

      <Form.Item
        label="Show Product on Homepage"
        name="showOnHomepage"
        valuePropName="checked"
        layout="horizontal"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        label="Show Product on Home Page Bottom Section"
        name="homePageBottomSection"
        valuePropName="checked"
        layout="horizontal"
      >
        <Switch />
      </Form.Item>

      <Modal
        open={dynamicData.isPreviewOpen}
        title={dynamicData.previewTitle}
        footer={null}
        onCancel={() => updateDynamicData({ isPreviewOpen: false })}
      >
        <img
          alt="preview"
          style={{ width: '100%' }}
          src={dynamicData.previewImage}
        />
      </Modal>
    </div>
  );
};
