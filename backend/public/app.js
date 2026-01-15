class WorkTimeTracker {
    constructor() {
        // Configuración de la API
        this.apiBaseUrl = 'http://192.168.1.7:3000/api'; // Cambia esto por tu URL
        this.requestTimeout = 5000; // Timeout de 5 segundos para las solicitudes
        this.currentEmployee = null;
        this.currentWorkSession = null;
        this.timer = null;
        this.elapsedSeconds = 0;
        this.startTime = null;

        // Elementos del DOM
        this.elements = {
            loginScreen: document.getElementById('login-screen'),
            workScreen: document.getElementById('work-screen'),
            employeeCode: document.getElementById('employee-code'),
            validateBtn: document.getElementById('validate-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            employeeName: document.getElementById('employee-name'),
            timerDisplay: document.getElementById('timer-display'),
            timerDate: document.getElementById('timer-date'),
            startBtn: document.getElementById('start-btn'),
            endBtn: document.getElementById('end-btn'),
            controlsMessage: document.getElementById('controls-message'),
            popup: document.getElementById('alert-popup'),
            overlay: document.getElementById('overlay'),
            popupTitle: document.getElementById('popup-title'),
            popupMessage: document.getElementById('popup-message'),
            popupIcon: document.getElementById('popup-icon'),
            popupOk: document.getElementById('popup-ok'),
            popupClose: document.querySelector('.popup-close')
        };

        this.init();
    }

    init() {
        this.bindEvents();
    }

    fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.requestTimeout);
        
        return fetch(url, {
            ...options,
            signal: controller.signal
        }).finally(() => clearTimeout(timeout));
    }

    bindEvents() {
        // Evento para validar código con Enter
        this.elements.employeeCode.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.validateEmployee();
            }
        });

        // Botón de validar
        this.elements.validateBtn.addEventListener('click', () => this.validateEmployee());

        // Botón de logout
        this.elements.logoutBtn.addEventListener('click', () => this.logout());

        // Botones de control de jornada
        this.elements.startBtn.addEventListener('click', () => this.startWorkSession());
        this.elements.endBtn.addEventListener('click', () => this.endWorkSession());

        // Popup de alerta
        this.elements.popupOk.addEventListener('click', () => this.hidePopup());
        this.elements.popupClose.addEventListener('click', () => this.hidePopup());
        this.elements.overlay.addEventListener('click', () => this.hidePopup());
    }

    async validateEmployee() {
        const code = this.elements.employeeCode.value.trim();
        
        if (!code) {
            this.showPopup('error', 'Error', 'Por favor ingresa un código de empleado');
            return;
        }

        try {
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/employees?code=${code}`);
            const data = await response.json();

            if (response.ok && data.length > 0) {
                // El código es único, obtener el primer empleado
                this.currentEmployee = data[0];
                localStorage.setItem('currentEmployee', JSON.stringify(this.currentEmployee));
                
                // Verificar si ya tiene una jornada activa (sin salida)
                try {
                    const workdayResponse = await this.fetchWithTimeout(`${this.apiBaseUrl}/workdays/opt/last/${this.currentEmployee.id}`);
                    
                    if (workdayResponse.ok) {
                        const workdayData = await workdayResponse.json();
                        
                        if (workdayData && !workdayData.leave) {
                            // Hay una jornada activa (entrada sin salida)
                            this.currentWorkSession = workdayData;
                            this.startTime = new Date(this.currentWorkSession.entry);
                            this.elapsedSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
                            localStorage.setItem('currentWorkSession', JSON.stringify(this.currentWorkSession));
                        }
                    }
                } catch (workdayError) {
                    console.error('Error al verificar jornada activa:', workdayError);
                    // Continuar sin jornada activa
                }
                
                this.showWorkScreen();
                
                if (this.currentWorkSession) {
                    this.updateActiveSessionDisplay();
                    this.startTimer();
                    this.showPopup('info', 'Jornada Activa', 'Ya tienes una jornada en curso');
                } else {
                    this.updateNoSessionDisplay();
                }
                
            } else {
                this.showPopup('error', 'Error', 'Código de empleado inválido');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showPopup('error', 'Error de conexión', 'No se pudo conectar con el servidor');
        }
    }

    showWorkScreen() {
        this.elements.loginScreen.classList.remove('active');
        this.elements.workScreen.classList.add('active');
        this.elements.employeeName.textContent = this.currentEmployee.name || `Empleado ${this.currentEmployee.code}`;
    }

    showLoginScreen() {
        this.elements.workScreen.classList.remove('active');
        this.elements.loginScreen.classList.add('active');
        this.elements.employeeCode.value = '';
        this.elements.employeeCode.focus();
    }

    async startWorkSession() {
        if (!this.currentEmployee) return;

        try {
            console.log(this.currentEmployee)
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/workdays/opt/entry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeID: this.currentEmployee.id,
                    entry: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentWorkSession = data;
                this.startTime = new Date(this.currentWorkSession.entry);
                this.elapsedSeconds = 0;
                localStorage.setItem('currentWorkSession', JSON.stringify(this.currentWorkSession));
                
                this.updateActiveSessionDisplay();
                this.startTimer();
                this.showPopup('success', 'Jornada Iniciada', 'Tu jornada laboral ha comenzado');
            } else {
                const errorMessage = response.status === 400 ? 'Ya tienes una jornada en curso sin finalizar' : 'No se pudo iniciar la jornada';
                this.showPopup('error', 'Error', errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showPopup('error', 'Error de conexión', 'No se pudo conectar con el servidor');
        }
    }

    async endWorkSession() {
        if (!this.currentWorkSession) return;

        try {
            const endTime = new Date();
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/workdays/opt/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeID: this.currentEmployee.id,
                    id: this.currentWorkSession.id,
                    leave: endTime.toISOString(),
                    timeInSeconds: this.elapsedSeconds
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Actualizar historial
                const duration = this.formatDuration(this.elapsedSeconds);
                const startDate = this.startTime.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                const startTime = this.startTime.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Limpiar sesión actual
                this.currentWorkSession = null;
                this.startTime = null;
                localStorage.removeItem('currentWorkSession');
                
                this.stopTimer();
                this.updateNoSessionDisplay();
                this.showPopup('success', 'Jornada Finalizada', `Jornada completada. Duración: ${duration}`);
            } else {
                const errorMessage = response.status === 400 ? 'No hay jornada activa para finalizar' : 'No se pudo finalizar la jornada';
                this.showPopup('error', 'Error', errorMessage);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showPopup('error', 'Error de conexión', 'No se pudo conectar con el servidor');
        }
    }

    startTimer() {
        this.stopTimer();
        
        this.timer = setInterval(() => {
            this.elapsedSeconds++;
            this.updateTimerDisplay();
        }, 1000);
        
        this.elements.startBtn.disabled = true;
        this.elements.endBtn.disabled = false;
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const formattedTime = this.formatDuration(this.elapsedSeconds);
        
        if (this.startTime) {
            const startDate = this.startTime.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            const startTime = this.startTime.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Mostrar actualización en la consola si es necesario
            console.log(`Tiempo: ${formattedTime}`);
        }
    }

    updateActiveSessionDisplay() {
        this.elements.controlsMessage.textContent = 'Tu jornada está en curso. Presiona "Terminar Jornada" cuando finalices.';
    }

    updateNoSessionDisplay() {
        this.elements.controlsMessage.textContent = 'Presiona "Iniciar Jornada" para comenzar a registrar tu tiempo';
        
        this.elements.startBtn.disabled = false;
        this.elements.endBtn.disabled = true;
    }

    formatDuration(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    logout() {
        this.currentEmployee = null;
        this.currentWorkSession = null;
        this.stopTimer();
        localStorage.removeItem('currentEmployee');
        localStorage.removeItem('currentWorkSession');
        this.showLoginScreen();
    }

    showPopup(type, title, message) {
        this.elements.popupTitle.textContent = title;
        this.elements.popupMessage.textContent = message;
        
        // Limpiar clases anteriores
        this.elements.popupIcon.className = 'fas';
        
        switch (type) {
            case 'success':
                this.elements.popupIcon.classList.add('fa-check-circle', 'success');
                break;
            case 'error':
                this.elements.popupIcon.classList.add('fa-times-circle', 'error');
                break;
            case 'warning':
                this.elements.popupIcon.classList.add('fa-exclamation-triangle', 'warning');
                break;
            default:
                this.elements.popupIcon.classList.add('fa-info-circle', 'info');
        }
        
        this.elements.popup.classList.add('active');
        this.elements.overlay.classList.add('active');
    }

    hidePopup() {
        this.elements.popup.classList.remove('active');
        this.elements.overlay.classList.remove('active');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new WorkTimeTracker();
});