import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, message, Upload } from 'antd';
import { updateHomeBanner } from '../../../../../apis/admin/editPage';
import { useForm } from 'antd/es/form/Form';
import { PlusOutlined } from '@ant-design/icons';
import { resolveAssetUrl } from '../../../../../utils/assetUrl';
import { appendCompressedImage } from '../../../../../utils/imageCompression';

const BannerForm = ({ data, query }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = useForm();
  const [fileList, setFileList] = useState([]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleImageUpload = ({ file }) => {
    if (file.status === 'done' || file.status === 'removed') {
      setFileList((prevList) => prevList.filter((f) => f.uid !== file.uid));
    } else if (file.status === 'error') {
      console.error('Image upload failed');
    }
    return false;
  };

  const handleRemoveImage = () => {
    setFileList([]);
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        titleEnglish: data?.home?.banner?.title?.en,
        titleArabic: data?.home?.banner?.title?.ar,
        titleFrench: data?.home?.banner?.title?.fr,
        titleRussian: data?.home?.banner?.title?.ru,

        subTitleEnglish: data?.home?.banner?.subtitle?.en,
        subTitleArabic: data?.home?.banner?.subtitle?.ar,
        subTitleFrench: data?.home?.banner?.subtitle?.fr,
        subTitleRussian: data?.home?.banner?.subtitle?.ru,

        buttonTextEnglish: data?.home?.banner?.buttonText?.en,
        buttonTextArabic: data?.home?.banner?.buttonText?.ar,
        buttonTextFrench: data?.home?.banner?.buttonText?.fr,
        buttonTextRussian: data?.home?.banner?.buttonText?.ru,
      });
    }
    setFileList([
      {
        uid: '-1',
        name: data?.home?.banner?.image,
        status: 'done',
        url: resolveAssetUrl(data?.home?.banner?.image),
      },
    ]);
  }, [data]);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key !== 'image') {
          formData.append(key, values[key]);
        }
      });
      await appendCompressedImage(
        formData,
        'image',
        values?.image?.fileList?.[0]
      );
      const res = await updateHomeBanner(formData);

      query.refetch();
      message.success('Home banner updated successfully');
    } catch (err) {
      console.error(err);
      message.error('Something went wrong');
    }
    setIsModalVisible(false);
  };

  return (
    <div className="flex justify-end mb-2 items-center">
      <Button type="primary" onClick={showModal}>
        Edit
      </Button>
      <Modal
        title="Create Content"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg"
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4"
          form={form}
        >
          {/* *************************** Title **************************** */}

          <Form.Item
            label="Title in English"
            name="titleEnglish"
            rules={[
              { required: true, message: 'Please enter the title in English' },
            ]}
          >
            <Input placeholder="Enter title in English" />
          </Form.Item>

          <Form.Item label="Title in Arabic" name="titleArabic">
            <Input placeholder="Enter title in Arabic" dir="rtl" />
          </Form.Item>

          <Form.Item label="Title in French" name="titleFrench">
            <Input placeholder="Enter title in French" />
          </Form.Item>

          <Form.Item label="Title in Russian" name="titleRussian">
            <Input placeholder="Enter title in Russian" />
          </Form.Item>

          {/* *************************** Subtitle **************************** */}

          <Form.Item
            label="Subtitle in English"
            name="subTitleEnglish"
            rules={[
              {
                required: true,
                message: 'Please enter the subtitle in English',
              },
            ]}
          >
            <Input placeholder="Enter subtitle in English" />
          </Form.Item>

          <Form.Item label="Subtitle in Arabic" name="subTitleArabic">
            <Input placeholder="Enter subtitle in Arabic" dir="rtl" />
          </Form.Item>

          <Form.Item label="Subtitle in French" name="subTitleFrench">
            <Input placeholder="Enter subtitle in French" />
          </Form.Item>

          <Form.Item label="Subtitle in Russian" name="subTitleRussian">
            <Input placeholder="Enter subtitle in Russian" />
          </Form.Item>

          {/* *************************** Button text **************************** */}

          <Form.Item
            label="Button Text in English"
            name="buttonTextEnglish"
            rules={[
              {
                required: true,
                message: 'Please enter button text in English',
              },
            ]}
          >
            <Input placeholder="Enter button text in English" />
          </Form.Item>

          <Form.Item label="Button Text in Arabic" name="buttonTextArabic">
            <Input placeholder="Enter button text in Arabic" dir="rtl" />
          </Form.Item>

          <Form.Item label="Button Text in French" name="buttonTextFrench">
            <Input placeholder="Enter button text in French" />
          </Form.Item>

          <Form.Item label="Button Text in Russian" name="buttonTextRussian">
            <Input placeholder="Enter button text in Russian" />
          </Form.Item>

          <Form.Item label="Category Image" name="image" valuePropName="file">
            <Upload
              customRequest={handleImageUpload}
              listType="picture-card"
              fileList={fileList} // Display the image preview
              showUploadList={{ showRemoveIcon: true }} // Display delete icon
              onRemove={handleRemoveImage} // Handle image removal
              maxCount={1} // Restricts to a single image
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const fileWithPreview = {
                    ...file,
                    url: reader.result,
                  };
                  setFileList([fileWithPreview]);
                };
                reader.readAsDataURL(file);
                return false; // Prevents automatic upload
              }}
            >
              {fileList.length === 0 && (
                <Button icon={<PlusOutlined />}>Upload Image</Button>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerForm;
