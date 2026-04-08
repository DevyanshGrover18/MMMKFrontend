import { Modal } from 'antd';
import { BsCreditCard2Front, BsCashCoin } from 'react-icons/bs';

const PaymentModal = ({ visible, onClose, onSelectPayment, checkout }) => {
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      className="checkout-payment-modal"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400">
            {checkout?.selectPaymentMethod}
          </p>
          <h3 className="text-2xl font-semibold text-gray-900">
            {checkout?.chooseHowToPay || checkout?.selectPaymentMethod}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectPayment('card')}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition hover:border-gray-900 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-white">
                <BsCreditCard2Front />
              </span>
              <span>
                <span className="block text-base font-semibold text-gray-900">
                  {checkout?.payWithCard}
                </span>
                <span className="block text-sm text-gray-500">
                  {checkout?.cardPaymentDescription ||
                    checkout?.selectPaymentMethod}
                </span>
              </span>
            </div>
            <span className="text-sm font-medium text-gray-400">→</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectPayment('cod')}
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition hover:border-gray-900 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <BsCashCoin />
              </span>
              <span>
                <span className="block text-base font-semibold text-gray-900">
                  {checkout?.cashOnDelivery}
                </span>
                <span className="block text-sm text-gray-500">
                  {checkout?.codPaymentDescription ||
                    checkout?.selectPaymentMethod}
                </span>
              </span>
            </div>
            <span className="text-sm font-medium text-gray-400">→</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
