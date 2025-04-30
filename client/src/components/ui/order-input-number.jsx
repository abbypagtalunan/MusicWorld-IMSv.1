const InputNumber = ({ label, type = "number", min = 0, className = "", ...props }) => {
  const handleInput = (event) => {
    if (event.target.value < 0) {
      event.target.value = 0;
    }
  };

  // Prevent typing '-'
  const handleKeyDown = (event) => {
    if (event.key === "-") {
      event.preventDefault();
    }
  };

  return (
    <div>
      <label className="block text-[#48505E] text-[15px]">{label}</label>
      <input
        type={type}
        min={min}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={`w-full border border-gray-300 rounded-md px-2 py-1 text-sm text-[15px] w-full p-2 border rounded-md
        [&::-webkit-outer-spin-button]:appearance-none 
        [&::-webkit-inner-spin-button]:appearance-none ${className}`}
        {...props}
      />
    </div>
  );
};

export default InputNumber;
