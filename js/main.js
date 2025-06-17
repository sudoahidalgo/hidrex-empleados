import { supabase, appState } from './state.js';

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 2
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

async function handleGoogleLogin() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
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
    appState.editingEmployee = null;
    appState.showAddEmployee = false;
    appState.showNewRequest = false;
    appState.showRequests = false;
    appState.showHistory = false;
    render();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    alert('Error al cerrar sesión: ' + error.message);
  }
}

async function loadEmployees() {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) throw error;
    appState.employees = data || [];
  } catch (error) {
    console.error('Error loading employees:', error);
    appState.employees = [];
  }
}

async function loadVacationRequests() {
  try {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select(`
          *,
          employee:employees!vacation_requests_employee_id_fkey(name),
          approver:employees!vacation_requests_approved_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    appState.vacationRequests = data || [];
  } catch (error) {
    console.error('Error loading vacation requests:', error);
    appState.vacationRequests = [];
  }
}

async function loadVacationHistory() {
  try {
    const { data, error } = await supabase
      .from('vacation_history')
      .select(`
          *,
          employee:employees!vacation_history_employee_id_fkey(name),
          approver:employees!vacation_history_approved_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    appState.vacationHistory = data || [];
  } catch (error) {
    console.error('Error loading vacation history:', error);
    appState.vacationHistory = [];
  }
}

async function loadData() {
  appState.loading = true;
  render();
  await Promise.all([loadEmployees(), loadVacationRequests(), loadVacationHistory()]);
  appState.loading = false;
  render();
}

async function initializeAuth() {
  try {
    appState.loading = true;
    render();

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (session?.user) {
      try {
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (!empError && employee) {
          appState.currentUser = employee;
          appState.isLoggedIn = true;
          await loadData();
        } else {
          console.error('Employee not found:', empError);
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error loading employee:', error);
        await supabase.auth.signOut();
      }
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  } finally {
    appState.authInitialized = true;
    appState.loading = false;
    render();
  }
}

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔐 Auth state changed:', event, session?.user?.email);

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
        .eq('email', session.user.email)
        .single();

      if (error || !employee) {
        console.error('Employee not found:', error);
        alert(`❌ No se encontró un empleado registrado con el email: ${session.user.email}\n\n📧 Contacta al administrador para que te añada al sistema.`);
        await supabase.auth.signOut();
        return;
      }

      appState.currentUser = employee;
      appState.isLoggedIn = true;
      await loadData();
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error al cargar datos del usuario: ' + error.message);
      await supabase.auth.signOut();
    }
  }

  appState.authInitialized = true;
  render();
});

function render() {
  const app = document.getElementById('app');

  if (appState.loading || !appState.authInitialized) {
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-pink-500 flex items-center justify-center">
            <div class="text-white text-xl flex items-center space-x-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <span>Cargando sistema...</span>
            </div>
        </div>
    `;
    return;
  }

  if (!appState.isLoggedIn) {
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="building-2" class="w-10 h-10 text-red-500"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">Hidrex Capital</h1>
                    <p class="text-gray-600 mb-1">Sistema de Recursos Humanos</p>
                    <p class="text-sm text-gray-500">Gestión de empleados y vacaciones</p>
                </div>

                <button
                    onclick="handleGoogleLogin()"
                    class="w-full bg-white border-2 border-gray-200 text-gray-800 font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center space-x-3 hover:bg-gray-50"
                >
                    <img src="https://www.svgrepo.com/show/355037/google.svg" class="w-6 h-6" alt="Google"/>
                    <span>Iniciar sesión con Google</span>
                </button>

                <p class="text-xs text-gray-500 text-center mt-4 px-2">
                    🔐 Usa tu email corporativo registrado en el sistema
                </p>

                <div class="mt-8 text-center">
                    <p class="text-xs text-gray-400 mb-3 font-medium">Empresas del grupo:</p>
                    <div class="text-xs text-gray-500 space-y-1">
                        <div class="flex items-center justify-center space-x-2">
                            <span>🏢</span><span>Hidrex Bienes Raíces</span>
                        </div>
                        <div class="flex items-center justify-center space-x-2">
                            <span>💰</span><span>Hidrex Investment</span>
                        </div>
                        <div class="flex items-center justify-center space-x-2">
                            <span>🔧</span><span>Hidrex Servicios</span>
                        </div>
                        <div class="flex items-center justify-center space-x-2">
                            <span>📈</span><span>Inversiones Ana María</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
    return;
  }

  app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
          <!-- Header -->
          <div class="bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm">
              <div class="flex items-center space-x-3">
                  <i data-lucide="building-2" class="w-6 h-6 text-red-500"></i>
                  <div>
                      <h1 class="font-semibold text-gray-900">
                          ${appState.currentUser?.role === 'admin' ? 'Panel de Administración' : 'Mi Perfil'}
                      </h1>
                      <p class="text-xs text-gray-500">Hidrex Capital</p>
                  </div>
              </div>
              <button
                  onclick="handleLogout()"
                  class="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                  title="Cerrar sesión"
              >
                  <i data-lucide="log-out" class="w-5 h-5"></i>
              </button>
          </div>

          <!-- Content -->
          <div class="p-4 space-y-6 max-w-2xl mx-auto">
              <!-- Bienvenida -->
              <div class="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white">
                  <div class="flex items-center space-x-4">
                      <img
                          src="${appState.currentUser?.photo_url || getAvatarByGender(appState.currentUser?.gender || 'masculino')}"
                          alt="${appState.currentUser?.name || 'Usuario'}"
                          class="w-16 h-16 rounded-full bg-white/20 object-cover border-2 border-white/30"
                      />
                      <div>
                          <h2 class="text-xl font-bold">¡Hola, ${appState.currentUser?.name?.split(' ')[0] || 'Usuario'}!</h2>
                          <p class="text-red-100">${appState.currentUser?.position || 'Empleado'}</p>
                          <p class="text-sm text-red-200 font-medium">${appState.currentUser?.company || 'Hidrex Capital'}</p>
                      </div>
                  </div>
              </div>

              <!-- Información del perfil -->
              <div class="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <i data-lucide="user" class="w-5 h-5 mr-2 text-red-500"></i>
                      Información Personal
                  </h3>

                  <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                          <p class="text-gray-500 mb-1">Jefe Directo</p>
                          <p class="font-medium text-gray-900">${appState.currentUser?.manager || 'N/A'}</p>
                      </div>
                      <div>
                          <p class="text-gray-500 mb-1">Correo</p>
                          <p class="font-medium text-gray-900 break-all">${appState.currentUser?.email || 'N/A'}</p>
                      </div>
                      <div>
                          <p class="text-gray-500 mb-1">Fecha de Ingreso</p>
                          <p class="font-medium text-gray-900">${formatDate(appState.currentUser?.hire_date)}</p>
                      </div>
                      <div>
                          <p class="text-gray-500 mb-1">Salario</p>
                          <p class="font-medium text-gray-900">${formatCurrency(appState.currentUser?.salary || 0)}</p>
                      </div>
                  </div>
              </div>

              <!-- Sistema funcionando -->
              <div class="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div class="flex items-center mb-4">
                      <i data-lucide="check-circle" class="w-6 h-6 text-green-600 mr-3"></i>
                      <h3 class="text-lg font-semibold text-green-800">¡Sistema Funcionando! 🎉</h3>
                  </div>
                  <p class="text-green-700 mb-4">
                      El sistema de gestión de empleados de Hidrex Capital está funcionando correctamente.
                      Conexión establecida con la base de datos.
                  </p>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                      <div class="bg-white p-4 rounded-lg border border-green-200">
                          <div class="flex items-center justify-between">
                              <div>
                                  <p class="text-gray-600">Empleados registrados</p>
                                  <p class="font-bold text-green-600 text-2xl">${appState.employees.length}</p>
                              </div>
                              <i data-lucide="users" class="w-8 h-8 text-green-400"></i>
                          </div>
                      </div>
                      <div class="bg-white p-4 rounded-lg border border-green-200">
                          <div class="flex items-center justify-between">
                              <div>
                                  <p class="text-gray-600">Tu rol</p>
                                  <p class="font-bold text-green-600 text-2xl capitalize">${appState.currentUser?.role || 'Empleado'}</p>
                              </div>
                              <i data-lucide="shield-check" class="w-8 h-8 text-green-400"></i>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Próximas características -->
              <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <div class="flex items-center mb-4">
                      <i data-lucide="rocket" class="w-6 h-6 text-blue-600 mr-3"></i>
                      <h3 class="text-lg font-semibold text-blue-800">Próximas Características</h3>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-blue-700">
                      <div class="flex items-center bg-white p-3 rounded-lg">
                          <i data-lucide="calendar" class="w-5 h-5 mr-3 text-blue-500"></i>
                          <span class="text-sm">Sistema de vacaciones</span>
                      </div>
                      <div class="flex items-center bg-white p-3 rounded-lg">
                          <i data-lucide="calculator" class="w-5 h-5 mr-3 text-blue-500"></i>
                          <span class="text-sm">Cálculos salariales</span>
                      </div>
                      <div class="flex items-center bg-white p-3 rounded-lg">
                          <i data-lucide="users" class="w-5 h-5 mr-3 text-blue-500"></i>
                          <span class="text-sm">Gestión de empleados</span>
                      </div>
                      <div class="flex items-center bg-white p-3 rounded-lg">
                          <i data-lucide="file-text" class="w-5 h-5 mr-3 text-blue-500"></i>
                          <span class="text-sm">Reportes automáticos</span>
                      </div>
                  </div>
              </div>

              <!-- Footer / Contacto -->
              <div class="bg-gray-100 rounded-2xl p-6 text-center">
                  <div class="flex items-center justify-center mb-2">
                      <i data-lucide="help-circle" class="w-5 h-5 text-gray-400 mr-2"></i>
                      <p class="text-gray-600 text-sm font-medium">¿Necesitas ayuda?</p>
                  </div>
                  <p class="text-gray-500 text-sm">
                      Contacta al administrador del sistema para soporte técnico<br>
                      o para reportar cualquier problema.
                  </p>
              </div>

              <!-- Información técnica -->
              <div class="text-center text-xs text-gray-400">
                  <p>Hidrex Capital RH System v1.0</p>
                  <p>Conectado a Supabase • Última actualización: ${new Date().toLocaleDateString('es-CR')}</p>
              </div>
          </div>
      </div>
  `;

  lucide.createIcons();
}

window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;

console.log('🚀 Iniciando Hidrex Capital - Sistema de Empleados');
console.log('🌐 Modo: GitHub Pages / Hosting Web');
console.log('📡 Conectando con Supabase...');
initializeAuth();
