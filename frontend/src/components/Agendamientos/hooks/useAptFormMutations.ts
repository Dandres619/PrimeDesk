import { toast } from 'sonner';
import { format } from 'date-fns';

export function useAptFormMutations({
  form, setForm, setShowErrors, setIsSaving, onSave, selectedMechanicSchedule,
  selectedMechanic, durationData, apt, date, setSearch, onOpenChange
}: any) {

  const format12h = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    const isNotesTooLong = form.notes.length > 80;

    if (!form.clientId || !form.motorcycleId || !form.startTime || (!apt && form.serviceIds.length === 0) || !form.mechanicId || isNotesTooLong) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    if (selectedMechanicSchedule && durationData.endTime > selectedMechanicSchedule.salida) {
      toast.error(`El mecánico ${selectedMechanic?.Nombre} termina su turno a las ${format12h(selectedMechanicSchedule.salida)}. Los servicios exceden su horario laboral.`);
      return;
    }

    const endTime = durationData.endTime;

    setIsSaving(true);
    try {
      await onSave({ ...form, endTime });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleService = (id: number) => {
    setForm((prev: any) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s: number) => s !== id)
        : [...prev.serviceIds, id]
    }));
  };

  const handleCancel = () => {
    setForm({
      date: date ? format(date, 'yyyy-MM-dd') : '',
      startTime: '',
      endTime: '',
      clientId: '',
      motorcycleId: '',
      mechanicId: '',
      serviceIds: [],
      notes: ''
    });
    setShowErrors(false);
    setSearch({ client: '', motorcycle: '', mechanic: '' });
    if (onOpenChange) onOpenChange(false);
  };

  return {
    handleSubmit,
    toggleService,
    handleCancel,
    format12h
  };
}
