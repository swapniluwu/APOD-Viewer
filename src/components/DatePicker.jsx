import React, { useState } from 'react';
import { format, subDays } from 'date-fns';

const DatePicker = ({ onDateSelect }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'));

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    onDateSelect(date);
  };

  const quickSelectDate = (days) => {
    const date = format(subDays(today, days), 'yyyy-MM-dd');
    setSelectedDate(date);
    onDateSelect(date);
  };

  return (
    <div className="date-picker">
      <input
        type="date"
        value={selectedDate}
        max={format(today, 'yyyy-MM-dd')}
        min="1995-06-16" // NASA APOD start date
        onChange={handleDateChange}
      />
      <div className="quick-select">
        <button onClick={() => quickSelectDate(1)}>Yesterday</button>
        <button onClick={() => quickSelectDate(7)}>Last Week</button>
        <button onClick={() => quickSelectDate(30)}>Last Month</button>
      </div>
    </div>
  );
};

export default DatePicker;