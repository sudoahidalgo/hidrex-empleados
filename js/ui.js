import { saveEmployee, deleteEmployee, testConnection, approveRequest, rejectRequest } from "./vacations.js";
import * as auth from "./auth.js";
// Renderizado de componentes
function renderTopNavigation() {
    if (auth.appState.currentUser?.role !== 'admin') return '';
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bar-chart-3' },
        { id: 'management', label: 'Gestión', icon: 'users' }
    ];
    
    return `
        <nav class="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span class="text-white font-bold text-lg">H</span>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold gradient-text">Hidrex Capital</h1>
                                <p class="text-xs text-gray-500">Sistema Empresarial</p>
                            </div>
                        </div>
                        
                        <div class="hidden md:flex space-x-1 ml-8">
                            ${navItems.map(item => `
                                <button
                                    onclick="show${item.id.charAt(0).toUpperCase() + item.id.slice(1)}()"
                                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        auth.appState.currentView === item.id || 
                                        (item.id === 'dashboard' && ['dashboard', 'company', 'employee'].includes(auth.appState.currentView))
                                            ? 'bg-blue-100 text-blue-700 shadow-sm' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }"
                                >
                                    <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                                    <span>${item.label}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-3">
                            <img 
                                src="${auth.appState.currentUser.photo_url || auth.getAvatarByGender(auth.appState.currentUser.gender)}" 
                                alt="${auth.appState.currentUser.name}"
                                class="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            />
                            <div class="hidden md:block">
                                <p class="text-sm font-medium text-gray-900">${auth.appState.currentUser.name}</p>
                                <div class="flex items-center space-x-2">
                                    <p class="text-xs text-gray-500">Administrador</p>
                                    <div class="w-2 h-2 bg-green-500 rounded-full" title="Base de datos conectada"></div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onclick="auth.handleLogout()"
                            class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <i data-lucide="log-out" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

function renderMetricsOverview() {
    const metrics = auth.getOverallMetrics();
    const pendingRequests = auth.appState.vacationRequests.filter(r => r.status === 'pending').length;
    
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Empleados -->
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Total Empleados</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">${metrics.totalEmployees}</p>
                        <p class="text-sm text-green-600 mt-1">en ${metrics.companiesActive} empresas</p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="users" class="w-6 h-6 text-white"></i>
                    </div>
                </div>
            </div>
            
            <!-- Costo Total Mensual -->
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Costo Total Mensual</p>
                        <p class="text-2xl font-bold text-gray-900 mt-2">${auth.formatCurrency(metrics.totalEmployerCost)}</p>
                        <p class="text-sm text-red-600 mt-1">incluye cargas sociales</p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="trending-up" class="w-6 h-6 text-white"></i>
                    </div>
                </div>
            </div>
            
            <!-- Salarios Netos -->
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Salarios Netos</p>
                        <p class="text-2xl font-bold text-gray-900 mt-2">${auth.formatCurrency(metrics.totalNetSalary)}</p>
                        <p class="text-sm text-blue-600 mt-1">pagados mensuales</p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="dollar-sign" class="w-6 h-6 text-white"></i>
                    </div>
                </div>
            </div>
            
            <!-- Solicitudes Pendientes -->
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                        <p class="text-3xl font-bold text-gray-900 mt-2">${pendingRequests}</p>
                        <p class="text-sm text-orange-600 mt-1">requieren atención</p>
                    </div>
                    <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center relative">
                        <i data-lucide="calendar-clock" class="w-6 h-6 text-white"></i>
                        ${pendingRequests > 0 ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full pulse-dot"></div>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompaniesGrid() {
    const companyMetrics = auth.getCompanyMetrics();
    
    return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            ${Object.entries(companies).map(([companyName, companyInfo]) => {
                const metrics = companyMetrics[companyName];
                const hasEmployees = metrics.employeeCount > 0;
                
                return `
                    <div class="company-card bg-white rounded-2xl p-6 shadow-xl border border-white/20 cursor-pointer ${hasEmployees ? 'hover:shadow-2xl' : 'opacity-60'}" 
                         ${hasEmployees ? `onclick="auth.showCompanyDetail('${companyName}')"` : ''}>
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-12 h-12 bg-gradient-to-r ${companyInfo.color} rounded-xl flex items-center justify-center text-xl">
                                    ${companyInfo.icon}
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900">${companyInfo.shortName}</h3>
                                    <p class="text-sm text-gray-500">${companyInfo.sector}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="flex items-center space-x-2">
                                    <span class="text-2xl font-bold text-gray-900">${metrics.employeeCount}</span>
                                    <i data-lucide="users" class="w-5 h-5 text-gray-400"></i>
                                </div>
                                <p class="text-sm text-gray-500">empleados</p>
                            </div>
                        </div>
                        
                        ${hasEmployees ? `
                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Costo Total Mensual:</span>
                                    <span class="font-bold text-red-600">${auth.formatCurrency(metrics.totalEmployerCost)}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Salarios Netos Mensuales:</span>
                                    <span class="font-bold text-green-600">${auth.formatCurrency(metrics.totalNetSalary)}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Contribuciones Mensuales:</span>
                                    <span class="font-bold text-blue-600">${auth.formatCurrency(metrics.totalContributions)}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div class="bg-gradient-to-r ${companyInfo.color} h-2 rounded-full" 
                                         style="width: ${(metrics.totalEmployerCost / auth.getOverallMetrics().totalEmployerCost * 100)}%"></div>
                                </div>
                                <p class="text-xs text-gray-500 text-center">
                                    ${((metrics.totalEmployerCost / auth.getOverallMetrics().totalEmployerCost) * 100).toFixed(1)}% del costo total
                                </p>
                            </div>
                        ` : `
                            <div class="text-center py-8">
                                <i data-lucide="building" class="w-12 h-12 text-gray-300 mx-auto mb-3"></i>
                                <p class="text-gray-400">Sin empleados activos</p>
                            </div>
                        `}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderCostBreakdown() {
    const metrics = auth.getOverallMetrics();
    const monthlyCCSS = auth.appState.employees.reduce((sum, emp) => {
        const grossSalary = emp.net_salary ? 
            auth.calculateGrossFromNet(emp.net_salary, emp.payment_type) * (emp.payment_type === 'quincenal' ? 2 : 1) :
            (emp.payment_type === 'quincenal' ? emp.salary * 2 : emp.salary);
        return sum + (grossSalary * 0.2633);
    }, 0);
    
    const monthlyINS = auth.appState.employees.reduce((sum, emp) => {
        const grossSalary = emp.net_salary ? 
            auth.calculateGrossFromNet(emp.net_salary, emp.payment_type) * (emp.payment_type === 'quincenal' ? 2 : 1) :
            (emp.payment_type === 'quincenal' ? emp.salary * 2 : emp.salary);
        return sum + (grossSalary * 0.015);
    }, 0);
    
    const monthlyINA = auth.appState.employees.reduce((sum, emp) => {
        const grossSalary = emp.net_salary ? 
            auth.calculateGrossFromNet(emp.net_salary, emp.payment_type) * (emp.payment_type === 'quincenal' ? 2 : 1) :
            (emp.payment_type === 'quincenal' ? emp.salary * 2 : emp.salary);
        return sum + (grossSalary * 0.015);
    }, 0);
    
    return `
        <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
            <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <i data-lucide="pie-chart" class="w-6 h-6 mr-3 text-blue-600"></i>
                Desglose de Costos Laborales
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Costos Mensuales -->
                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-700">Costos Mensuales</h4>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span class="text-sm font-medium text-green-800">Salarios Brutos</span>
                            <span class="font-bold text-green-700">${auth.formatCurrency(metrics.totalGrossSalary)}</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span class="text-sm font-medium text-red-800">CCSS Patronal (26.33%)</span>
                            <span class="font-bold text-red-700">${auth.formatCurrency(monthlyCCSS)}</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span class="text-sm font-medium text-blue-800">INS Patronal (1.5%)</span>
                            <span class="font-bold text-blue-700">${auth.formatCurrency(monthlyINS)}</span>
                        </div>
                        
                        <div class="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span class="text-sm font-medium text-purple-800">INA (1.5%)</span>
                            <span class="font-bold text-purple-700">${auth.formatCurrency(monthlyINA)}</span>
                        </div>
                        
                        <div class="border-t-2 border-gray-200 pt-3">
                            <div class="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                                <span class="text-sm font-bold text-white">Costo Total Mensual</span>
                                <span class="font-bold text-xl text-white">${auth.formatCurrency(metrics.totalEmployerCost)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Proyecciones Anuales -->
                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-700">Proyección Anual</h4>
                    
                    <div class="space-y-3">
                        <div class="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                            <p class="text-sm opacity-90">Costo Anual (sin aguinaldo)</p>
                            <p class="text-2xl font-bold">${auth.formatCurrency(metrics.totalEmployerCost * 12)}</p>
                        </div>
                        
                        <div class="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white">
                            <p class="text-sm opacity-90">Aguinaldo Total</p>
                            <p class="text-2xl font-bold">${auth.formatCurrency(metrics.totalAguinaldo)}</p>
                        </div>
                        
                        <div class="p-4 bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl text-white">
                            <p class="text-sm opacity-90">Costo Total Anual</p>
                            <p class="text-2xl font-bold">${auth.formatCurrency((metrics.totalEmployerCost * 12) + metrics.totalAguinaldo)}</p>
                        </div>
                    </div>
                    
                    <div class="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p class="text-xs text-yellow-800">
                            <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
                            Incluye todas las contribuciones patronales obligatorias de Costa Rica
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCompanyDetail() {
    const companyName = auth.appState.selectedCompany;
    const companyInfo = companies[companyName];
    const companyEmployees = auth.appState.employees.filter(emp => emp.company === companyName);
    const metrics = auth.getCompanyMetrics()[companyName];
    
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Header de la empresa -->
            <div class="flex items-center justify-between mb-8">
                <button 
                    onclick="auth.showDashboard()" 
                    class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                    Volver al Dashboard
                </button>
            </div>
            
            <div class="bg-white rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-16 h-16 bg-gradient-to-r ${companyInfo.color} rounded-2xl flex items-center justify-center text-2xl">
                        ${companyInfo.icon}
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">${companyInfo.name}</h1>
                        <p class="text-lg text-gray-600">${companyInfo.sector}</p>
                    </div>
                </div>
                
                <!-- Métricas de la empresa -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="text-center p-4 bg-blue-50 rounded-xl">
                        <p class="text-sm text-blue-600 font-medium">Empleados</p>
                        <p class="text-3xl font-bold text-blue-700">${metrics.employeeCount}</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-xl">
                        <p class="text-sm text-green-600 font-medium">Salario Promedio Mensual</p>
                        <p class="text-xl font-bold text-green-700">${auth.formatCurrency(metrics.averageSalary)}</p>
                    </div>
                    <div class="text-center p-4 bg-red-50 rounded-xl">
                        <p class="text-sm text-red-600 font-medium">Costo Total Mensual</p>
                        <p class="text-xl font-bold text-red-700">${auth.formatCurrency(metrics.totalEmployerCost)}</p>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-xl">
                        <p class="text-sm text-purple-600 font-medium">Días Vacaciones</p>
                        <p class="text-3xl font-bold text-purple-700">${metrics.totalVacationDays}</p>
                    </div>
                </div>
            </div>
            
            <!-- Lista de empleados de la empresa -->
            <div class="bg-white rounded-2xl shadow-xl border border-white/20">
                <div class="p-6 border-b border-gray-200">
                    <h2 class="text-xl font-bold text-gray-900">Empleados de ${companyInfo.shortName}</h2>
                </div>
                
                <div class="p-6">
                    ${companyEmployees.length === 0 ? `
                        <div class="text-center py-12">
                            <i data-lucide="user-x" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                            <p class="text-gray-500 text-lg">No hay empleados en esta empresa</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            ${companyEmployees.map(employee => {
                                const grossSalary = employee.net_salary ? 
                                    auth.calculateGrossFromNet(employee.net_salary, employee.payment_type) * (employee.payment_type === 'quincenal' ? 2 : 1) :
                                    (employee.payment_type === 'quincenal' ? employee.salary * 2 : employee.salary);
                                const contributions = calculateEmployerContributions(grossSalary, 'mensual');
                                
                                return `
                                    <div class="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                                         onclick="auth.showEmployeeDetail(${employee.id})">
                                        <div class="flex items-center space-x-4 mb-4">
                                            <img 
                                                src="${employee.photo_url || auth.getAvatarByGender(employee.gender)}" 
                                                alt="${employee.name}"
                                                class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div>
                                                <h3 class="font-bold text-gray-900">${employee.name}</h3>
                                                <p class="text-sm text-gray-600">${employee.position || 'Sin puesto definido'}</p>
                                            </div>
                                        </div>
                                        
                                        <div class="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p class="text-gray-500">Salario Neto ${employee.payment_type === 'quincenal' ? 'Quincenal' : 'Mensual'}:</p>
                                                <p class="font-bold text-green-600">${auth.formatCurrency(employee.net_salary || (grossSalary * 0.8833))}</p>
                                            </div>
                                            <div>
                                                <p class="text-gray-500">Costo Total Mensual:</p>
                                                <p class="font-bold text-red-600">${auth.formatCurrency(contributions.totalCost)}</p>
                                            </div>
                                            <div>
                                                <p class="text-gray-500">Vacaciones:</p>
                                                <p class="font-bold text-blue-600">${employee.available_vacations || 0} días</p>
                                            </div>
                                            <div>
                                                <p class="text-gray-500">Antigüedad:</p>
                                                <p class="font-bold text-purple-600">
                                                    ${employee.start_date ? 
                                                        Math.floor((new Date() - new Date(employee.start_date)) / (365.25 * 24 * 60 * 60 * 1000)) + ' años' 
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

function renderEmployeeDetail() {
    const employee = auth.appState.selectedEmployee;
    if (!employee) return '<div>Empleado no encontrado</div>';
    
    const grossSalary = employee.net_salary ? 
        auth.calculateGrossFromNet(employee.net_salary, employee.payment_type) * (employee.payment_type === 'quincenal' ? 2 : 1) :
        (employee.payment_type === 'quincenal' ? employee.salary * 2 : employee.salary);
    const contributions = calculateEmployerContributions(grossSalary, 'mensual');
    const aguinaldo = calculateAguinaldo(grossSalary, 'mensual', employee.start_date);
    
    // Histórico de vacaciones del empleado
    const employeeVacations = auth.appState.vacationHistory.filter(v => v.employee_id === employee.id);
    const employeeRequests = auth.appState.vacationRequests.filter(r => r.employee_id === employee.id);
    
    return `
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-8">
                <button 
                    onclick="auth.showDashboard()" 
                    class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i>
                    Volver al Dashboard
                </button>
                
                <div class="flex space-x-2">
                    ${auth.appState.currentUser?.role === 'admin' ? `
                    <button
                        onclick="auth.previewEmployee(${employee.id})"
                        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                    >
                        <i data-lucide="eye" class="w-4 h-4"></i>
                        <span>Ver vista de empleado</span>
                    </button>
                    ` : ''}
                    <button
                        onclick="auth.editEmployee(${employee.id})"
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <i data-lucide="edit" class="w-4 h-4"></i>
                        <span>Editar</span>
                    </button>
                </div>
            </div>
            
            <!-- Perfil del empleado -->
            <div class="bg-white rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
                <div class="flex items-start space-x-6 mb-8">
                    <img 
                        src="${employee.photo_url || auth.getAvatarByGender(employee.gender)}" 
                        alt="${employee.name}"
                        class="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">${employee.name}</h1>
                        <p class="text-xl text-gray-600 mb-4">${employee.position || 'Sin puesto definido'}</p>
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                            <span class="flex items-center space-x-1">
                                <i data-lucide="building" class="w-4 h-4"></i>
                                <span>${companies[employee.company]?.shortName || employee.company}</span>
                            </span>
                            <span class="flex items-center space-x-1">
                                <i data-lucide="calendar" class="w-4 h-4"></i>
                                <span>Desde ${auth.formatDate(employee.start_date)}</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Información personal -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="p-4 bg-blue-50 rounded-xl">
                        <h3 class="font-semibold text-blue-900 mb-2">Información Personal</h3>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-blue-600">Documento:</span> ${employee.cedula}</div>
                            <div><span class="text-blue-600">Email:</span> ${employee.email || 'No registrado'}</div>
                            <div><span class="text-blue-600">Género:</span> ${employee.gender}</div>
                        </div>
                    </div>
                    
                    <div class="p-4 bg-green-50 rounded-xl">
                        <h3 class="font-semibold text-green-900 mb-2">Información Laboral</h3>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-green-600">Tipo de Pago:</span> ${employee.payment_type}</div>
                            <div><span class="text-green-600">Jefe Directo:</span> ${employee.manager || 'Adrian Hidalgo'}</div>
                            <div><span class="text-green-600">Antigüedad:</span> 
                                ${employee.start_date ? 
                                    Math.floor((new Date() - new Date(employee.start_date)) / (365.25 * 24 * 60 * 60 * 1000)) + ' años' 
                                    : 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-4 bg-purple-50 rounded-xl">
                        <h3 class="font-semibold text-purple-900 mb-2">Vacaciones</h3>
                        <div class="space-y-2 text-sm">
                            <div><span class="text-purple-600">Disponibles:</span> ${employee.available_vacations || 0} días</div>
                            <div><span class="text-purple-600">Utilizadas:</span> ${employeeVacations.reduce((sum, v) => sum + v.days, 0)} días</div>
                            <div><span class="text-purple-600">Pendientes:</span> ${employeeRequests.filter(r => r.status === 'pending').length} solicitudes</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Detalles financieros -->
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20 mb-8">
                <h2 class="text-xl font-bold text-gray-900 mb-6">Detalles Financieros</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Salarios -->
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-4">Desglose Salarial (Mensual)</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between p-3 bg-gray-50 rounded-lg">
                                <span class="text-gray-600">Salario Bruto:</span>
                                <span class="font-bold">${auth.formatCurrency(grossSalary)}</span>
                            </div>
                            <div class="flex justify-between p-3 bg-red-50 rounded-lg">
                                <span class="text-red-600">CCSS Empleado (10.67%):</span>
                                <span class="font-bold text-red-700">-${auth.formatCurrency(grossSalary * 0.1067)}</span>
                            </div>
                            <div class="flex justify-between p-3 bg-red-50 rounded-lg">
                                <span class="text-red-600">INS Empleado (1%):</span>
                                <span class="font-bold text-red-700">-${auth.formatCurrency(grossSalary * 0.01)}</span>
                            </div>
                            <div class="flex justify-between p-3 bg-green-50 rounded-lg border-2 border-green-200">
                                <span class="text-green-800 font-bold">Salario Neto Mensual:</span>
                                <span class="font-bold text-green-700 text-lg">${auth.formatCurrency(employee.net_salary || (grossSalary * 0.8833))}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Costos patronales -->
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-4">Costos Patronales (Mensual)</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between p-3 bg-blue-50 rounded-lg">
                                <span class="text-blue-600">CCSS Patronal (26.33%):</span>
                                <span class="font-bold text-blue-700">${auth.formatCurrency(contributions.ccss)}</span>
                            </div>
                            <div class="flex justify-between p-3 bg-purple-50 rounded-lg">
                                <span class="text-purple-600">INS Patronal (1.5%):</span>
                                <span class="font-bold text-purple-700">${auth.formatCurrency(contributions.ins)}</span>
                            </div>
                            <div class="flex justify-between p-3 bg-orange-50 rounded-lg">
                                <span class="text-orange-600">INA (1.5%):</span>
                                <span class="font-bold text-orange-700">${auth.formatCurrency(contributions.ina)}</span>
                            </div>
                            <div class="flex justify-between p-3 bg-gray-900 rounded-lg">
                                <span class="text-white font-bold">Costo Total Mensual:</span>
                                <span class="font-bold text-white text-lg">${auth.formatCurrency(contributions.totalCost)}</span>
                            </div>
                        </div>
                        
                        <div class="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-white">
                            <h4 class="font-bold mb-2">Aguinaldo Acumulado</h4>
                            <p class="text-2xl font-bold">${auth.formatCurrency(aguinaldo)}</p>
                            <p class="text-sm opacity-90">Período: Dic - Nov</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Historial de vacaciones -->
            ${employeeVacations.length > 0 ? `
                <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20">
                    <h2 class="text-xl font-bold text-gray-900 mb-6">Historial de Vacaciones</h2>
                    <div class="space-y-3">
                        ${employeeVacations.slice(0, 5).map(vacation => `
                            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span class="font-medium">${auth.formatDate(vacation.start_date)} - ${auth.formatDate(vacation.end_date)}</span>
                                    <span class="text-sm text-gray-500 ml-2">(${vacation.days} días)</span>
                                </div>
                                <span class="text-sm text-green-600 font-medium">Aprobada</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderEmployeePreview(employee) {
    return `
        <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
            <nav class="bg-white/80 backdrop-blur-lg border-b border-white/20">
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex items-center justify-between h-16">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span class="text-white font-bold text-lg">H</span>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold gradient-text">Hidrex Capital</h1>
                                <p class="text-xs text-gray-500">Mi Perfil</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <button
                                onclick="auth.exitEmployeePreview()"
                                class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <i data-lucide="arrow-left" class="w-5 h-5"></i>
                            </button>
                            <div class="flex items-center space-x-3">
                                <img
                                    src="${employee.photo_url || auth.getAvatarByGender(employee.gender)}"
                                    alt="${employee.name}"
                                    class="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                />
                                <div class="hidden md:block">
                                    <p class="text-sm font-medium text-gray-900">${employee.name}</p>
                                    <p class="text-xs text-gray-500">Empleado</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="bg-white rounded-3xl p-8 shadow-xl border border-white/20">
                    <div class="text-center mb-8">
                        <img
                            src="${employee.photo_url || auth.getAvatarByGender(employee.gender)}"
                            alt="${employee.name}"
                            class="w-24 h-24 rounded-2xl mx-auto object-cover border-4 border-white shadow-lg mb-4"
                        />
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">${employee.name}</h1>
                        <p class="text-xl text-gray-600">${employee.position || 'Empleado'}</p>
                        <p class="text-sm text-gray-500 mt-2">${companies[employee.company]?.name || employee.company}</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="p-6 bg-blue-50 rounded-2xl">
                            <h3 class="text-lg font-bold text-blue-900 mb-4">Información Personal</h3>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-sm text-blue-600 font-medium">Email</p>
                                    <p class="text-gray-900">${employee.email || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-blue-600 font-medium">Documento</p>
                                    <p class="text-gray-900">${employee.cedula}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-blue-600 font-medium">Fecha de Ingreso</p>
                                    <p class="text-gray-900">${employee.start_date ? auth.formatDate(employee.start_date) : 'No registrado'}</p>
                                </div>
                            </div>
                        </div>

                        <div class="p-6 bg-green-50 rounded-2xl">
                            <h3 class="text-lg font-bold text-green-900 mb-4">Información Laboral</h3>
                            <div class="space-y-3">
                                <div>
                                    <p class="text-sm text-green-600 font-medium">Jefe Directo</p>
                                    <p class="text-gray-900">${employee.manager || 'Adrian Hidalgo'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-green-600 font-medium">Tipo de Pago</p>
                                    <p class="text-gray-900 capitalize">${employee.payment_type || 'Mensual'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-green-600 font-medium">Días de Vacaciones</p>
                                    <p class="text-2xl font-bold text-green-700">${employee.available_vacations || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl text-white text-center">
                        <h3 class="text-lg font-bold mb-2">¿Necesitas solicitar vacaciones?</h3>
                        <p class="text-purple-100 mb-4">Contacta a tu jefe directo o administrador para gestionar tus solicitudes</p>
                        <div class="flex items-center justify-center space-x-2 text-purple-200">
                            <i data-lucide="mail" class="w-4 h-4"></i>
                            <span class="text-sm">Administración: admin@hidrexcapital.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderEmployeeManagement() {
    if (auth.appState.editingEmployee || auth.appState.auth.showAddEmployee) {
        return renderEmployeeForm();
    }
    
    const pendingRequests = auth.appState.vacationRequests.filter(r => r.status === 'pending');
    
    return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Gestión de Empleados</h1>
                <div class="flex space-x-3">
                    <button 
                        onclick="testConnection()"
                        class="bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                        <i data-lucide="wifi" class="w-5 h-5"></i>
                        <span>Test BD</span>
                    </button>
                    <button 
                        onclick="auth.showAddEmployee()"
                        class="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
                    >
                        <i data-lucide="user-plus" class="w-5 h-5"></i>
                        <span>Agregar Empleado</span>
                    </button>
                </div>
            </div>
            
            <!-- Solicitudes pendientes -->
            ${pendingRequests.length > 0 ? `
                <div class="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
                    <h2 class="text-xl font-bold text-orange-900 mb-4 flex items-center">
                        <i data-lucide="alert-circle" class="w-6 h-6 mr-3"></i>
                        Solicitudes Pendientes (${pendingRequests.length})
                    </h2>
                    <div class="space-y-3">
                        ${pendingRequests.map(request => `
                            <div class="bg-white p-4 rounded-xl border border-orange-200">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-bold text-gray-900">${request.employee?.name || 'N/A'}</h3>
                                        <p class="text-sm text-gray-600">${companies[request.employee?.company]?.shortName || request.employee?.company}</p>
                                        <p class="text-sm text-gray-500 mt-1">
                                            ${auth.formatDate(request.start_date)} - ${auth.formatDate(request.end_date)} (${request.days} días)
                                        </p>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button 
                                            onclick="approveRequest(${request.id})"
                                            class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
                                        >
                                            Aprobar
                                        </button>
                                        <button 
                                            onclick="rejectRequest(${request.id})"
                                            class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                        >
                                            Rechazar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Lista de empleados por empresa -->
            ${Object.entries(companies).map(([companyName, companyInfo]) => {
                const companyEmployees = auth.appState.employees.filter(emp => emp.company === companyName);
                if (companyEmployees.length === 0) return '';
                
                return `
                    <div class="bg-white rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="w-10 h-10 bg-gradient-to-r ${companyInfo.color} rounded-xl flex items-center justify-center text-lg">
                                ${companyInfo.icon}
                            </div>
                            <h2 class="text-xl font-bold text-gray-900">${companyInfo.name}</h2>
                            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                ${companyEmployees.length} empleado${companyEmployees.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${companyEmployees.map(employee => `
                                <div class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center space-x-3 mb-3">
                                        <img 
                                            src="${employee.photo_url || auth.getAvatarByGender(employee.gender)}" 
                                            alt="${employee.name}"
                                            class="w-10 h-10 rounded-full object-cover border-2 border-white"
                                        />
                                        <div>
                                            <h3 class="font-bold text-gray-900">${employee.name}</h3>
                                            <p class="text-xs text-gray-500">${employee.position || 'Sin puesto'}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="text-xs text-gray-600 space-y-1 mb-3">
                                        <div>Salario: ${auth.formatCurrency(employee.net_salary || 0)}</div>
                                        <div>Vacaciones: ${employee.available_vacations || 0} días</div>
                                    </div>
                                    
                                    <div class="flex space-x-2">
                                        <button 
                                            onclick="auth.showEmployeeDetail(${employee.id})"
                                            class="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                                        >
                                            Ver Detalle
                                        </button>
                                        <button 
                                            onclick="auth.editEmployee(${employee.id})"
                                            class="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-xs"
                                        >
                                            <i data-lucide="edit" class="w-3 h-3"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderEmployeeForm() {
    const employee = auth.appState.editingEmployee;
    const isEdit = !!employee;
    
    return `
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-8">
                <h1 class="text-3xl font-bold text-gray-900">
                    ${isEdit ? `Editar: ${employee.name}` : 'Nuevo Empleado'}
                </h1>
                <button 
                    onclick="auth.cancelEdit()"
                    class="text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="bg-white rounded-2xl p-8 shadow-xl border border-white/20">
                <form onsubmit="saveEmployee(event)" class="space-y-8">
                    <!-- Foto de perfil -->
                    <div class="text-center">
                        <img 
                            id="preview-photo"
                            src="${employee?.photo_url || auth.getAvatarByGender(employee?.gender || 'masculino')}" 
                            alt="Foto de perfil"
                            class="w-32 h-32 rounded-2xl mx-auto object-cover border-4 border-gray-200 mb-4"
                        />
                        <div class="max-w-md mx-auto">
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL de Foto (Opcional)</label>
                            <input
                                name="photo_url"
                                type="url"
                                value="${employee?.photo_url || ''}"
                                placeholder="https://ejemplo.com/foto.jpg"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onchange="document.getElementById('preview-photo').src = this.value || '${auth.getAvatarByGender(employee?.gender || 'masculino')}'"
                            />
                        </div>
                    </div>

                    <!-- Información personal -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                                <input name="name" type="text" value="${employee?.name || ''}" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email Corporativo *</label>
                                <input name="email" type="email" value="${employee?.email || ''}"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="text-xs text-gray-500 mt-1">Para acceso al sistema</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Documento de Identidad *</label>
                                <input name="cedula" type="text" value="${employee?.cedula || ''}" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                                <select name="document_type" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="costarricense" ${employee?.document_type === 'costarricense' ? 'selected' : ''}>Cédula de Costa Rica</option>
                                    <option value="nicaraguense" ${employee?.document_type === 'nicaraguense' ? 'selected' : ''}>Cédula de Nicaragua</option>
                                    <option value="migratorio" ${employee?.document_type === 'migratorio' ? 'selected' : ''}>Documento Migratorio CR</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Género</label>
                                <select name="gender" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        onchange="document.getElementById('preview-photo').src = document.querySelector('[name=photo_url]').value || auth.getAvatarByGender(this.value)">
                                    <option value="masculino" ${employee?.gender === 'masculino' ? 'selected' : ''}>Masculino</option>
                                    <option value="femenino" ${employee?.gender === 'femenino' ? 'selected' : ''}>Femenino</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Información laboral -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
                                <select name="company" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    ${Object.entries(companies).map(([companyName, companyInfo]) => `
                                        <option value="${companyName}" ${employee?.company === companyName ? 'selected' : ''}>
                                            ${companyInfo.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Puesto de Trabajo</label>
                                <input name="position" type="text" value="${employee?.position || ''}" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Ingreso *</label>
                                <input name="start_date" type="date" value="${employee?.start_date || ''}" required 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago</label>
                                <select name="payment_type" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="auth.updateSalaryLabel(this.value)">
                                    <option value="mensual" ${employee?.payment_type === 'mensual' ? 'selected' : ''}>Mensual</option>
                                    <option value="quincenal" ${employee?.payment_type === 'quincenal' ? 'selected' : ''}>Quincenal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Información salarial -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Salarial</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label id="net-salary-label" class="block text-sm font-medium text-gray-700 mb-2">Salario Neto ${employee?.payment_type === 'quincenal' ? 'Quincenal' : 'Mensual'} * (₡)</label>
                                <input name="net_salary" type="number" step="0.01" min="0" value="${employee?.net_salary || ''}" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p id="net-salary-help" class="text-xs text-green-600 mt-1">El sistema calculará automáticamente el salario bruto y las contribuciones ${employee?.payment_type === 'quincenal' ? 'quincenales' : 'mensuales'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Días de Vacaciones Disponibles</label>
                                <input name="available_vacations" type="number" step="0.5" value="${employee?.available_vacations || 12}" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                <p class="text-xs text-gray-500 mt-1">Puede incluir medios días (ej: 8.5)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="flex space-x-4 pt-6 border-t border-gray-200">
                        <button type="submit" 
                                class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium">
                            ${isEdit ? 'Actualizar Empleado' : 'Crear Empleado'}
                        </button>
                        <button type="button" onclick="auth.cancelEdit()" 
                                class="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl hover:bg-gray-600 transition-colors font-medium">
                            Cancelar
                        </button>
                        ${isEdit ? `
                            <button type="button" onclick="deleteEmployee(${employee.id})" 
                                    class="bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition-colors font-medium">
                                Eliminar
                            </button>
                        ` : ''}
                    </div>
                </form>
            </div>
        </div>

// Función principal de renderizado
function render() {
    const app = document.getElementById('app');
    
    if (auth.appState.loading || !auth.appState.authInitialized) {
        app.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center">
                <div class="text-center">
                    <div class="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                        <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                    <p class="text-gray-600 font-medium">Cargando Hidrex Capital...</p>
                </div>
            </div>
        `;
        return;
    }
    
    if (!auth.appState.isLoggedIn) {
        app.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center p-4">
                <div class="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span class="text-3xl font-bold text-white">H</span>
                        </div>
                        <h1 class="text-3xl font-bold gradient-text mb-2">Hidrex Capital</h1>
                        <p class="text-gray-600 font-medium">Sistema de Gestión</p>
                        <p class="text-sm text-gray-500 mt-2">Empleados y recursos humanos</p>
                    </div>
                    
                    <button
                        onclick="auth.handleGoogleLogin()"
                        class="w-full bg-white border-2 border-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center space-x-3 hover:border-blue-300"
                    >
                        <img src="https://www.svgrepo.com/show/355037/google.svg" class="w-6 h-6" alt="Google"/>
                        <span>Iniciar sesión con Google</span>
                    </button>
                    
                    <div class="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p class="text-xs text-blue-700 text-center">
                            <i data-lucide="shield-check" class="w-4 h-4 inline mr-1"></i>
                            Acceso exclusivo para empleados autorizados
                        </p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    if (auth.appState.auth.previewEmployee) {
        app.innerHTML = renderEmployeePreview(auth.appState.auth.previewEmployee);
        lucide.createIcons();
        return;
    }

    // Verificar si el usuario es admin o empleado regular
    if (auth.appState.currentUser?.role !== 'admin') {
        // Vista para empleados regulares
        app.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
                <!-- Header simple para empleados -->
                <nav class="bg-white/80 backdrop-blur-lg border-b border-white/20">
                    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex items-center justify-between h-16">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <span class="text-white font-bold text-lg">H</span>
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold gradient-text">Hidrex Capital</h1>
                                    <p class="text-xs text-gray-500">Mi Perfil</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center space-x-3">
                                    <img 
                                        src="${auth.appState.currentUser.photo_url || auth.getAvatarByGender(auth.appState.currentUser.gender)}" 
                                        alt="${auth.appState.currentUser.name}"
                                        class="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                    />
                                    <div class="hidden md:block">
                                        <p class="text-sm font-medium text-gray-900">${auth.appState.currentUser.name}</p>
                                        <p class="text-xs text-gray-500">Empleado</p>
                                    </div>
                                </div>
                                <button 
                                    onclick="auth.handleLogout()"
                                    class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <i data-lucide="log-out" class="w-5 h-5"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <!-- Contenido para empleados -->
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div class="bg-white rounded-3xl p-8 shadow-xl border border-white/20">
                        <div class="text-center mb-8">
                            <img 
                                src="${auth.appState.currentUser.photo_url || auth.getAvatarByGender(auth.appState.currentUser.gender)}" 
                                alt="${auth.appState.currentUser.name}"
                                class="w-24 h-24 rounded-2xl mx-auto object-cover border-4 border-white shadow-lg mb-4"
                            />
                            <h1 class="text-3xl font-bold text-gray-900 mb-2">${auth.appState.currentUser.name}</h1>
                            <p class="text-xl text-gray-600">${auth.appState.currentUser.position || 'Empleado'}</p>
                            <p class="text-sm text-gray-500 mt-2">${companies[auth.appState.currentUser.company]?.name || auth.appState.currentUser.company}</p>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Información Personal -->
                            <div class="p-6 bg-blue-50 rounded-2xl">
                                <h3 class="text-lg font-bold text-blue-900 mb-4">Información Personal</h3>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-sm text-blue-600 font-medium">Email</p>
                                        <p class="text-gray-900">${auth.appState.currentUser.email || 'No registrado'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-blue-600 font-medium">Documento</p>
                                        <p class="text-gray-900">${auth.appState.currentUser.cedula}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-blue-600 font-medium">Fecha de Ingreso</p>
                                        <p class="text-gray-900">${auth.appState.currentUser.start_date ? auth.formatDate(auth.appState.currentUser.start_date) : 'No registrado'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Información Laboral -->
                            <div class="p-6 bg-green-50 rounded-2xl">
                                <h3 class="text-lg font-bold text-green-900 mb-4">Información Laboral</h3>
                                <div class="space-y-3">
                                    <div>
                                        <p class="text-sm text-green-600 font-medium">Jefe Directo</p>
                                        <p class="text-gray-900">${auth.appState.currentUser.manager || 'Adrian Hidalgo'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-green-600 font-medium">Tipo de Pago</p>
                                        <p class="text-gray-900 capitalize">${auth.appState.currentUser.payment_type || 'Mensual'}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-green-600 font-medium">Días de Vacaciones</p>
                                        <p class="text-2xl font-bold text-green-700">${auth.appState.currentUser.available_vacations || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-8 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl text-white text-center">
                            <h3 class="text-lg font-bold mb-2">¿Necesitas solicitar vacaciones?</h3>
                            <p class="text-purple-100 mb-4">Contacta a tu jefe directo o administrador para gestionar tus solicitudes</p>
                            <div class="flex items-center justify-center space-x-2 text-purple-200">
                                <i data-lucide="mail" class="w-4 h-4"></i>
                                <span class="text-sm">Administración: admin@hidrexcapital.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    // Renderizado principal según la vista actual
    let content = '';
    
    switch (auth.appState.currentView) {
        case 'company':
            content = renderCompanyDetail();
            break;
        case 'employee':
            content = renderEmployeeDetail();
            break;
        case 'management':
            content = renderEmployeeManagement();
            break;
        default:
            content = `
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    ${renderMetricsOverview()}
                    ${renderCompaniesGrid()}
                    ${renderCostBreakdown()}
                </div>
            `;
    }

    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
            ${renderTopNavigation()}
            ${content}
        </div>
    `;
    
    lucide.createIcons();
    if (auth.appState.editingEmployee || auth.appState.auth.showAddEmployee) {
        auth.updateSalaryLabel(auth.appState.editingEmployee?.payment_type || 'mensual');
    }
}

// Inicializar la aplicación

export { render };
