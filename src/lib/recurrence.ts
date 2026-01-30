import type { AppointmentSeries, Prescription, AppointmentOccurrence, RefillOccurrence, RepeatType } from './types';

function addInterval(date: Date, repeat: RepeatType): Date {
  const newDate = new Date(date);
  if (repeat === 'weekly') {
    newDate.setDate(newDate.getDate() + 7);
  } else if (repeat === 'monthly') {
    newDate.setMonth(newDate.getMonth() + 1);
  }
  return newDate;
}

export function generateAppointmentOccurrences(
  series: AppointmentSeries,
  windowStart: Date,
  windowEnd: Date
): AppointmentOccurrence[] {
  const occurrences: AppointmentOccurrence[] = [];
  const startDateTime = new Date(series.start_datetime);
  const endsOn = series.ends_on ? new Date(series.ends_on) : null;

  let currentDate = new Date(Math.max(startDateTime.getTime(), windowStart.getTime()));

  if (currentDate > startDateTime && series.repeat !== 'none') {
    while (currentDate > startDateTime) {
      const prevDate = new Date(currentDate);
      if (series.repeat === 'weekly') {
        prevDate.setDate(prevDate.getDate() - 7);
      } else if (series.repeat === 'monthly') {
        prevDate.setMonth(prevDate.getMonth() - 1);
      }
      if (prevDate < startDateTime) break;
      currentDate = prevDate;
    }
  } else {
    currentDate = new Date(startDateTime);
  }

  while (currentDate <= windowEnd) {
    if (endsOn && currentDate > endsOn) {
      break;
    }

    if (currentDate >= windowStart && currentDate >= startDateTime) {
      occurrences.push({
        seriesId: series.id,
        date: new Date(currentDate),
        providerName: series.provider_name,
      });
    }

    if (series.repeat === 'none') {
      break;
    }

    currentDate = addInterval(currentDate, series.repeat);
  }

  return occurrences;
}

export function generateRefillOccurrences(
  prescription: Prescription,
  windowStart: Date,
  windowEnd: Date
): RefillOccurrence[] {
  const occurrences: RefillOccurrence[] = [];
  const refillDate = new Date(prescription.refill_on);

  let currentDate = new Date(refillDate);

  while (currentDate <= windowEnd) {
    if (currentDate >= windowStart) {
      occurrences.push({
        prescriptionId: prescription.id,
        date: new Date(currentDate),
        medicationName: prescription.medication_name,
        dosageValue: prescription.dosage_value,
        quantity: prescription.quantity,
      });
    }

    if (prescription.refill_schedule === 'none') {
      break;
    }

    currentDate = addInterval(currentDate, prescription.refill_schedule);
  }

  return occurrences;
}

export function getNextAppointmentDate(series: AppointmentSeries): Date | null {
  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  const occurrences = generateAppointmentOccurrences(series, now, threeMonthsFromNow);
  return occurrences.length > 0 ? occurrences[0].date : null;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
