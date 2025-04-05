const Dropdown = ({ label, options, className = "", ...props }) => {
    return (
      <div>
        <label className="block text-[#48505E] text-[15px]">{label}</label>
        <select className={`w-full p-2 border rounded-md ${className}`} {...props}>
          <option value="" defaultValue> </option>
          <option value="" disabled>Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  };
  
  export default Dropdown;
  