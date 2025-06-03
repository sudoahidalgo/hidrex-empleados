import { render } from "./ui.js";
import * as auth from "./auth.js";
// Funciones de empleados - MEJORADAS con debugging
async function saveEmployee(event) {
event.preventDefault();
const form = event.target;
const formData = new FormData(form);

auth.debugLog('Iniciando guardado de empleado...');

try {
const netSalary = parseFloat(formData.get('net_salary'));
const paymentType = formData.get('payment_type');
const grossSalary = calculateGrossFromNet(netSalary, paymentType);
const availableVacations = parseFloat(formData.get('available_vacations')) || 12.0;

const employeeData = {
name: formData.get('name'),
cedula: formData.get('cedula'),
email: formData.get('email').toLowerCase(),
document_type: formData.get('document_type'),
position: formData.get('position'),
gender: formData.get('gender'),
company: formData.get('company'),
start_date: formData.get('start_date'),
salary: grossSalary,
net_salary: netSalary,
payment_type: paymentType,
available_vacations: availableVacations,
photo_url: formData.get('photo_url') || null
};

auth.debugLog('Datos del empleado:', employeeData);

if (auth.appState.editingEmployee) {
auth.debugLog('Actualizando empleado ID:', auth.appState.editingEmployee.id);

const { data, error } = await auth.supabase
.from('employees')
.update(employeeData)
.eq('id', auth.appState.editingEmployee.id)
.select();

auth.debugLog('Respuesta de actualización:', { data, error });

if (error) {
console.error('Error en actualización:', error);
throw error;
}

alert('Empleado actualizado correctamente');
} else {
auth.debugLog('Creando nuevo empleado...');

const { data, error } = await auth.supabase
.from('employees')
.insert([{
...employeeData,
manager: 'Adrian Hidalgo',
role: 'empleado'
}])
.select();

auth.debugLog('Respuesta de inserción:', { data, error });

if (error) {
console.error('Error en inserción:', error);
throw error;
}

alert('Empleado agregado correctamente');
}

auth.debugLog('Recargando empleados...');
await auth.loadEmployees();

auth.debugLog('Cancelando edición...');
auth.cancelEdit();

} catch (error) {
console.error('Error completo en saveEmployee:', error);
alert('Error al guardar empleado: ' + error.message);
}
}

async function deleteEmployee(employeeId) {
if (!confirm('¿Está seguro que desea eliminar este empleado? Esto eliminará también todas sus solicitudes.')) {
return;
}

auth.debugLog('Eliminando empleado ID:', employeeId);

try {
// Primero eliminar historial de vacaciones
const { error: historyError } = await auth.supabase
.from('vacation_history')
.delete()
.eq('employee_id', employeeId);

if (historyError) {
console.error('Error eliminando historial:', historyError);
}

// Luego eliminar solicitudes de vacaciones
const { error: requestsError } = await auth.supabase
.from('vacation_requests')
.delete()
.eq('employee_id', employeeId);

if (requestsError) {
console.error('Error eliminando solicitudes:', requestsError);
}

// Finalmente eliminar empleado
const { data, error } = await auth.supabase
.from('employees')
.delete()
.eq('id', employeeId)
.select();

auth.debugLog('Respuesta de eliminación:', { data, error });

if (error) {
console.error('Error en eliminación:', error);
throw error;
}

alert('Empleado eliminado correctamente');
await auth.loadEmployees();
auth.cancelEdit();

} catch (error) {
console.error('Error completo en deleteEmployee:', error);
alert('Error al eliminar empleado: ' + error.message);
}
}

// Función de prueba de conexión
async function testConnection() {
try {
auth.debugLog('Probando conexión a Supabase...');
const { data, error } = await auth.supabase
.from('employees')
.select('count(*)')
.limit(1);

auth.debugLog('Resultado de prueba:', { data, error });

if (error) {
console.error('Error de conexión:', error);
alert('Error de conexión a la base de datos: ' + error.message);
} else {
auth.debugLog('Conexión exitosa');
alert('Conexión a la base de datos: OK');
}
} catch (error) {
console.error('Error en prueba de conexión:', error);
alert('Error de conexión: ' + error.message);
}
}

`;
}

// Funciones de solicitudes de vacaciones
async function approveRequest(requestId) {
const request = auth.appState.vacationRequests.find(r => r.id === requestId);
if (!request) return;

try {
// Actualizar solicitud a aprobada
const { error: updateError } = await auth.supabase
.from('vacation_requests')
.update({
status: 'approved',
approved_by: auth.appState.currentUser.id,
updated_at: new Date().toISOString()
})
.eq('id', requestId);

if (updateError) throw updateError;

// Descontar días de vacaciones disponibles
const employee = auth.appState.employees.find(e => e.id === request.employee_id);
const newVacations = Math.max(0, (employee.available_vacations || 0) - request.days);

const { error: employeeError } = await auth.supabase
.from('employees')
.update({ available_vacations: newVacations })
.eq('id', request.employee_id);

if (employeeError) throw employeeError;

// Agregar al historial
const { error: historyError } = await auth.supabase
.from('vacation_history')
.insert([{
employee_id: request.employee_id,
start_date: request.start_date,
end_date: request.end_date,
days: request.days,
type: request.type,
vacation_type: request.vacation_type,
approved_by: auth.appState.currentUser.id
}]);

if (historyError) throw historyError;

alert('Solicitud aprobada correctamente');
await auth.loadData();
} catch (error) {
console.error('Error approving request:', error);
alert('Error al aprobar solicitud: ' + error.message);
}
}

async function rejectRequest(requestId) {
const adminNotes = prompt('Motivo del rechazo (opcional):');

try {
const { error } = await auth.supabase
.from('vacation_requests')
.update({
status: 'rejected',
approved_by: auth.appState.currentUser.id,
admin_notes: adminNotes,
updated_at: new Date().toISOString()
})
.eq('id', requestId);

if (error) throw error;

alert('Solicitud rechazada');
await auth.loadVacationRequests();
// Funciones de solicitudes de vacaciones
async function approveRequest(requestId) {
    const request = auth.appState.vacationRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
        // Actualizar solicitud a aprobada
        const { error: updateError } = await auth.supabase
            .from('vacation_requests')
            .update({
                status: 'approved',
                approved_by: auth.appState.currentUser.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId);

        if (updateError) throw updateError;

        // Descontar días de vacaciones disponibles
        const employee = auth.appState.employees.find(e => e.id === request.employee_id);
        const newVacations = Math.max(0, (employee.available_vacations || 0) - request.days);

        const { error: employeeError } = await auth.supabase
            .from('employees')
            .update({ available_vacations: newVacations })
            .eq('id', request.employee_id);

        if (employeeError) throw employeeError;

        // Agregar al historial
        const { error: historyError } = await auth.supabase
            .from('vacation_history')
            .insert([{
                employee_id: request.employee_id,
                start_date: request.start_date,
                end_date: request.end_date,
                days: request.days,
                type: request.type,
                vacation_type: request.vacation_type,
                approved_by: auth.appState.currentUser.id
            }]);

        if (historyError) throw historyError;

        alert('Solicitud aprobada correctamente');
        await auth.loadData();
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Error al aprobar solicitud: ' + error.message);
    }
}

async function rejectRequest(requestId) {
    const adminNotes = prompt('Motivo del rechazo (opcional):');
    
    try {
        const { error } = await auth.supabase
            .from('vacation_requests')
            .update({
                status: 'rejected',
                approved_by: auth.appState.currentUser.id,
                admin_notes: adminNotes,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId);

        if (error) throw error;

        alert('Solicitud rechazada');
        await auth.loadVacationRequests();
        render();
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error al rechazar solicitud: ' + error.message);
    }
}

export { saveEmployee, deleteEmployee, testConnection, approveRequest, rejectRequest };
