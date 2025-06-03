import React, { useState, useEffect } from 'react';
import { Calendar, User, DollarSign, LogOut, ChevronLeft, ChevronRight, Plus, Send } from 'lucide-react';
import { supabase } from './supabaseClient';

// Feriados oficiales Costa Rica 2025
const publicHolidays2025 = [
  { date: '2025-01-01', name: 'Año Nuevo' },
  { date: '2025-04-17', name: 'Jueves Santo' },
  { date: '2025-04-18', name: 'Viernes Santo' },
  { date: '2025-04-11', name: 'Día de Juan Santamaría' },
  { date: '2025-05-01', name: 'Día del Trabajador' },
  { date: '2025-07-25', name: 'Anexión de Guanacaste' },
  { date: '2025-08-02', name: 'Virgen de los Ángeles' },
  { date: '2025-08-15', name: 'Día de la Madre' },
  { date: '2025-09-15', name: 'Independencia' },
  { date: '2025-10-12', name: 'Día de las Culturas' },
  { date: '2025-12-25', name: 'Navidad' }
];

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const VacationTrackingApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loginForm, setLoginForm] = useState({ cedula: '', pin: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestNotes, setRequestNotes] = useState('');
  const [requestType, setRequestType] = useState('full');
  const [salaryView, setSalaryView] = useState('mensual');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar empleados al inicio
  useEffect(() => {
    loadEmployees();
  }, []);

  // Cargar empleados desde Supabase
  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          vacations (*)
        `);
      
      if (error) throw error;
      
      // Transformar datos para compatibilidad
      const transformedEmployees = data.map(emp => ({
        ...emp,
        vacationsTaken: emp.vacations || []
      }));
      
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  // Función de login
  const handleLogin = async () => {
    const cleanInput = cleanDocumentNumber(loginForm.cedula);
    const user = employees.find(emp => cleanDocumentNumber(emp.cedula) === cleanInput);
    if (user && loginForm.pin === user.pin) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    } else {
      alert('Credenciales incorrectas.');
    }
  };

  // Limpiar formato de documento para comparación
  const cleanDocumentNumber = (input) => {
    return input.replace(/[-\s]/g, '');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setLoginForm({ cedula: '', pin: '' });
    setActiveTab('profile');
    setShowNewRequest(false);
    setEditingEmployee(null);
    setShowAddEmployee(false);
    setRequestType('full');
  };

  // Formatear número de documento para mostrar
  const formatDocumentNumber = (cedula, documentType) => {
    if (documentType === 'costarricense') {
      if (cedula.length === 9) {
        return `${cedula.substring(0, 1)}-${cedula.substring(1, 5)}-${cedula.substring(5, 9)}`;
      }
    }
    return cedula;
  };

  // Calcular días de vacaciones disponibles
  const calculateAvailableVacations = (employee) => {
    return employee.availableVacations || 0;
  };

  // Calcular aportes CCSS e INS
  const calculateDeductions = (salary, paymentType, displayView = 'mensual') => {
    const monthlySalary = paymentType === 'quincenal' ? salary * 2 : salary;
    
    let displaySalary, ccssAmount, insAmount, netAmount;
    
    if (displayView === 'quincenal') {
      displaySalary = monthlySalary / 2;
      ccssAmount = (monthlySalary * 0.1067) / 2;
      insAmount = (monthlySalary * 0.01) / 2;
      netAmount = displaySalary - ccssAmount - insAmount;
    } else {
      displaySalary = monthlySalary;
      ccssAmount = monthlySalary * 0.1067;
      insAmount = monthlySalary * 0.01;
      netAmount = displaySalary - ccssAmount - insAmount;
    }
    
    return {
      grossSalary: displaySalary,
      ccssEmployee: ccssAmount,
      ccssEmployer: monthlySalary * 0.2633,
      insEmployee: insAmount,
      insEmployer: monthlySalary * 0.015,
      aguinaldo: monthlySalary * 0.0833,
      netSalary: netAmount,
      aguinaldoAccumulated: (monthlySalary * 0.0833) * new Date().getMonth()
    };
  };

  // Formatear números como moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR');
  };

  // Generar avatar según género
  const getAvatarByGender = (gender) => {
    if (gender === 'femenino') {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FF8C42'/%3E%3Cpath d='M30 35 Q50 25 70 35 L70 45 Q50 55 30 45 Z' fill='%23654321'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23F4C2A1'/%3E%3Crect x='42' y='60' width='16' height='25' fill='%232C3E50' rx='8'/%3E%3Cpath d='M20 75 Q50 85 80 75' stroke='%23B8860B' stroke-width='6' fill='none' opacity='0.3'/%3E%3C/svg%3E";
    } else {
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23FFD700'/%3E%3Cpath d='M35 30 Q50 20 65 30 L65 40 Q50 50 35 40 Z' fill='%23654321'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23F4C2A1'/%3E%3Crect x='42' y='60' width='16' height='25' fill='%23008B8B' rx='8'/%3E%3Cpath d='M20 75 Q50 85 80 75' stroke='%23B8860B' stroke-width='6' fill='none' opacity='0.3'/%3E%3C/svg%3E";
    }
  };

  // Guardar cambios del empleado
  const saveEmployeeChanges = async (updatedEmployee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update(updatedEmployee)
        .eq('id', updatedEmployee.id);
      
      if (error) throw error;
      
      await loadEmployees();
      setEditingEmployee(null);
      alert('Empleado actualizado correctamente');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error al actualizar empleado');
    }
  };

  // Eliminar empleado
  const deleteEmployee = async (employeeId) => {
    if (window.confirm('¿Está seguro que desea eliminar este empleado?')) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', employeeId);
        
        if (error) throw error;
        
        await loadEmployees();
        setEditingEmployee(null);
        alert('Empleado eliminado correctamente');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error al eliminar empleado');
      }
    }
  };

  // Agregar nuevo empleado
  const addNewEmployee = async (newEmployee) => {
    try {
      const { error } = await supabase
        .from('employees')
        .insert([{
          ...newEmployee,
          manager: 'Adrian Hidalgo',
          role: 'empleado'
        }]);
      
      if (error) throw error;
      
      await loadEmployees();
      setShowAddEmployee(false);
      alert('Empleado agregado correctamente');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Error al agregar empleado');
    }
  };

  // Generar calendario
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const toggleDateSelection = (day) => {
    if (!day) return;
    
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const isDateSelected = (day) => {
    if (!day) return false;
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return selectedDates.includes(dateStr);
  };

  // Componente para editar empleado
  const EmployeeEditForm = ({ employee, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState({
      name: employee?.name || '',
      cedula: employee?.cedula || '',
      documentType: employee?.documentType || 'costarricense',
      position: employee?.position || '',
      gender: employee?.gender || 'masculino',
      company: employee?.company || 'Inversiones Ana Maria S.A.',
      startDate: employee?.startDate || '',
      salary: employee?.salary || '',
      paymentType: employee?.paymentType || 'mensual',
      availableVacations: employee?.availableVacations || 12,
      pin: employee?.pin || ''
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.cedula || !formData.salary) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }
      onSave({ ...employee, ...formData, salary: parseFloat(formData.salary) });
    };

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Documento *</label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                placeholder="Ej: 234567890, 155822915014"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
              <select
                value={formData.documentType || 'costarricense'}
                onChange={(e) => setFormData({...formData, documentType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              >
                <option value="costarricense">Cédula Costa Rica</option>
                <option value="nicaraguense">Cédula Nicaragua</option>
                <option value="migratorio">Doc. Migratorio CR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empresa *</label>
              <select
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              >
                <option value="Inversiones Ana Maria S.A.">Inversiones Ana Maria S.A.</option>
                <option value="Hidrex Bienes Raices S.A.">Hidrex Bienes Raices S.A.</option>
                <option value="Hidrex Servicios SRL">Hidrex Servicios SRL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Ingreso</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago</label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salario Base * (₡)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder="800000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PIN *</label>
              <input
                type="text"
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value.slice(0, 4)})}
                placeholder="1234"
                maxLength="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vacaciones Disponibles</label>
              <input
                type="number"
                step="0.5"
                value={formData.availableVacations}
                onChange={(e) => setFormData({...formData, availableVacations: parseFloat(e.target.value) || 0})}
                placeholder="12"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
              <p className="text-xs text-gray-500 mt-1">Puede incluir medios días (ej: 8.5)</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">El sistema calculará automáticamente las deducciones del salario base</p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
          >
            Cancelar
          </button>
          {employee && (
            <button
              onClick={() => onDelete(employee.id)}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    );
  };

  const displayEmployees = currentUser?.role === 'admin' ? employees : [currentUser];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Hidrex Capital</h1>
            <p className="text-gray-600">Gestión de empleados</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Número de documento (sin guiones ni espacios)"
                value={loginForm.cedula}
                onChange={(e) => setLoginForm({...loginForm, cedula: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Ingrese solo números. Ej: 234567890, 12345678901, 155822915014
              </p>
            </div>
            
            <div>
              <input
                type="password"
                placeholder="PIN (4 dígitos)"
                value={loginForm.pin}
                onChange={(e) => setLoginForm({...loginForm, pin: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                maxLength="4"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition duration-200 font-medium"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showNewRequest) {
    const days = generateCalendar();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setShowNewRequest(false)}
            className="flex items-center text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="ml-1">Atrás</span>
          </button>
          <h1 className="font-semibold text-gray-900">Nueva Solicitud</h1>
          <div className="w-16"></div>
        </div>

        <div className="p-4 space-y-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-semibold text-lg">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button 
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => toggleDateSelection(day)}
                  disabled={!day}
                  className={`p-2 text-sm rounded-lg ${
                    !day
                      ? 'invisible'
                      : isDateSelected(day)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {day || ''}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Main interface placeholder */}
    </div>
  );
};

export default VacationTrackingApp;
