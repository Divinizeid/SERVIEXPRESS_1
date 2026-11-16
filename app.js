// ==================== INICIALIZACIÓN DE DATOS SEMILLA (LOCALSTORAGE) ====================
const DB_KEY = 'serviexpress_db_v1';

function initDB() {
    if (!localStorage.getItem(DB_KEY)) {
        const semilla = {
            usuarios: [
                { id: 1, username: 'admin', pass: '1234', nombre: 'Francisca Rojas (Admin)', rol: 'Administrador', activo: 1 },
                { id: 2, username: 'mecanico1', pass: '1234', nombre: 'Eduardo Estrada (Mecánico)', rol: 'Mecánico', activo: 1 },
                { id: 3, username: 'compras1', pass: '1234', nombre: 'Javiera López (Compras)', rol: 'Encargado de compras', activo: 1 },
                { id: 4, username: 'bodega1', pass: '1234', nombre: 'Robert Molina (Bodega)', rol: 'Bodeguero', activo: 1 },
                { id: 5, username: 'dueno', pass: '1234', nombre: 'Representante Legal', rol: 'Propietario/representante', activo: 1 },
                { id: 6, username: 'jperez', pass: '1234', nombre: 'Juan Pérez (Cliente)', rol: 'Cliente', activo: 1 }
            ],
            clientes: [
                { id: 1, rut: '18.456.789-0', nombre: 'Juan Pérez', contacto: 'juan@correo.cl', username: 'jperez', fecha_registro: '2026-11-16', activo: 1 },
                { id: 2, rut: '15.222.333-4', nombre: 'María González', contacto: '+56987654321', username: null, fecha_registro: '2026-11-16', activo: 1 }
            ],
            servicios_catalogo: [
                { codigo: 'SRV-01', nombre: 'Cambio de Aceite y Filtro', descripcion: 'Aceite sintético 5W-30 + filtro original', precio: 45000, moneda: 'CLP', duracion_min: 60, activo: 1 },
                { codigo: 'SRV-02', nombre: 'Alineación y Balanceo', descripcion: 'Ajuste computarizado tren delantero y trasero', precio: 35000, moneda: 'CLP', duracion_min: 60, activo: 1 },
                { codigo: 'SRV-03', nombre: 'Diagnóstico Escáner OBD2', descripcion: 'Lectura completa de códigos de falla electrónicos', precio: 25000, moneda: 'CLP', duracion_min: 30, activo: 1 },
                { codigo: 'SRV-04', nombre: 'Cambio de Pastillas de Freno', descripcion: 'Incluye rectificado de discos delanteros', precio: 65000, moneda: 'CLP', duracion_min: 90, activo: 1 }
            ],
            productos: [
                { codigo: 'PRD-01', nombre: 'Aceite Sintético 5W-30 4L', unidad: 'Bidón', precio_ref: 22000, moneda: 'CLP', activo: 1 },
                { codigo: 'PRD-02', nombre: 'Filtro de Aceite Universal', unidad: 'Unidad', precio_ref: 6500, moneda: 'CLP', activo: 1 },
                { codigo: 'PRD-03', nombre: 'Juego Pastillas Freno Delanteras', unidad: 'Set', precio_ref: 28000, moneda: 'CLP', activo: 1 }
            ],
            proveedores: [
                { id: 1, nombre: 'Repuestos Chile SpA', rubro: 'Lubricantes y Filtros', contacto_nombre: 'Carlos Díaz', contacto_medio: 'ventas@repuestoschile.cl', rut: '77.111.222-3', activo: 1 }
            ],
            festivos: [
                { fecha: '2026-12-25', motivo: 'Navidad - Taller Cerrado' },
                { fecha: '2026-09-18', motivo: 'Fiestas Patrias' }
            ],
            reservas: [],
            servicios_realizados: [],
            pagos: [],
            dtes: [],
            ordenes_pedido: [],
            recepciones: [],
            bitacora: []
        };
        localStorage.setItem(DB_KEY, JSON.stringify(semilla));
    }
}

const getDB = () => JSON.parse(localStorage.getItem(DB_KEY));
const saveDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

function resetearDemo() {
    if (confirm('¿Restaurar todos los datos a su estado inicial?')) {
        localStorage.removeItem(DB_KEY);
        sessionStorage.removeItem('sesion_activa');
        initDB();
        location.reload();
    }
}

function logAudit(usuario, accion, registro_id, resultado) {
    const db = getDB();
    db.bitacora.unshift({
        id: db.bitacora.length + 1,
        usuario: usuario || 'ANONIMO',
        fecha_hora: new Date().toLocaleString('es-CL'),
        accion,
        registro_id: String(registro_id),
        resultado
    });
    saveDB(db);
}

// ==================== GESTIÓN DE SESIÓN Y UI ====================
const getSesion = () => JSON.parse(sessionStorage.getItem('sesion_activa'));

function mostrarAlerta(mensaje, tipo = 'success') {
    const cont = document.getElementById('alert-container');
    cont.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" onclick="this.parentElement.remove()"></button>
    </div>`;
}

function navegar(vista) {
    document.querySelectorAll('main, section').forEach(el => el.classList.add('vista-oculta'));
    document.getElementById(`vista-${vista}`).classList.remove('vista-oculta');
    if (vista === 'inicio') renderInicio();
    if (vista === 'dashboard') renderDashboard();
}

function actualizarNavbar() {
    const sesion = getSesion();
    const nav = document.getElementById('nav-acciones');
    if (sesion) {
        nav.innerHTML = `
            <span class="text-light small">Hola, <strong>${sesion.nombre}</strong></span>
            <button class="btn btn-outline-light btn-sm" onclick="navegar('dashboard')">Mi Panel</button>
            <button class="btn btn-danger btn-sm" onclick="cerrarSesion()">Salir</button>
        `;
    } else {
        nav.innerHTML = `
            <button class="btn btn-outline-light btn-sm" onclick="navegar('login')">Iniciar Sesión</button>
            <button class="btn btn-primary btn-sm" onclick="navegar('registro')">Registrarse</button>
        `;
    }
}

// ==================== VISTAS PÚBLICAS Y AUTENTICACIÓN ====================
function renderInicio() {
    const db = getDB();
    const sesion = getSesion();
    const hero = document.getElementById('hero-botones');
    hero.innerHTML = sesion
        ? `<button class="btn btn-primary" onclick="navegar('dashboard')">Ir a mi Panel (${sesion.rol})</button>`
        : `<button class="btn btn-primary me-2" onclick="navegar('login')">Ingresar al Sistema</button>
           <button class="btn btn-outline-secondary" onclick="navegar('registro')">Crear Cuenta Cliente</button>`;

    const cont = document.getElementById('catalogo-publico');
    cont.innerHTML = db.servicios_catalogo.filter(s => s.activo).map(s => `
        <div class="col-md-6 col-lg-3">
            <div class="card h-100 shadow-sm card-servicio">
                <div class="card-body">
                    <span class="badge bg-info text-dark mb-2">${s.codigo} · ${s.duracion_min} min</span>
                    <h5 class="card-title">${s.nombre}</h5>
                    <p class="card-text small text-muted">${s.descripcion}</p>
                </div>
                <div class="card-footer bg-white fw-bold text-primary">
                    $${s.precio.toLocaleString('es-CL')} ${s.moneda}
                </div>
            </div>
        </div>
    `).join('');
}

document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value.trim();
    const db = getDB();
    const user = db.usuarios.find(x => x.username === u && x.pass === p && x.activo === 1);

    if (user) {
        sessionStorage.setItem('sesion_activa', JSON.stringify(user));
        logAudit(user.username, 'LOGIN', user.id, 'Exitoso');
        actualizarNavbar();
        navegar('dashboard');
    } else {
        logAudit(u, 'LOGIN_FALLIDO', '-', 'Credenciales inválidas');
        mostrarAlerta('No se pudo autenticar. Verifique sus credenciales.', 'danger');
    }
});

document.getElementById('form-registro').addEventListener('submit', (e) => {
    e.preventDefault();
    const rut = document.getElementById('reg-rut').value.trim();
    const nombre = document.getElementById('reg-nombre').value.trim();
    const contacto = document.getElementById('reg-contacto').value.trim();
    const username = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    const db = getDB();
    if (db.usuarios.some(x => x.username === username) || (rut && db.clientes.some(c => c.rut === rut))) {
        return mostrarAlerta('Ya existe un cliente o usuario con ese RUT o username (RF-01).', 'danger');
    }

    db.clientes.push({
        id: db.clientes.length + 1,
        rut: rut || null,
        nombre,
        contacto,
        username,
        fecha_registro: new Date().toISOString().split('T')[0],
        activo: 1
    });
    db.usuarios.push({ id: db.usuarios.length + 1, username, pass, nombre, rol: 'Cliente', activo: 1 });
    saveDB(db);
    logAudit(username, 'REGISTRO_CLIENTE_WEB', rut || username, 'Éxito');
    mostrarAlerta('Registro exitoso. Ya puede iniciar sesión.', 'success');
    e.target.reset();
    navegar('login');
});

function cerrarSesion() {
    const s = getSesion();
    if (s) logAudit(s.username, 'LOGOUT', s.id, 'Sesión cerrada');
    sessionStorage.removeItem('sesion_activa');
    actualizarNavbar();
    navegar('inicio');
}

// ==================== DASHBOARD Y MÓDULOS POR ROL ====================
function renderDashboard() {
    const sesion = getSesion();
    if (!sesion) return navegar('login');

    document.getElementById('dash-titulo').textContent = `Bienvenido, ${sesion.nombre}`;
    document.getElementById('dash-rol-badge').textContent = `Perfil: ${sesion.rol}`;

    const permisos = {
        'Administrador': ['reservas', 'servicios', 'pagos', 'compras', 'clientes', 'bitacora'],
        'Mecánico': ['reservas', 'servicios', 'clientes'],
        'Cliente': ['reservas', 'historial'],
        'Encargado de compras': ['compras'],
        'Bodeguero': ['compras'],
        'Propietario/representante': ['bitacora']
    };

    const nombresTab = {
        reservas: '📅 Reservas',
        servicios: '🔧 Servicios Realizados',
        pagos: '💳 Pagos y SII',
        compras: '📦 Compras y Bodega',
        clientes: '👥 Clientes',
        historial: '📜 Mi Historial',
        bitacora: '🛡️ Bitácora e Informes'
    };

    const tabs = permisos[sesion.rol] || [];
    const menu = document.getElementById('menu-modulos');
    menu.innerHTML = tabs.map((t, idx) => `
        <li class="nav-item">
            <button class="nav-link ${idx === 0 ? 'active' : ''}" onclick="cargarModulo('${t}', this)">${nombresTab[t]}</button>
        </li>
    `).join('');

    if (tabs.length > 0) cargarModulo(tabs[0], menu.querySelector('.nav-link'));
}

function cargarModulo(mod, btnEl) {
    document.querySelectorAll('#menu-modulos .nav-link').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    const db = getDB();
    const sesion = getSesion();
    const cont = document.getElementById('contenido-modulo');

    // MÓDULO RESERVAS (RF-03, RF-04)
    if (mod === 'reservas') {
        const lista = sesion.rol === 'Cliente'
            ? db.reservas.filter(r => r.username === sesion.username)
            : db.reservas;

        cont.innerHTML = `
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold">Agendar Hora (09:00 - 18:00)</div>
                        <div class="card-body">
                            <form onsubmit="crearReserva(event)">
                                ${sesion.rol !== 'Cliente' ? `
                                <div class="mb-2">
                                    <label class="form-label">Cliente</label>
                                    <select class="form-select" id="res-cliente">
                                        ${db.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                                    </select>
                                </div>` : ''}
                                <div class="mb-2">
                                    <label class="form-label">Servicio</label>
                                    <select class="form-select" id="res-srv">
                                        ${db.servicios_catalogo.map(s => `<option value="${s.codigo}">${s.nombre} (${s.duracion_min} min)</option>`).join('')}
                                    </select>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Fecha</label>
                                    <input type="date" class="form-control" id="res-fecha" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Hora Inicio</label>
                                    <input type="time" class="form-control" id="res-hora" min="09:00" max="17:30" required>
                                </div>
                                <button class="btn btn-primary w-100">Confirmar Reserva</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <h5>Agenda de Reservas</h5>
                    <table class="table table-bordered bg-white">
                        <thead><tr><th>ID</th><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Bloque</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                            ${lista.map(r => `<tr>
                                <td>#${r.id}</td><td>${r.cliente_nombre}</td><td>${r.servicio_nombre}</td>
                                <td>${r.fecha}</td><td>${r.hora_inicio} - ${r.hora_fin}</td>
                                <td><span class="badge bg-${r.estado === 'Confirmada' ? 'success' : 'secondary'}">${r.estado}</span></td>
                                <td>${r.estado === 'Confirmada' ? `<button class="btn btn-sm btn-outline-danger" onclick="cancelarReserva(${r.id})">Cancelar</button>` : '-'}</td>
                            </tr>`).join('') || '<tr><td colspan="7" class="text-center text-muted">Sin reservas registradas</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    // MÓDULO SERVICIOS REALIZADOS (RF-10)
    else if (mod === 'servicios') {
        cont.innerHTML = `
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold">Registrar Atención Realizada</div>
                        <div class="card-body">
                            <form onsubmit="registrarServicio(event)">
                                <div class="mb-2">
                                    <label class="form-label">Cliente</label>
                                    <select class="form-select" id="srv-cli">${db.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}</select>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Servicio Ejecutado</label>
                                    <select class="form-select" id="srv-cod">${db.servicios_catalogo.map(s => `<option value="${s.codigo}">${s.nombre} ($${s.precio})</option>`).join('')}</select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Observaciones Técnicas</label>
                                    <textarea class="form-control" id="srv-obs" rows="2"></textarea>
                                </div>
                                <button class="btn btn-success w-100">Guardar Servicio</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <h5>Historial de Servicios Ejecutados</h5>
                    <table class="table table-bordered bg-white">
                        <thead><tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Servicio</th><th>Mecánico</th><th>Precio Congelado</th><th>Pago</th></tr></thead>
                        <tbody>
                            ${db.servicios_realizados.map(s => `<tr>
                                <td>#${s.id}</td><td>${s.fecha}</td><td>${s.cliente_nombre}</td><td>${s.servicio_nombre}</td>
                                <td>${s.mecanico}</td><td>$${s.precio_aplicado.toLocaleString('es-CL')}</td>
                                <td><span class="badge bg-${s.estado_pago === 'Pagado' ? 'success' : 'warning text-dark'}">${s.estado_pago}</span></td>
                            </tr>`).join('') || '<tr><td colspan="7" class="text-center text-muted">Sin servicios registrados</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    // MÓDULO PAGOS Y SII (RF-36, RF-12)
    else if (mod === 'pagos') {
        const pendientes = db.servicios_realizados.filter(s => s.estado_pago === 'Pendiente');
        cont.innerHTML = `
            <div class="card mb-4 shadow-sm">
                <div class="card-header fw-bold">Servicios Pendientes de Pago</div>
                <div class="card-body">
                    <table class="table">
                        <thead><tr><th>ID</th><th>Cliente</th><th>Servicio</th><th>Monto</th><th>Acción</th></tr></thead>
                        <tbody>
                            ${pendientes.map(p => `<tr>
                                <td>#${p.id}</td><td>${p.cliente_nombre}</td><td>${p.servicio_nombre}</td>
                                <td>$${p.precio_aplicado.toLocaleString('es-CL')}</td>
                                <td><button class="btn btn-sm btn-success" onclick="pagarServicio(${p.id})">Registrar Pago Total + DTE SII</button></td>
                            </tr>`).join('') || '<tr><td colspan="5" class="text-muted">No hay servicios pendientes de cobro.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
            <h5>Documentos Tributarios Emitidos (SII)</h5>
            <table class="table table-bordered bg-white">
                <thead><tr><th>Folio</th><th>Tipo</th><th>Cliente</th><th>Monto</th><th>Estado SII</th></tr></thead>
                <tbody>
                    ${db.dtes.map(d => `<tr><td>${d.folio}</td><td>${d.tipo}</td><td>${d.cliente}</td><td>$${d.monto.toLocaleString('es-CL')}</td><td><span class="badge bg-success">${d.estado_sii}</span></td></tr>`).join('') || '<tr><td colspan="5" class="text-center text-muted">Sin DTE emitidos</td></tr>'}
                </tbody>
            </table>`;
    }

    // MÓDULO COMPRAS Y BODEGA (RF-15, RF-20)
    else if (mod === 'compras') {
        cont.innerHTML = `
            <div class="row g-4">
                ${['Administrador', 'Encargado de compras'].includes(sesion.rol) ? `
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-header fw-bold">Emitir Orden de Pedido (RF-15)</div>
                        <div class="card-body">
                            <form onsubmit="crearOrden(event)">
                                <div class="mb-2">
                                    <label class="form-label">Proveedor</label>
                                    <select class="form-select" id="ord-prov">${db.proveedores.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('')}</select>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Producto</label>
                                    <select class="form-select" id="ord-prod">${db.productos.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('')}</select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Cantidad</label>
                                    <input type="number" class="form-control" id="ord-cant" min="1" value="5" required>
                                </div>
                                <button class="btn btn-primary w-100">Emitir Orden</button>
                            </form>
                        </div>
                    </div>
                </div>` : ''}
                <div class="col-md-8">
                    <h5>Órdenes de Pedido</h5>
                    <table class="table table-bordered bg-white">
                        <thead><tr><th>N°</th><th>Proveedor</th><th>Producto</th><th>Solicitado / Recibido</th><th>Estado</th><th>Bodega</th></tr></thead>
                        <tbody>
                            ${db.ordenes_pedido.map(o => `<tr>
                                <td>#${o.id}</td><td>${o.proveedor}</td><td>${o.producto}</td>
                                <td>${o.solicitada} / ${o.recibida}</td>
                                <td><span class="badge bg-info text-dark">${o.estado}</span></td>
                                <td>${(['Administrador', 'Bodeguero'].includes(sesion.rol) && o.recibida < o.solicitada)
                                    ? `<button class="btn btn-sm btn-success" onclick="recibirOrden(${o.id})">Recibir Todo</button>` : '-'}</td>
                            </tr>`).join('') || '<tr><td colspan="6" class="text-center text-muted">Sin órdenes emitidas</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    // MÓDULO CLIENTES
    else if (mod === 'clientes') {
        cont.innerHTML = `
            <table class="table table-bordered bg-white">
                <thead><tr><th>ID</th><th>RUT</th><th>Nombre</th><th>Contacto</th><th>Registro</th></tr></thead>
                <tbody>${db.clientes.map(c => `<tr><td>${c.id}</td><td>${c.rut || 'Sin RUT'}</td><td>${c.nombre}</td><td>${c.contacto}</td><td>${c.fecha_registro}</td></tr>`).join('')}</tbody>
            </table>`;
    }

    // MÓDULO HISTORIAL CLIENTE (RF-29)
    else if (mod === 'historial') {
        const cli = db.clientes.find(c => c.username === sesion.username);
        const misSrvs = db.servicios_realizados.filter(s => s.cliente_id === cli?.id);
        cont.innerHTML = `
            <h5>Mis Atenciones en Taller</h5>
            <table class="table table-bordered bg-white">
                <thead><tr><th>Fecha</th><th>Servicio</th><th>Monto</th><th>Estado Pago</th></tr></thead>
                <tbody>${misSrvs.map(s => `<tr><td>${s.fecha}</td><td>${s.servicio_nombre}</td><td>$${s.precio_aplicado.toLocaleString('es-CL')}</td><td>${s.estado_pago}</td></tr>`).join('') || '<tr><td colspan="4" class="text-muted">Aún no tienes servicios realizados.</td></tr>'}</tbody>
            </table>`;
    }

    // MÓDULO BITÁCORA (RNF-08)
    else if (mod === 'bitacora') {
        cont.innerHTML = `
            <h5>Bitácora de Auditoría del Sistema (RNF-08)</h5>
            <table class="table table-sm table-striped bg-white">
                <thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Acción</th><th>Registro</th><th>Resultado</th></tr></thead>
                <tbody>${db.bitacora.map(b => `<tr><td>${b.fecha_hora}</td><td>${b.usuario}</td><td>${b.accion}</td><td>${b.registro_id}</td><td>${b.resultado}</td></tr>`).join('')}</tbody>
            </table>`;
    }
}

// ==================== ACCIONES DE NEGOCIO ====================
function crearReserva(e) {
    e.preventDefault();
    const db = getDB();
    const sesion = getSesion();
    const fecha = document.getElementById('res-fecha').value;
    const hora_inicio = document.getElementById('res-hora').value;
    const cod = document.getElementById('res-srv').value;

    const festivo = db.festivos.find(f => f.fecha === fecha);
    if (festivo) return mostrarAlerta(`Fecha no disponible: ${festivo.motivo} (RF-04).`, 'danger');

    const srv = db.servicios_catalogo.find(s => s.codigo === cod);
    const [hh, mm] = hora_inicio.split(':').map(Number);
    const finMin = hh * 60 + mm + srv.duracion_min;
    if (hh < 9 || finMin > 18 * 60) return mostrarAlerta('Horario fuera de jornada (09:00 - 18:00) (RF-04).', 'danger');

    const hora_fin = `${String(Math.floor(finMin / 60)).padStart(2, '0')}:${String(finMin % 60).padStart(2, '0')}`;
    const solapa = db.reservas.some(r => r.fecha === fecha && r.estado === 'Confirmada' && !(r.hora_fin <= hora_inicio || r.hora_inicio >= hora_fin));
    if (solapa) return mostrarAlerta('El bloque horario se solapa con otra reserva activa (RF-04).', 'danger');

    const cli = sesion.rol === 'Cliente'
        ? db.clientes.find(c => c.username === sesion.username)
        : db.clientes.find(c => c.id === Number(document.getElementById('res-cliente').value));

    db.reservas.push({
        id: db.reservas.length + 1,
        username: cli.username,
        cliente_nombre: cli.nombre,
        servicio_nombre: srv.nombre,
        fecha,
        hora_inicio,
        hora_fin,
        estado: 'Confirmada'
    });
    saveDB(db);
    logAudit(sesion.username, 'CREAR_RESERVA', `${fecha} ${hora_inicio}`, 'Confirmada');
    mostrarAlerta('Reserva confirmada exitosamente.', 'success');
    cargarModulo('reservas');
}

function cancelarReserva(id) {
    const db = getDB();
    const r = db.reservas.find(x => x.id === id);
    if (r) r.estado = 'Cancelada';
    saveDB(db);
    logAudit(getSesion().username, 'CANCELAR_RESERVA', id, 'Cancelada');
    mostrarAlerta('Reserva cancelada y bloque liberado.', 'info');
    cargarModulo('reservas');
}

function registrarServicio(e) {
    e.preventDefault();
    const db = getDB();
    const sesion = getSesion();
    const cli = db.clientes.find(c => c.id === Number(document.getElementById('srv-cli').value));
    const srv = db.servicios_catalogo.find(s => s.codigo === document.getElementById('srv-cod').value);

    db.servicios_realizados.push({
        id: db.servicios_realizados.length + 1,
        cliente_id: cli.id,
        cliente_nombre: cli.nombre,
        servicio_nombre: srv.nombre,
        mecanico: sesion.username,
        fecha: new Date().toISOString().split('T')[0],
        precio_aplicado: srv.precio,
        estado_pago: 'Pendiente'
    });
    saveDB(db);
    logAudit(sesion.username, 'REGISTRAR_SERVICIO', cli.nombre, 'Guardado');
    mostrarAlerta('Servicio registrado con precio histórico congelado (RF-10).', 'success');
    cargarModulo('servicios');
}

function pagarServicio(id) {
    const db = getDB();
    const srv = db.servicios_realizados.find(s => s.id === id);
    srv.estado_pago = 'Pagado';
    const folio = `F-${1000 + id}`;
    db.dtes.push({ folio, tipo: 'Boleta/Factura', cliente: srv.cliente_nombre, monto: srv.precio_aplicado, estado_sii: 'Aceptado SII' });
    saveDB(db);
    logAudit(getSesion().username, 'PAGO_Y_DTE', folio, 'Aceptado');
    mostrarAlerta(`Pago recibido y DTE ${folio} aceptado por el SII.`, 'success');
    cargarModulo('pagos');
}

function crearOrden(e) {
    e.preventDefault();
    const db = getDB();
    db.ordenes_pedido.push({
        id: db.ordenes_pedido.length + 1,
        proveedor: document.getElementById('ord-prov').value,
        producto: document.getElementById('ord-prod').value,
        solicitada: Number(document.getElementById('ord-cant').value),
        recibida: 0,
        estado: 'Emitida'
    });
    saveDB(db);
    mostrarAlerta('Orden de pedido emitida (RF-16).', 'success');
    cargarModulo('compras');
}

function recibirOrden(id) {
    const db = getDB();
    const ord = db.ordenes_pedido.find(o => o.id === id);
    ord.recibida = ord.solicitada;
    ord.estado = 'Recibida completa';
    saveDB(db);
    mostrarAlerta('Recepción completa registrada en bodega.', 'success');
    cargarModulo('compras');
}

// Arranque
initDB();
actualizarNavbar();
navegar('inicio');
