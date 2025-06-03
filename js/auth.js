import { render } from "./ui.js";
// Configuración de Supabase
const supabaseUrl = window._env_.SUPABASE_URL;
const supabaseKey = window._env_.SUPABASE_KEY;
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Verificar configuración inicial
const DEBUG = false;
const debugLog = (...args) => { if (DEBUG) console.log(...args); };
debugLog('Hidrex Capital - Sistema inicializado');
debugLog('Supabase URL:', supabaseUrl);
debugLog('Supabase Client:', supabase);

// Configuración de empresas - ACTUALIZADO con los nuevos short names
const companies = {
    'Inversiones Ana Maria S.A.': {
        name: 'Inversiones Ana Maria S.A.',
        shortName: 'IAM',
        color: 'from-blue-500 to-blue-600',
        icon: '🏢',
        sector: 'Holding'
    },
    'Hidrex Bienes Raices S.A.': {
        name: 'Hidrex Bienes Raices S.A.',
        shortName: 'HBR',
        color: 'from-green-500 to-green-600',
        icon: '🏠',
        sector: 'Bienes Raíces'
    },
    'Hidrex Servicios SRL': {
        name: 'Hidrex Servicios SRL',
        shortName: 'HSER',
        color: 'from-purple-500 to-purple-600',
        icon: '⚙️',
        sector: 'Servicios'
    },
    'Adrian Hidalgo Drexler': {
        name: 'Adrian Hidalgo Drexler',
        shortName: 'AHD',
        color: 'from-orange-500 to-orange-600',
        icon: '👤',
        sector: 'Persona Física'
    }
};

// Estado global de la aplicación
let appState = {
    currentUser: null,
    employees: [],
    vacationRequests: [],
    vacationHistory: [],
    isLoggedIn: false,
    loading: true,
    currentView: 'dashboard',
    selectedCompany: null,
    selectedEmployee: null,
    editingEmployee: null,
    showAddEmployee: false,
    previewEmployee: null,
    authInitialized: false
};

// Utilidades
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CR');
}

function getAvatarByGender(gender) {
    if (gender === 'femenino') {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FF8C42'/%3E%3Cpath d='M30 35 Q50 25 70 35 L70 45 Q50 55 30 45 Z' fill='%23654321'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23F4C2A1'/%3E%3Crect x='42' y='60' width='16' height='25' fill='%232C3E50' rx='8'/%3E%3C/svg%3E";
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFD700'/%3E%3Cpath d='M35 30 Q50 20 65 30 L65 40 Q50 50 35 40 Z' fill='%23654321'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23F4C2A1'/%3E%3Crect x='42' y='60' width='16' height='25' fill='%23008B8B' rx='8'/%3E%3C/svg%3E";
}

function updateSalaryLabel(paymentType) {
    const label = document.getElementById('net-salary-label');
    if (label) {
        label.innerText = `Salario Neto ${paymentType === 'quincenal' ? 'Quincenal' : 'Mensual'} * (₡)`;
    }
    const help = document.getElementById('net-salary-help');
    if (help) {
        help.innerText = `El sistema calculará automáticamente el salario bruto y las contribuciones ${paymentType === 'quincenal' ? 'quincenales' : 'mensuales'}`;
    }
}

// Cálculos salariales mejorados
function calculateEmployerContributions(grossSalary, paymentType) {
    const monthlySalary = paymentType === 'quincenal' ? grossSalary * 2 : grossSalary;
    
    return {
        ccss: monthlySalary * 0.2633,          // 26.33% CCSS Patronal
        ins: monthlySalary * 0.015,           // 1.50% INS Patronal  
        ina: monthlySalary * 0.015,           // 1.50% INA
        totalContributions: monthlySalary * (0.2633 + 0.015 + 0.015),
        totalCost: monthlySalary + (monthlySalary * (0.2633 + 0.015 + 0.015))
    };
}

function calculateGrossFromNet(netSalary, paymentType) {
    const monthlyNet = paymentType === 'quincenal' ? netSalary * 2 : netSalary;
    const grossSalary = monthlyNet / (1 - 0.1067 - 0.01); // 10.67% CCSS + 1% INS empleado
    return paymentType === 'quincenal' ? grossSalary / 2 : grossSalary;
}

function calculateAguinaldo(salary, paymentType, startDate) {
    if (!startDate) return 0;
    
    const monthlySalary = paymentType === 'quincenal' ? salary * 2 : salary;
    const now = new Date();
    const currentYear = now.getFullYear();
    
    const aguinaldoStart = new Date(currentYear - 1, 11, 1); // 1 diciembre año anterior
    const aguinaldoEnd = new Date(currentYear, 10, 30);     // 30 noviembre año actual
    const employeeStart = new Date(startDate);
    
    if (employeeStart > aguinaldoEnd) return 0;
    
    const acumulationStart = employeeStart > aguinaldoStart ? employeeStart : aguinaldoStart;
    const acumulationEnd = now < aguinaldoEnd ? now : aguinaldoEnd;
    
    const monthsWorked = (acumulationEnd.getFullYear() - acumulationStart.getFullYear()) * 12 + 
                       (acumulationEnd.getMonth() - acumulationStart.getMonth()) + 
                       (acumulationEnd.getDate() >= acumulationStart.getDate() ? 1 : 0);
    
    const aguinaldoMonths = Math.min(monthsWorked, 12);
    return (monthlySalary / 12) * aguinaldoMonths;
}

// Análisis de datos empresariales
function getCompanyMetrics() {
    const metrics = {};
    
    Object.keys(companies).forEach(companyName => {
        const companyEmployees = appState.employees.filter(emp => emp.company === companyName);
        
        let totalGrossSalary = 0;
        let totalNetSalary = 0;
        let totalEmployerCost = 0;
        let totalAguinaldo = 0;
        
        companyEmployees.forEach(emp => {
            const grossSalary = emp.net_salary ? 
                calculateGrossFromNet(emp.net_salary, emp.payment_type) * (emp.payment_type === 'quincenal' ? 2 : 1) :
                (emp.payment_type === 'quincenal' ? emp.salary * 2 : emp.salary);
            
            const contributions = calculateEmployerContributions(grossSalary, 'mensual');
            const aguinaldo = calculateAguinaldo(grossSalary, 'mensual', emp.start_date);
            
            totalGrossSalary += grossSalary;
            totalNetSalary += emp.net_salary ? (emp.payment_type === 'quincenal' ? emp.net_salary * 2 : emp.net_salary) : (grossSalary - (grossSalary * 0.1167));
            totalEmployerCost += contributions.totalCost;
            totalAguinaldo += aguinaldo;
        });
        
        metrics[companyName] = {
            employeeCount: companyEmployees.length,
            totalGrossSalary,
            totalNetSalary,
            totalEmployerCost,
            totalAguinaldo,
            totalContributions: totalEmployerCost - totalGrossSalary,
            averageSalary: companyEmployees.length > 0 ? totalGrossSalary / companyEmployees.length : 0,
            totalVacationDays: companyEmployees.reduce((sum, emp) => sum + (emp.available_vacations || 0), 0)
        };
    });
    
    return metrics;
}

function getOverallMetrics() {
    const companyMetrics = getCompanyMetrics();
    const totals = {
        totalEmployees: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalEmployerCost: 0,
        totalAguinaldo: 0,
        totalContributions: 0,
        totalVacationDays: 0,
        companiesActive: 0
    };
    
    Object.values(companyMetrics).forEach(metrics => {
        if (metrics.employeeCount > 0) {
            totals.companiesActive++;
        }
        totals.totalEmployees += metrics.employeeCount;
        totals.totalGrossSalary += metrics.totalGrossSalary;
        totals.totalNetSalary += metrics.totalNetSalary;
        totals.totalEmployerCost += metrics.totalEmployerCost;
        totals.totalAguinaldo += metrics.totalAguinaldo;
        totals.totalContributions += metrics.totalContributions;
        totals.totalVacationDays += metrics.totalVacationDays;
    });
    
    return totals;
}

// Cargar datos - MEJORADO con debugging
async function loadEmployees() {
    try {
        debugLog('Cargando empleados...');
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('name');
        
        debugLog('Respuesta de empleados:', { data, error });
        
        if (error) {
            console.error('Error cargando empleados:', error);
            throw error;
        }
        
        appState.employees = data || [];
        debugLog('Empleados cargados:', appState.employees.length);
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Error al cargar empleados: ' + error.message);
        appState.employees = [];
    }
}

async function loadVacationRequests() {
    try {
        debugLog('Cargando solicitudes de vacaciones...');
        const { data, error } = await supabase
            .from('vacation_requests')
            .select(`
                *,
                employee:employees!vacation_requests_employee_id_fkey(name, company),
                approver:employees!vacation_requests_approved_by_fkey(name)
            `)
            .order('created_at', { ascending: false });
        
        debugLog('Respuesta de solicitudes:', { data, error });
        
        if (error) {
            console.error('Error cargando solicitudes:', error);
            throw error;
        }
        
        appState.vacationRequests = data || [];
        debugLog('Solicitudes cargadas:', appState.vacationRequests.length);
    } catch (error) {
        console.error('Error loading vacation requests:', error);
        appState.vacationRequests = [];
    }
}

async function loadVacationHistory() {
    try {
        debugLog('Cargando historial de vacaciones...');
        const { data, error } = await supabase
            .from('vacation_history')
            .select(`
                *,
                employee:employees!vacation_history_employee_id_fkey(name, company),
                approver:employees!vacation_history_approved_by_fkey(name)
            `)
            .order('created_at', { ascending: false });
        
        debugLog('Respuesta de historial:', { data, error });
        
        if (error) {
            console.error('Error cargando historial:', error);
            throw error;
        }
        
        appState.vacationHistory = data || [];
        debugLog('Historial cargado:', appState.vacationHistory.length);
    } catch (error) {
        console.error('Error loading vacation history:', error);
        appState.vacationHistory = [];
    }
}

async function loadData() {
    appState.loading = true;
    await Promise.all([loadEmployees(), loadVacationRequests(), loadVacationHistory()]);
    appState.loading = false;
}
// Funciones de navegación - CORREGIDAS
function showDashboard() {
    appState.currentView = 'dashboard';
    appState.selectedCompany = null;
    appState.selectedEmployee = null;
    appState.editingEmployee = null;
    appState.showAddEmployee = false;
    render();
}

function showCompanyDetail(companyName) {
    appState.currentView = 'company';
    appState.selectedCompany = companyName;
    appState.selectedEmployee = null;
    appState.editingEmployee = null;
    appState.showAddEmployee = false;
    render();
}

function showEmployeeDetail(employeeId) {
    appState.currentView = 'employee';
    appState.selectedEmployee = appState.employees.find(emp => emp.id === employeeId);
    appState.editingEmployee = null;
    appState.showAddEmployee = false;
    render();
}

// FUNCIÓN CORREGIDA - Esta era la que faltaba
function showManagement() {
    appState.currentView = 'management';
    appState.selectedCompany = null;
    appState.selectedEmployee = null;
    appState.editingEmployee = null;
    appState.showAddEmployee = false;
    render();
}

function showAddEmployee() {
    appState.showAddEmployee = true;
    appState.editingEmployee = null;
    appState.currentView = 'management';
    render();
}

function editEmployee(employeeId) {
    appState.editingEmployee = appState.employees.find(emp => emp.id === employeeId);
    appState.showAddEmployee = false;
    appState.currentView = 'management';
    render();
}

function cancelEdit() {
    appState.editingEmployee = null;
    appState.showAddEmployee = false;
    if (appState.currentView === 'management') {
        render();
    } else {
        showManagement();
    }
}

function previewEmployee(employeeId) {
    appState.previewEmployee = appState.employees.find(emp => emp.id === employeeId);
    render();
}

function exitEmployeePreview() {
    appState.previewEmployee = null;
    render();
}

// Autenticación con Google
async function handleGoogleLogin() {
    try {
        const currentUrl = window.location.href;
        
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { 
                redirectTo: currentUrl
            }
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión con Google: ' + error.message);
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        appState.currentUser = null;
        appState.isLoggedIn = false;
        appState.currentView = 'dashboard';
        render();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión: ' + error.message);
    }
}

// Inicialización de autenticación
async function initializeAuth() {
    try {
        render();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
            try {
                const { data: employee, error: empError } = await supabase
                    .from('employees')
                    .select('*')
                    .eq('email', session.user.email.toLowerCase())
                    .single();
                
                if (!empError && employee) {
                    appState.currentUser = employee;
                    appState.isLoggedIn = true;
                    
                    if (employee.role === 'admin') {
                        await loadData();
                    } else {
                        appState.loading = false;
                    }
                } else {
                    debugLog('Empleado no encontrado para email:', session.user.email);
                    await supabase.auth.signOut();
                }
            } catch (error) {
                console.error('Error loading employee:', error);
                await supabase.auth.signOut();
            }
        } else {
            appState.authInitialized = true;
            appState.loading = false;
        }
        
        render();
    } catch (error) {
        console.error('Error initializing auth:', error);
        appState.authInitialized = true;
        appState.loading = false;
        appState.isLoggedIn = false;
        render();
    }
}

supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
        appState.isLoggedIn = false;
        appState.currentUser = null;
        appState.loading = false;
        appState.authInitialized = true;
        render();
        return;
    }
    
    if (event === 'SIGNED_IN' && session?.user) {
        try {
            const { data: employee, error } = await supabase
                .from('employees')
                .select('*')
                .eq('email', session.user.email.toLowerCase())
                .single();
            
            if (error || !employee) {
                alert(`Acceso denegado. Email no autorizado: ${session.user.email}`);
                await supabase.auth.signOut();
                return;
            }
            
            appState.currentUser = employee;
            appState.isLoggedIn = true;
            await loadData();
        } catch (error) {
            console.error('Error loading user data:', error);
            await supabase.auth.signOut();
        }
    }
    
    appState.authInitialized = true;
    render();
});

export {
    supabase,
    supabaseUrl,
    supabaseKey,
    appState,
    companies,
    debugLog,
    formatCurrency,
    formatDate,
    getAvatarByGender,
    updateSalaryLabel,
    calculateEmployerContributions,
    calculateGrossFromNet,
    calculateAguinaldo,
    getCompanyMetrics,
    getOverallMetrics,
    loadEmployees,
    loadVacationRequests,
    loadVacationHistory,
    loadData,
    showDashboard,
    showCompanyDetail,
    showEmployeeDetail,
    showManagement,
    showAddEmployee,
    editEmployee,
    cancelEdit,
    previewEmployee,
    exitEmployeePreview,
    handleGoogleLogin,
    handleLogout,
    initializeAuth
};
