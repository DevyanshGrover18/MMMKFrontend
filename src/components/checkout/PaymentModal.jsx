import { useState } from 'react';
import { Modal, Button, message } from 'antd';

const PaymentModal = ({ visible, onClose, onSelectPayment, checkout }) => {
  return (
    <Modal
      title={checkout.selectPaymentMethod}
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <div className="flex justify-center gap-4 mt-4">
        <Button type="primary" onClick={() => onSelectPayment('card')}>
          {checkout.payWithCard}
        </Button>
        <Button type="default" onClick={() => onSelectPayment('cod')}>
          {checkout.cashOnDelivery}
        </Button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
