import { useState, useEffect } from 'react';
import { Button } from './button';
import { Calendar } from './calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (v: string) => void;
  minDate: Date;
  maxDate: Date;
  onClose: () => void;
}

export function CustomDatePicker({ value, onChange, minDate, maxDate, onClose }: CustomDatePickerProps) {
  const [view, setView] = useState<'days' | 'months' | 'years'>('years');
  const initialDate = value ? new Date(value + 'T00:00:00') : maxDate;
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [yearPage, setYearPage] = useState(
    initialDate.getFullYear() - (initialDate.getFullYear() % 12)
  );

  useEffect(() => {
    if (!value) setView('years');
    else setView('days');
  }, [value]);

  const handleYearSelect = (y: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(y);
    setCurrentDate(newDate);
    setView('months');
  };

  const handleMonthSelect = (m: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(m);
    setCurrentDate(newDate);
    setView('days');
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  if (view === 'years') {
    const years = Array.from({ length: 12 }, (_, i) => yearPage + i);
    return (
      <div className="p-3 w-[320px]">
        <div className="flex justify-between items-center mb-4">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYearPage(y => y - 12)} disabled={yearPage <= minDate.getFullYear()}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-bold text-sm">{yearPage} - {yearPage + 11}</div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYearPage(y => y + 12)} disabled={yearPage + 12 > maxDate.getFullYear()}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map(y => {
            const disabled = y > maxDate.getFullYear() || y < minDate.getFullYear();
            return (
              <Button type="button" key={y} variant={y === currentDate.getFullYear() ? 'default' : 'ghost'} className="text-sm h-9" disabled={disabled} onClick={() => handleYearSelect(y)}>{y}</Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'months') {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return (
      <div className="p-3 w-[320px]">
        <div className="flex justify-between items-center mb-4">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={currentDate.getFullYear() <= minDate.getFullYear()} onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            setCurrentDate(newDate);
          }}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-bold text-sm cursor-pointer hover:bg-slate-100 px-2 py-1 rounded" onClick={() => {
            setYearPage(currentDate.getFullYear() - (currentDate.getFullYear() % 12));
            setView('years');
          }}>{currentDate.getFullYear()}</div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" disabled={currentDate.getFullYear() >= maxDate.getFullYear()} onClick={() => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            setCurrentDate(newDate);
          }}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((m, i) => {
            const disabled = (currentDate.getFullYear() === maxDate.getFullYear() && i > maxDate.getMonth()) || 
                             (currentDate.getFullYear() === minDate.getFullYear() && i < minDate.getMonth()) ||
                             currentDate.getFullYear() < minDate.getFullYear() ||
                             currentDate.getFullYear() > maxDate.getFullYear();
            return (
              <Button type="button" key={i} variant={i === currentDate.getMonth() ? 'default' : 'ghost'} disabled={disabled} className="text-sm h-9" onClick={() => handleMonthSelect(i)}>{m}</Button>
            );
          })}
        </div>
      </div>
    );
  }

  const isNextMonthDisabled = currentDate.getFullYear() === maxDate.getFullYear() && currentDate.getMonth() >= maxDate.getMonth();
  const isPrevMonthDisabled = currentDate.getFullYear() === minDate.getFullYear() && currentDate.getMonth() <= minDate.getMonth();

  return (
    <div className="w-auto min-w-[320px]">
      <div className="flex justify-between items-center p-3 pb-0">
        <Button type="button" variant="outline" size="icon" className="h-7 w-7" disabled={isPrevMonthDisabled} onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="font-bold text-sm cursor-pointer hover:bg-slate-100 px-3 py-1.5 rounded flex items-center capitalize" onClick={() => setView('months')}>
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </div>
        <Button type="button" variant="outline" size="icon" className="h-7 w-7" disabled={isNextMonthDisabled} onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <Calendar
        mode="single"
        selected={value ? new Date(value + 'T00:00:00') : undefined}
        onSelect={(d) => {
          if (d) {
            onChange(format(d, 'yyyy-MM-dd'));
            onClose();
          }
        }}
        month={currentDate}
        onMonthChange={setCurrentDate}
        disabled={(d) => d > maxDate || d < minDate}
        locale={es}
        className="p-3"
        classNames={{
          month_caption: "hidden",
          nav: "hidden",
          table: "w-full border-collapse mt-2",
          weekdays: "flex justify-between mb-2",
          weekday: "text-slate-500 rounded-md w-10 font-medium text-sm text-center uppercase",
          week: "flex w-full mt-1 justify-between",
          day: "h-10 w-10 p-0 font-medium text-center text-base relative aria-selected:bg-indigo-600 aria-selected:text-white rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-center transition-colors",
          today: "bg-slate-100 text-slate-900 font-bold",
          outside: "text-slate-300 opacity-50",
        }}
      />
    </div>
  );
}
