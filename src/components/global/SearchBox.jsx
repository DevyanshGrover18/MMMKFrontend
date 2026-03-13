/* eslint-disable compat/compat */
import { useState } from 'react';
import { Select } from 'antd';
import { searchCategory } from '../../apis/nonAuth/category';
import { getUrl } from '../../utils/globalMethods';
import { useNavigate } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
let timeout;
let currentValue;
const toURLSearchParams = (record) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    params.append(key, value);
  }
  return params;
};
const fetchData = (value, callback) => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;
  const params = toURLSearchParams({ code: 'utf-8', q: value });
  const fake = async () => {
    const results = await searchCategory(value);

    if (currentValue === value) {
      const resultData =
        results?.reduce((acc, item) => {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push({
            value: item.value,
            label: item.label,
            key: `${item.type}-${item.value}`,
          });
          return acc;
        }, {}) || {};
      const data = Object.keys(resultData).map((key) => ({
        label: key,
        options: resultData[key],
      }));
      callback(data);
    }
  };
  if (value) {
    timeout = setTimeout(fake, 800);
  } else {
    callback([]);
  }
};
export default function SearchBox(props) {
  const [data, setData] = useState([]);
  const [value, setValue] = useState();
  const navigate = useNavigate();
  const handleSearch = (newValue) => {
    fetchData(newValue, setData);
  };
  const handleChange = (newValue) => {
    setValue(newValue);
  };
  const handleNavigate = (option) => {
    const [type, label] = option.key.split('-');
    if (type === 'Category') {
      navigate(`/product-listings?categories=${getUrl(option.label)}`);
    } else if (type === 'Product') {
      navigate(`/product-details/${option.value}`);
    }
  };
  return (
    <Select
      showSearch
      value={value}
      //   searchValue={search}
      placeholder={props.placeholder || 'Search...'}
      style={props.style}
      defaultActiveFirstOption={false}
      suffixIcon={<BsSearch className="text-gray-900" size={20} />}
      size="large"
      variant="borderless"
      className="border-b-2 border-b-gray-900 block text-lg w-[90vw] mx-auto max-w-[800px] text-left"
      popupClassName="text-2xl"
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      onSelect={(v, option) => handleNavigate(option)}
      notFoundContent={null}
      options={data}
    />
  );
}
