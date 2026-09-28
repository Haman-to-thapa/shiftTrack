import { Shift } from '../types/shift';

const TEST_EMAIL = 'staff@shifttrack.test';
const TEST_PASSWORD = 'Password123';

let shouldFailShiftsRequest = false;

export const setShiftsError = (value: boolean) => {
  shouldFailShiftsRequest = value;
};

let mockShifts: Shift[] = [
  {
    id: 's1',
    date: '2026-09-28',
    startTime: '2026-09-28T09:00:00Z',
    endTime: '2026-09-28T17:00:00Z',
    breakMinutes: 30,
  },
  {
    id: 's2',
    date: '2026-09-29',
    startTime: '2026-09-29T10:00:00Z',
    endTime: '2026-09-29T18:00:00Z',
    breakMinutes: 45,
  },
];

export const loginApi = async (
  email: string,
  password: string,
) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (normalizedEmail !== TEST_EMAIL.toLowerCase() || normalizedPassword !== TEST_PASSWORD) {
    throw new Error('Invalid email or password');
  }

  return {
    token: 'abc123',
    user: {
      id: 'u1',
      name: 'Alex',
    },
  };
};

export const getShiftsApi = async (
  weekStart: string,
): Promise<Shift[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));

  if (shouldFailShiftsRequest) {
    throw new Error('Unable to load shifts');
  }

  console.log(`GET /shifts?weekStart=${weekStart}`);

  return mockShifts.filter(
    shift => shift.date >= weekStart,
  );
};

export const createShiftApi = async (
  shift: Shift,
): Promise<Shift> => {
  await new Promise(resolve => setTimeout(resolve, 700));

  const newShift = {
    ...shift,
    id: `s${Date.now()}`,
  };

  mockShifts = [...mockShifts, newShift];

  console.log('POST /shifts', newShift);

  return newShift;
};

export const startShiftApi = async (): Promise<Shift> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const now = new Date();

  const newShift: Shift = {
    id: `s${Date.now()}`,
    date: now.toISOString().split('T')[0],
    startTime: now.toISOString(),
    endTime: null,
    breakMinutes: 0,
  };

  mockShifts = [...mockShifts, newShift];

  console.log('POST /shifts', newShift);

  return newShift;
};

export const updateShiftApi = async (
  id: string,
  updates: Partial<Shift>,
): Promise<Shift> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const index = mockShifts.findIndex(
    shift => shift.id === id,
  );

  if (index === -1) {
    throw new Error('Shift not found');
  }

  const updatedShift = {
    ...mockShifts[index],
    ...updates,
  };

  mockShifts[index] = updatedShift;

  console.log(`PATCH /shifts/${id}`, updates);

  return updatedShift;
};

export const endShiftApi = async (
  id: string,
): Promise<Shift> => {
  return updateShiftApi(id, {
    endTime: new Date().toISOString(),
  });
};