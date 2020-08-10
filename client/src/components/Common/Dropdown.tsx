import React from 'react';
import Select from 'react-select';

const optionsKnown = [
  { label: 'Investigate', icon: 'investigate' },
  { label: 'Do not Investigate', icon: 'not_investigate' },
  { label: 'Postpone', icon: 'postpone' },
];

const optionsUnknown = [
  { label: 'Problem', icon: 'problem' },
  { label: 'Previously seen', icon: 'seen' },
  { label: 'Normal', icon: 'normal' },
];

export const grouppedOptions = [
  {
    label: 'Known',
    options: optionsKnown,
  },
  {
    label: 'Unknown',
    options: optionsUnknown,
  },
];

export const filterOptions = [
  { value: 'Investigate', label: 'Investigate', icon: 'investigate', isFixed: true },
  { value: 'Do not Investigate', label: 'Do not Investigate', icon: 'not_investigate', isFixed: true },
  { value: 'Postpone', label: 'Postpone', icon: 'postpone', isFixed: true },
  { value: 'Problem', label: 'Problem', icon: 'problem', isFixed: true },
  { value: 'Previously seen', label: 'Previously seen', icon: 'seen', isFixed: true },
  { value: 'Normal', label: 'Normal', icon: 'normal', isFixed: true },
  { value: 'Untagged', label: 'Untagged', icon: 'untagged', isFixed: true },
];

export const formatOptionLabel = ({ label, icon }) => (
  <div className="select-row">
    <i className={`select ${icon}`} />
    <span>{label}</span>
  </div>
);

export const Dropdown = (props) => {
  const { onChange, isSearchable, isMulti, closeMenuOnSelect, value, placeholder } = props;

  return (
    <Select
      formatOptionLabel={formatOptionLabel}
      options={filterOptions}
      classNamePrefix="tag-options"
      className="tag-select"
      placeholder={placeholder}
      onChange={onChange}
      isSearchable={isSearchable}
      isMulti={isMulti}
      closeMenuOnSelect={closeMenuOnSelect}
      value={value}
    />
  );
};

Dropdown.defaultProps = {
  isGrouppedOptions: false,
  placeholder: 'Select a tag',
  isMulti: false,
  isSearchable: false,
  closeMenuOnSelect: true,
};

export default Dropdown;
