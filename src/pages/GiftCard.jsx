import React, { useMemo, useState } from 'react';
import { Input, Modal, Select, Table, Tag, message, Tooltip } from 'antd';
import Banner from '../components/global/Banner';
import CategoryNavBar from '../components/global/CategoryNavBar';
import NewsLetter from '../components/global/NewsLetter';
import Section10 from '../components/home/Section10';
import { CommonButton } from '../components/global/UIButtons';
import { useTranslationContext } from '../context/TranslationContext';
import { convertPrice, formatPrice } from '../utils/currency';
import { useCurrency } from '../context/CurrencyContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import bg from '../assets/bg.png';
import { FiCopy, FiGift, FiPlus, FiSend } from 'react-icons/fi';
import { TbGiftCard } from 'react-icons/tb';
import { Country } from 'country-state-city';
import { getCreatedGiftCards, shareGiftCard } from '../apis/user/giftCard';

export const GiftCard = () => {
  const queryClient = useQueryClient();
  const {
    content: { common, giftCard },
  } = useTranslationContext();
  const { currency, rates } = useCurrency();
  const formatConvertedPrice = (amount) =>
    formatPrice(convertPrice(amount, currency, rates), currency);
  const [shareModal, setShareModal] = useState({
    open: false,
    giftCardId: null,
    recipientName: '',
    recipientEmail: '',
    recipientCountryCode: '+971',
    recipientPhoneNumber: '',
  });

  // Fetch gift cards
  const giftCardsQuery = useQuery({
    queryKey: ['userGiftCards'],
    queryFn: getCreatedGiftCards,
  });
  const countryCodeOptions = useMemo(
    () =>
      Country.getAllCountries()
        .filter((country) => country.phonecode)
        .map((country) => ({
          label: `${country.name} (+${country.phonecode})`,
          value: `+${country.phonecode}`,
        })),
    []
  );
  const shareGiftCardMutation = useMutation({
    mutationFn: ({ giftCardId, payload }) => shareGiftCard(giftCardId, payload),
    onSuccess: () => {
      message.success('Gift card share details saved');
      setShareModal({
        open: false,
        giftCardId: null,
        recipientName: '',
        recipientEmail: '',
        recipientCountryCode: '+971',
        recipientPhoneNumber: '',
      });
      queryClient.invalidateQueries({ queryKey: ['userGiftCards'] });
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || 'Failed to share gift card'
      );
    },
  });

  const copyToClipboard = (text, messageText = 'Copied to clipboard!') => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        message.success(messageText);
      } else {
        message.error('Unable to copy');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      message.error('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textArea);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'blue';
      case 'Redeemed':
        return 'green';
      case 'Expired':
        return 'gray';
    }
  };

  const formatDate = (dateString, { showTime = false } = {}) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: showTime ? '2-digit' : undefined,
      minute: showTime ? '2-digit' : undefined,
    });
  };

  const handleShareSubmit = async () => {
    if (!shareModal.giftCardId) return;
    if (!shareModal.recipientName.trim()) {
      message.warning('Recipient name is required');
      return;
    }
    if (!shareModal.recipientEmail.trim()) {
      message.warning('Recipient email is required');
      return;
    }
    if (!shareModal.recipientPhoneNumber.trim()) {
      message.warning('Recipient phone number is required');
      return;
    }

    await shareGiftCardMutation.mutateAsync({
      giftCardId: shareModal.giftCardId,
      payload: {
        recipientName: shareModal.recipientName.trim(),
        recipientEmail: shareModal.recipientEmail.trim(),
        recipientPhone: `${shareModal.recipientCountryCode} ${shareModal.recipientPhoneNumber.trim()}`,
      },
    });
  };

  const columns = [
    {
      title: 'S No',
      key: 'sno',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: giftCard.giftCard,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: common.giftCard,
      dataIndex: 'code',
      key: 'code',
      render: (code, record) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <TbGiftCard className="text-orange-500" size={18} />
            <span className="font-mono text-sm">{code}</span>
            {record.status === 'Active' && (
              <Tooltip title={giftCard.copyCode} className="mb-2">
                <button
                  onClick={() =>
                    copyToClipboard(code, 'Gift card code copied to clipboard!')
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiCopy size={14} />
                </button>
              </Tooltip>
            )}
          </div>

          {record.password && record.status === 'Active' && (
            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
              <span>{giftCard.password}:</span>
              <span
                className="select-all"
                style={{ userSelect: 'all', WebkitUserSelect: 'all' }}
              >
                {'*'.repeat(record.password?.length)}
              </span>
              <Tooltip title={giftCard.copyPassword} className="mb-3">
                <button
                  onClick={() =>
                    copyToClipboard(
                      record.password,
                      'Gift card password copied to clipboard!'
                    )
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiCopy size={14} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="w-fit">
          {status}
        </Tag>
      ),
    },
    {
      title: giftCard.amount,
      key: 'amount',
      dataIndex: 'amount',
      align: 'center',
      render: (amount) => (
        <div className="flex flex-col">
          <div className="font-semibold">{formatConvertedPrice(amount)}</div>
        </div>
      ),
    },
    {
      title: giftCard.redemptionInfo,
      key: 'redemption',
      render: (_, record) => {
        if (record.status !== 'Redeemed') {
          return <span className="text-gray-400">{giftCard.notRedeemed}</span>;
        }
        return (
          <div className="flex flex-col">
            <div className="text-sm">
              {common.by}: {record.redeemedBy?.email || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500">
              {common.on}: {formatDate(record.redeemedAt, { showTime: true })}
            </div>
          </div>
        );
      },
    },
    {
      title: giftCard.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt, record) => (
        <div className="flex flex-col">
          <div className="text-xs text-gray-500">
            {giftCard.created}: {formatDate(createdAt)}
          </div>
          {record.expiryDate && (
            <div className="text-xs text-gray-500 mt-1">
              {giftCard.expires}: {formatDate(record.expiryDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Share',
      key: 'share',
      render: (_, record) => (
        <CommonButton
          size="sm"
          variant={6}
          type="button"
          disabled={record.status !== 'Active'}
          onClick={() =>
            setShareModal((prev) => ({
              ...prev,
              open: true,
              giftCardId: record._id,
            }))
          }
        >
          <FiSend className="mr-1" />
          Share
        </CommonButton>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Modal
        title="Share Gift Card"
        open={shareModal.open}
        onCancel={() =>
          setShareModal({
            open: false,
            giftCardId: null,
            recipientName: '',
            recipientEmail: '',
            recipientCountryCode: '+971',
            recipientPhoneNumber: '',
          })
        }
        onOk={handleShareSubmit}
        okText="Save Recipient"
        confirmLoading={shareGiftCardMutation.isPending}
        centered
      >
        <div className="mt-6 space-y-4">
          <Input
            placeholder="Recipient name"
            value={shareModal.recipientName}
            onChange={(event) =>
              setShareModal((prev) => ({
                ...prev,
                recipientName: event.target.value,
              }))
            }
          />
          <Input
            placeholder="Recipient email"
            type="email"
            value={shareModal.recipientEmail}
            onChange={(event) =>
              setShareModal((prev) => ({
                ...prev,
                recipientEmail: event.target.value,
              }))
            }
          />
          <div className="grid grid-cols-3 gap-3">
            <Select
              showSearch
              className="col-span-1"
              value={shareModal.recipientCountryCode}
              options={countryCodeOptions}
              onChange={(value) =>
                setShareModal((prev) => ({
                  ...prev,
                  recipientCountryCode: value,
                }))
              }
              optionFilterProp="label"
            />
            <Input
              className="col-span-2"
              placeholder="Recipient phone number"
              value={shareModal.recipientPhoneNumber}
              onChange={(event) =>
                setShareModal((prev) => ({
                  ...prev,
                  recipientPhoneNumber: event.target.value,
                }))
              }
            />
          </div>
        </div>
      </Modal>
      <Banner bg={bg}>
        <div className="w-full md:mt-24 mt-36">
          <CategoryNavBar />

          {/* Header Section */}
          <div className="flex flex-col items-center justify-between w-full gap-4 px-6 py-6 text-black bg-white border-t border-b md:flex-row md:py-12 md:gap-5 md:px-10 lg:px-20">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold md:text-4xl lg:text-5xl">
                {giftCard.myGiftCards}
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                {giftCard.manageGiftCards}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CommonButton
                size="md"
                variant={5}
                isLink
                to="/profile/my-credit"
                className="flex items-center h-fit"
              >
                <FiGift className="mr-1" />
                {giftCard.redeemGiftCard}
              </CommonButton>
              <CommonButton
                variant={6}
                size="md"
                isLink
                to="/gift-cards/buy"
                className="flex items-center h-fit"
              >
                <FiPlus className="mr-1" />
                {giftCard.buyGiftCard}
              </CommonButton>
            </div>
          </div>

          {/* Summary Stats */}
          {giftCardsQuery.data?.summary && (
            <div className="bg-white px-6 py-4 md:px-10 lg:px-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {giftCardsQuery.data.summary.total}
                  </div>
                  <div className="text-sm text-gray-600">
                    {giftCard.totalCards}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {giftCardsQuery.data.summary.active}
                  </div>
                  <div className="text-sm text-gray-600">{giftCard.active}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {giftCardsQuery.data.summary.redeemed}
                  </div>
                  <div className="text-sm text-gray-600">
                    {giftCard.redeemed}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatConvertedPrice(giftCardsQuery.data.summary.totalValue)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {giftCard.totalValue}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="w-full px-4 py-8 text-black bg-white md:px-6 lg:px-20">
            {giftCardsQuery.isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-lg">{common.loading}</div>
              </div>
            ) : giftCardsQuery.error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">{common.errorLoading}</div>
                <CommonButton
                  variant={2}
                  onClick={() => giftCardsQuery.refetch()}
                >
                  {common.tryAgain}
                </CommonButton>
              </div>
            ) : giftCardsQuery.data?.data?.length === 0 ? (
              <div className="text-center py-12">
                <TbGiftCard size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {giftCard.noGiftCards}
                </h3>
                <p className="text-gray-500 mb-6">{giftCard.notCreated}</p>
                <CommonButton variant={6} size="md" isLink to="/gift-cards/buy">
                  {giftCard.buyFirstGiftCard}
                </CommonButton>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={giftCardsQuery.data?.data || []}
                  rowKey="_id"
                  //   pagination={{
                  //     pageSize: 10,
                  //     showSizeChanger: true,
                  //     showTotal: (total, range) =>
                  //       `${range[0]}-${range[1]} of ${total} gift cards`,
                  //   }}
                  pagination={false}
                  scroll={{ x: 1000 }}
                />
              </div>
            )}
          </main>

          <div className="w-full text-black bg-white pt-20">
            <Section10 />
          </div>

          <div className="py-10">
            <NewsLetter />
          </div>
        </div>
      </Banner>
    </div>
  );
};

export default GiftCard;
