import { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';
import { message } from 'antd';
import { getAddressBook, updateAddressBook } from '../../apis/user/profile';
import { useQuery } from '@tanstack/react-query';
import { useTranslationContext } from '../../context/TranslationContext';
import { CommonButton } from '../global/UIButtons';

const AddressBook = () => {
  const {
    content: { common, profile },
  } = useTranslationContext();
  const [shippingCountryList, setShippingCountryList] = useState(
    Country.getAllCountries()
  );
  const [billingCountryList, setBillingCountryList] = useState(
    Country.getAllCountries()
  );
  const [shippingStateList, setShippingStateList] = useState([]);
  const [billingStateList, setBillingStateList] = useState([]);

  const [shippingAddress, setShippingAddress] = useState({
    street_address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    company: '',
    phone_number: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    street_address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    company: '',
    phone_number: '',
  });

  const query = useQuery({
    queryKey: ['address-book'],
    queryFn: () => getAddressBook(),
    retry: false,
  });

  const handleFormChange = (key1, key2, value) => {
    if (key1 == 'shippingAddress') {
      setShippingAddress((prevData) => {
        return { ...prevData, [key2]: value };
      });
    } else {
      setBillingAddress((prevData) => {
        return { ...prevData, [key2]: value };
      });
    }
  };

  const handleShippingCountryChange = (value) => {
    setShippingAddress((prevData) => {
      return { ...prevData, country: value };
    });
    setShippingStateList(State.getStatesOfCountry(value));
  };

  const handleBillingCountryChange = (value) => {
    setBillingAddress((prevData) => {
      return { ...prevData, country: value };
    });
    setBillingStateList(State.getStatesOfCountry(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAddressBook({
        shippingAddress,
        billingAddress,
      });
      message.success('Address updated successfully');
      query.refetch();
    } catch (err) {
      message.error(
        err?.response?.data?.message || 'Failed to update address'
      );
    }
  };

  useEffect(() => {
    if (query.data) {
      setShippingStateList(
        State.getStatesOfCountry(query.data?.data?.shippingAddress?.country)
      );
      setBillingStateList(
        State.getStatesOfCountry(query.data?.data?.billingAddress?.country)
      );
      setShippingAddress(query.data?.data?.shippingAddress);
      setBillingAddress(query.data?.data?.billingAddress);
    }
  }, [query.data]);

  return (
    <div className="p-4 md:p-20">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Shipping Address */}
          <div className="md:mr-4">
            <h2 className="mb-4 text-2xl font-bold">
              {profile.shippingAddress}
            </h2>
            <div className="w-1/4 mb-4 border-b-2 border-black"></div>

            <div className="mt-4">
              <label className="block mb-1">{profile.street} *</label>
              <input
                type="text"
                value={shippingAddress?.street_address}
                onChange={(e) =>
                  handleFormChange(
                    'shippingAddress',
                    'street_address',
                    e.target.value
                  )
                }
                className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <div>
                <label className="block mb-1">{profile.city} *</label>
                <input
                  type="text"
                  value={shippingAddress?.city}
                  onChange={(e) =>
                    handleFormChange('shippingAddress', 'city', e.target.value)
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block mb-1">{profile.country} *</label>
                <select
                  onChange={(e) => handleShippingCountryChange(e.target.value)}
                  value={shippingAddress?.country}
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                >
                  <option value={''}></option>
                  {shippingCountryList.map((country) => (
                    <option value={country.isoCode}>{country?.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <div>
                <label className="block mb-1">{profile.postalCode} *</label>
                <input
                  type="text"
                  value={shippingAddress?.postalCode}
                  onChange={(e) =>
                    handleFormChange(
                      'shippingAddress',
                      'postalCode',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block mb-1">{profile.state} *</label>
                <select
                  value={shippingAddress?.state}
                  onChange={(e) =>
                    handleFormChange('shippingAddress', 'state', e.target.value)
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                >
                  {shippingStateList.map((state) => (
                    <option value={state.isoCode}>{state.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <div>
                <label className="block mb-1">{profile.company}</label>
                <input
                  type="text"
                  value={shippingAddress?.company}
                  onChange={(e) =>
                    handleFormChange(
                      'shippingAddress',
                      'company',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block mb-1">{profile.phone} *</label>
                <input
                  type="number"
                  value={shippingAddress?.phone_number}
                  onChange={(e) =>
                    handleFormChange(
                      'shippingAddress',
                      'phone_number',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Divider between the two columns */}
          <div className="w-px mx-4 bg-black md:hidden"></div>

          {/* Billing Address */}
          <div className="md:mr-4">
            <h2 className="mb-4 text-2xl font-bold">
              {profile.billingAddress}
            </h2>
            <div className="w-1/4 mb-4 border-b-2 border-black"></div>

            <div className="mt-4">
              <label className="block mb-1">{profile.street} *</label>
              <input
                type="text"
                value={billingAddress?.street_address}
                onChange={(e) =>
                  handleFormChange(
                    'billingAddress',
                    'street_address',
                    e.target.value
                  )
                }
                className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <div>
                <label className="block mb-1">{profile.city} *</label>
                <input
                  type="text"
                  value={billingAddress?.city}
                  onChange={(e) =>
                    handleFormChange('billingAddress', 'city', e.target.value)
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block mb-1">{profile.country} *</label>
                <select
                  onChange={(e) => handleBillingCountryChange(e.target.value)}
                  value={billingAddress?.country}
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                >
                  <option value={''}></option>
                  {shippingCountryList.map((country) => (
                    <option value={country.isoCode}>{country.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <div>
                <label className="block mb-1">{profile.postalCode} *</label>
                <input
                  type="text"
                  value={billingAddress?.postalCode}
                  onChange={(e) =>
                    handleFormChange(
                      'billingAddress',
                      'postalCode',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block mb-1">{profile.state} *</label>
                <select
                  value={billingAddress?.state}
                  onChange={(e) =>
                    handleFormChange('billingAddress', 'state', e.target.value)
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                >
                  {billingStateList.map((state) => (
                    <option value={state.isoCode}>{state.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
              <div>
                <label className="block mb-1">{profile.company}</label>
                <input
                  type="text"
                  value={billingAddress?.company}
                  onChange={(e) =>
                    handleFormChange(
                      'billingAddress',
                      'company',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block mb-1">{profile.phone} *</label>
                <input
                  type="number"
                  value={billingAddress?.phone_number}
                  onChange={(e) =>
                    handleFormChange(
                      'billingAddress',
                      'phone_number',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border-b-2 border-gray-400 outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <CommonButton variant={5} type="submit" className="mt-8">
          {common.save}
        </CommonButton>
      </form>
    </div>
  );
};

export default AddressBook;
