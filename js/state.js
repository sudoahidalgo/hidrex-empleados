export const supabaseUrl = window._env_?.SUPABASE_URL;
export const supabaseKey = window._env_?.SUPABASE_KEY;
export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export const publicHolidays = {
  2025: [
    { date: '2025-01-01', name: 'Año Nuevo' },
    { date: '2025-04-11', name: 'Día de Juan Santamaría' },
    { date: '2025-04-17', name: 'Jueves Santo' },
    { date: '2025-04-18', name: 'Viernes Santo' },
    { date: '2025-05-01', name: 'Día del Trabajador' },
    { date: '2025-07-25', name: 'Anexión de Guanacaste' },
    { date: '2025-08-02', name: 'Virgen de los Ángeles' },
    { date: '2025-08-15', name: 'Día de la Madre' },
    { date: '2025-09-15', name: 'Independencia' },
    { date: '2025-10-12', name: 'Día de las Culturas' },
    { date: '2025-12-25', name: 'Navidad' }
  ],
  2026: [
    { date: '2026-01-01', name: 'Año Nuevo' },
    { date: '2026-04-03', name: 'Jueves Santo' },
    { date: '2026-04-04', name: 'Viernes Santo' },
    { date: '2026-04-11', name: 'Día de Juan Santamaría' },
    { date: '2026-05-01', name: 'Día del Trabajador' },
    { date: '2026-07-25', name: 'Anexión de Guanacaste' },
    { date: '2026-08-02', name: 'Virgen de los Ángeles' },
    { date: '2026-08-15', name: 'Día de la Madre' },
    { date: '2026-09-15', name: 'Independencia' },
    { date: '2026-10-12', name: 'Día de las Culturas' },
    { date: '2026-12-25', name: 'Navidad' }
  ],
  2027: [
    { date: '2027-01-01', name: 'Año Nuevo' },
    { date: '2027-03-26', name: 'Jueves Santo' },
    { date: '2027-03-27', name: 'Viernes Santo' },
    { date: '2027-04-11', name: 'Día de Juan Santamaría' },
    { date: '2027-05-01', name: 'Día del Trabajador' },
    { date: '2027-07-25', name: 'Anexión de Guanacaste' },
    { date: '2027-08-02', name: 'Virgen de los Ángeles' },
    { date: '2027-08-15', name: 'Día de la Madre' },
    { date: '2027-09-15', name: 'Independencia' },
    { date: '2027-10-12', name: 'Día de las Culturas' },
    { date: '2027-12-25', name: 'Navidad' }
  ]
};

export const appState = {
  currentUser: null,
  employees: [],
  vacationRequests: [],
  vacationHistory: [],
  isLoggedIn: false,
  loading: true,
  authInitialized: false,
  // Estados de UI
  editingEmployee: null,
  showAddEmployee: false,
  showNewRequest: false,
  showRequests: false,
  showHistory: false,
  // Estados de solicitud de vacaciones
  selectedDates: [],
  currentMonth: new Date(),
  requestNotes: '',
  requestType: 'full',
  vacationType: 'vacation',
  // Estados de visualización
  selectedYear: new Date().getFullYear()
};
