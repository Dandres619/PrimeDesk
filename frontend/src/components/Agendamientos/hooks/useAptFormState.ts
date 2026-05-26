import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function useAptFormState(apt: any, date: any) {
  const [form, setForm] = useState({
    date: apt?.date || (date ? format(date, 'yyyy-MM-dd') : ''),
    startTime: apt?.startTime || '',
    endTime: apt?.endTime || '',
    clientId: apt?.clientId?.toString() || '',
    motorcycleId: apt?.motorcycleId?.toString() || '',
    mechanicId: apt?.mechanicId?.toString() || '',
    serviceIds: apt?.serviceIds || [] as number[],
    notes: apt?.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'mañana' | 'tarde' | 'noche'>('mañana');
  const [showErrors, setShowErrors] = useState(false);
  const [popovers, setPopovers] = useState({
    client: false,
    motorcycle: false,
    mechanic: false,
    startTime: false
  });
  const [servicesSearch, setServicesSearch] = useState('');
  const [search, setSearch] = useState({
    client: '',
    motorcycle: '',
    mechanic: ''
  });

  useEffect(() => {
    setServicesSearch('');
    if (apt) {
      setForm({
        date: apt.date || '',
        startTime: apt.startTime || '',
        endTime: apt.endTime || '',
        clientId: apt.clientId?.toString() || '',
        motorcycleId: apt.motorcycleId?.toString() || '',
        mechanicId: apt.mechanicId?.toString() || '',
        serviceIds: apt.serviceIds || [],
        notes: apt.notes || ''
      });
    } else if (date) {
      setForm({
        date: format(date, 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        clientId: '',
        motorcycleId: '',
        mechanicId: '',
        serviceIds: [],
        notes: ''
      });
      setShowErrors(false);
    }
  }, [apt, date]);

  useEffect(() => {
    if (popovers.startTime && form.startTime) {
      const timer = setTimeout(() => {
        const selectedEl = document.getElementById(`time-slot-${form.startTime}`);
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [popovers.startTime, form.startTime]);

  useEffect(() => {
    if (form.startTime) {
      const hour = parseInt(form.startTime.split(':')[0]);
      if (hour >= 6 && hour < 12) {
        setSelectedSection('mañana');
      } else if (hour >= 12 && hour < 18) {
        setSelectedSection('tarde');
      } else if (hour >= 18 && hour < 24) {
        setSelectedSection('noche');
      }
    }
  }, [form.startTime]);

  return {
    form, setForm,
    isSaving, setIsSaving,
    selectedSection, setSelectedSection,
    showErrors, setShowErrors,
    popovers, setPopovers,
    servicesSearch, setServicesSearch,
    search, setSearch
  };
}
