// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Application State
    const state = {
        currentRole: localStorage.getItem('robinRole') || 'donor',
        user: {
            name: 'Usuario de Robin',
            email: 'usuario@ejemplo.com',
            address: 'Calle Falsa 123, Ciudad',
            phone: '555-0123',
            role: 'donor',
            isVerified: false,
            avatar: 'U'
        },
        userActivity: [
            { id: 1, text: 'Donación de Pañales talla M', status: 'success', date: '2026-08-20', category: 'donation' },
            { id: 2, text: 'Publicación: Ayuda para bebé recién nacido', status: 'info', date: '2026-08-15', category: 'story' },
            { id: 3, text: 'Donación de Biberones', status: 'warning', date: '2026-08-10', category: 'donation' },
            { id: 4, text: 'Donación de Ropa de Invierno', status: 'success', date: '2026-08-05', category: 'donation' },
            { id: 5, text: 'Publicación: Centro de Salud San José', status: 'info', date: '2026-08-01', category: 'story' },
            { id: 6, text: 'Donación de Leche en Polvo', status: 'warning', date: '2026-07-25', category: 'donation' },
            { id: 7, text: 'Donación de Juguetes Educativos', status: 'success', date: '2026-07-18', category: 'donation' },
        ],
        posts: [
            {
                id: 1,
                name: 'María Fernández',
                avatar: 'M',
                role: 'Beneficiaria',
                time: 'Hace 2 horas',
                description: '¡Hola! Estamos juntando pañales y ropa para la llegada de mi bebé Martina. Cualquier ayuda es bienvenida. ¡Gracias!',
                verified: true,
                items: [
                    { id: 101, name: 'Pañales talla M', status: 'available' },
                    { id: 102, name: 'Ropa 0-3 meses', status: 'reserved' },
                    { id: 103, name: 'Biberones esterilizados', status: 'available' },
                    { id: 104, name: 'Mantas para bebé', status: 'available' },
                    { id: 105, name: 'Toallitas húmedas', status: 'available' },
                ]
            },
            {
                id: 2,
                name: 'Centro de Salud San José',
                avatar: 'E',
                role: 'Organización',
                time: 'Hace 5 horas',
                description: 'Don Ernesto necesita un termómetro digital y medicamentos para su tratamiento. ¡Ayúdanos a completar su lista!',
                verified: true,
                items: [
                    { id: 201, name: 'Termómetro digital', status: 'available' },
                    { id: 202, name: 'Medicamentos A', status: 'available' },
                    { id: 203, name: 'Gasas estériles', status: 'available' },
                    { id: 204, name: 'Alcohol en gel', status: 'reserved' },
                    { id: 205, name: 'Mascarillas quirúrgicas', status: 'available' },
                ]
            },
        ],
        notifications: [
            {
                id: 1,
                text: 'Tu reserva de "Pañales talla M" ha sido confirmada.',
                category: 'reservations',
                status: 'success',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                isRead: false,
                link: 'detail.html?id=1'
            },
            {
                id: 2,
                text: 'Tu historia ha sido verificada por un administrador.',
                category: 'stories',
                status: 'success',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                isRead: true,
                link: 'profile.html'
            },
            {
                id: 3,
                text: 'Aún no has entregado "Ropa 0-3 meses", coordina la entrega.',
                category: 'reservations',
                status: 'warning',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                isRead: false,
                link: 'donations.html'
            },
            {
                id: 4,
                text: 'El beneficiario ha confirmado la recepción de "Biberones esterilizados".',
                category: 'reservations',
                status: 'success',
                timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
                isRead: true,
                link: 'donations.html'
            },
            {
                id: 5,
                text: 'Nueva historia verificada cerca de ti: "Madre soltera busca cuna".',
                category: 'stories',
                status: 'info',
                timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
                isRead: false,
                link: 'index.html'
            },
            {
                id: 6,
                text: 'El ítem "Mantas para bebé" ha sido reservado por otro donante.',
                category: 'reservations',
                status: 'danger',
                timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000),
                isRead: true,
                link: 'detail.html?id=1'
            },
            {
                id: 7,
                text: 'Una reserva de "Toallitas húmedas" ha sido cancelada y el ítem vuelve a estar disponible.',
                category: 'reservations',
                status: 'danger',
                timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000),
                isRead: false,
                link: 'detail.html?id=1'
            }
        ]
    };

    // 2. DOM Elements
    const roleSelect = document.getElementById('role-select');
    const roleViews = document.querySelectorAll('.role-view');
    const profileRole = document.getElementById('profile-role');
    const profileContact = document.getElementById('profile-contact');

    // 3. Core Functions
    function updateUIVisibility() {
        const roleElements = document.querySelectorAll(`[class*="role-"]`);
        roleElements.forEach(el => {
            const roleClass = el.classList.contains('role-beneficiary') ? 'beneficiary' :
                             el.classList.contains('role-donor') ? 'donor' :
                             el.classList.contains('role-admin') ? 'admin' : null;

            if (roleClass) {
                el.style.display = (state.currentRole === roleClass) ? '' : 'none';
            }
        });

        roleViews.forEach(view => {
            view.classList.remove('active');
            if (view.classList.contains(`view-${state.currentRole}`)) {
                view.classList.add('active');
            }
        });

        if (profileRole) {
            profileRole.textContent = `Rol: ${state.currentRole.charAt(0).toUpperCase() + state.currentRole.slice(1)}`;
        }

        if (profileContact) {
            profileContact.style.opacity = (state.currentRole === 'donor') ? '0.5' : '1';
            profileContact.title = (state.currentRole === 'donor') ? 'Visible solo tras confirmar reserva' : '';
        }
    }

    // --- Profile Logic ---

    let isEditingProfile = false;

    function renderProfile() {
        const nameEl = document.getElementById('profile-name');
        const roleEl = document.getElementById('profile-role');
        const avatarEl = document.getElementById('profile-avatar');
        const mainContentContainer = document.querySelector('.main-content .card-box');
        const beneficiaryExtra = document.getElementById('beneficiary-extra');

        if (!nameEl || !mainContentContainer) return;

        nameEl.textContent = state.user.name;
        roleEl.textContent = `Rol: ${state.currentRole.charAt(0).toUpperCase() + state.currentRole.slice(1)}`;
        avatarEl.textContent = state.user.avatar;

        if (isEditingProfile) {
            // Render Editable Personal Information
            mainContentContainer.innerHTML = `
                <div style="display: flex; flex-direction: column; height: 100%;">
                    <div style="flex: 1;">
                        <h3 class="card-title">Información Personal</h3>
                        <div class="profile-details-grid">
                            <div class="detail-field">
                                <label>Nombre</label>
                                <div class="detail-value-edit">
                                    <input type="text" id="edit-name" value="${state.user.name}" style="border:none; background:transparent; width:100%; outline:none; font-size:14px;">
                                    <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </div>
                            </div>
                            <div class="detail-field">
                                <label>Email</label>
                                <div class="detail-value-edit">
                                    <input type="email" id="edit-email" value="${state.user.email}" style="border:none; background:transparent; width:100%; outline:none; font-size:14px;">
                                    <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </div>
                            </div>
                            <div class="detail-field">
                                <label>Dirección</label>
                                <div class="detail-value-edit">
                                    <input type="text" id="edit-address" value="${state.user.address}" style="border:none; background:transparent; width:100%; outline:none; font-size:14px;">
                                    <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </div>
                            </div>
                            <div class="detail-field">
                                <label>Teléfono</label>
                                <div class="detail-value-edit">
                                    <input type="text" id="edit-phone" value="${state.user.phone}" style="border:none; background:transparent; width:100%; outline:none; font-size:14px;">
                                    <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="profile-edit-footer" style="display: flex; justify-content: flex-end; margin-top: 20px;">
                        <button id="btn-save-profile" class="btn-action btn-primary">Guardar Cambios</button>
                    </div>
                </div>
            `;
            document.getElementById('btn-save-profile')?.addEventListener('click', toggleEditMode);
        } else {
            // Render Activity List
            mainContentContainer.innerHTML = `
                <h3 class="card-title">Actividad Reciente</h3>
                <div id="profile-activity-list" class="activity-list"></div>
            `;

            const activityList = document.getElementById('profile-activity-list');
            const filteredActivity = state.userActivity.filter(act => {
                if (state.currentRole === 'donor') return act.category === 'donation';
                if (state.currentRole === 'beneficiary') return act.category === 'story';
                return true;
            });

            if (filteredActivity.length === 0) {
                activityList.innerHTML = '<p class="empty-text">No hay actividad reciente.</p>';
            } else {
                filteredActivity.forEach(act => {
                    const item = document.createElement('div');
                    item.className = `activity-item ${act.status}`;
                    item.dataset.status = act.status;
                    const statusLabel = {
                        success: 'Entregado',
                        info: 'Verificada',
                        warning: 'Pendiente',
                        danger: 'Cancelado'
                    }[act.status] || 'Actividad';

                    item.innerHTML = `
                        <div class="notification-content">
                            <div class="notification-icon">${getStatusIcon(act.status)}</div>
                            <div class="notification-text">
                                <p>${act.text} <span class="activity-status-tag" style="font-size: 12px; font-weight: bold; color: var(--gris-texto); margin-left: 5px;">${statusLabel}</span></p>
                                <span class="time">${act.date}</span>
                            </div>
                        </div>
                    `;
                    item.addEventListener('click', () => alert(`Navegando al detalle de: ${act.text}`));
                    activityList.appendChild(item);
                });
            }
        }

        // Role specific views
        if (beneficiaryExtra) {
            const postsContainer = document.getElementById('beneficiary-posts-container');
            if (state.currentRole === 'beneficiary') {
                beneficiaryExtra.style.display = 'block';
                if (postsContainer) {
                    postsContainer.innerHTML = '';
                    // Filter posts that belong to beneficiaries (simulating "my posts")
                    const myPosts = state.posts.filter(p => p.role === 'Beneficiaria');

                    if (myPosts.length === 0) {
                        postsContainer.innerHTML = '<p class="empty-text">No tienes publicaciones activas.</p>';
                    } else {
                        myPosts.forEach(post => {
                            const card = document.createElement('div');
                            card.className = 'story-card';
                            card.dataset.postId = post.id;

                            card.innerHTML = `
                                <div class="active-pub-layout">
                                    <div class="active-pub-left">
                                        <div class="story-header" style="padding: 0;">
                                            <div class="story-user">
                                                <div class="avatar-circle">${post.avatar}</div>
                                                <div class="story-info">
                                                    <h4>${post.name} ${post.verified ? '<span class="badge-verified">Verificado</span>' : ''}</h4>
                                                    <span>${post.role} • ${post.time}</span>
                                                </div>
                                            </div>
                                            <div class="story-actions">
                                                <button class="btn-action btn-secondary">Editar</button>
                                            </div>
                                        </div>
                                        <div class="story-content" style="padding: 0;">
                                            <p>${post.description}</p>
                                            <div class="story-image">🖼️</div>
                                        </div>
                                    </div>
                                    <div class="active-pub-right">
                                        <h4 class="item-status-title">Estado de Ítems</h4>
                                        <div class="item-status-list">
                                            ${post.items.map(item => `
                                                <div class="status-item">
                                                    <span>${item.name}</span>
                                                    <span class="badge ${item.status === 'available' ? 'badge-green' : 'badge-orange'}">
                                                        ${item.status === 'available' ? 'Disponible' : 'Reservado'}
                                                    </span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            `;
                            card.addEventListener('click', (e) => {
                                if (!e.target.closest('.btn-action')) {
                                    window.location.href = `detail.html?id=${post.id}`;
                                }
                            });
                            postsContainer.appendChild(card);
                        });
                    }
                }
            } else {
                beneficiaryExtra.style.display = 'none';
            }
        }
    }

    function getStatusIcon(status) {
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            danger: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
        };
        return icons[status] || icons.info;
    }

    function toggleEditMode() {
        isEditingProfile = !isEditingProfile;

        if (!isEditingProfile) {
            // Save logic - capture values from inputs if they exist
            const name = document.getElementById('edit-name')?.value;
            const email = document.getElementById('edit-email')?.value;
            const addr = document.getElementById('edit-address')?.value;
            const phone = document.getElementById('edit-phone')?.value;

            if (name) state.user.name = name;
            if (email) state.user.email = email;
            if (addr) state.user.address = addr;
            if (phone) state.user.phone = phone;
        }
        renderProfile();
    }

    // --- Notification Logic ---

    function formatRelativeTime(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'Hace unos segundos';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }

    function updateNotificationCounter() {
        const counter = document.getElementById('notification-count');
        if (!counter) return;
        const unreadCount = state.notifications.filter(n => !n.isRead).length;
        counter.textContent = unreadCount;
        counter.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    function renderNotifications(filter = 'all') {
        const container = document.getElementById('notifications-container');
        const emptyState = document.getElementById('notifications-empty');
        if (!container || !emptyState) return;

        container.innerHTML = '';

        const filtered = state.notifications.filter(n => {
            if (filter === 'all') return true;
            if (filter === 'reservations') return n.category === 'reservations';
            if (filter === 'stories') return n.category === 'stories';
            return true;
        });

        if (filtered.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'flex';
        emptyState.style.display = 'none';

        filtered.sort((a, b) => b.timestamp - a.timestamp).forEach(n => {
            const item = document.createElement('div');
            item.className = `notification-item ${n.isRead ? '' : 'unread'}`;
            item.dataset.status = n.status;

            const exactDate = n.timestamp.toLocaleString();

            item.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">${getNotificationIcon(n.status)}</div>
                    <div class="notification-text">
                        <p>${n.text}</p>
                        <span class="time" title="${exactDate}">${formatRelativeTime(n.timestamp)}</span>
                    </div>
                </div>
                ${n.isRead ? '' : '<div class="unread-dot"></div>'}
            `;

            item.addEventListener('click', () => {
                n.isRead = true;
                updateNotificationCounter();
                renderNotifications(filter);
                window.location.href = n.link;
            });

            container.appendChild(item);
        });
    }

    function getNotificationIcon(status) {
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            danger: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
        };
        return icons[status] || icons.info;
    }

    function markAllAsRead() {
        state.notifications.forEach(n => n.isRead = true);
        updateNotificationCounter();
        renderNotifications(document.querySelector('.filter-tab.active')?.dataset.filter || 'all');
    }

    function renderDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = parseInt(urlParams.get('id'));
        if (!postId) return;

        const post = state.posts.find(p => p.id === postId);
        if (!post) return;

        document.getElementById('detail-name').textContent = post.name;
        document.getElementById('detail-avatar').textContent = post.avatar;
        document.getElementById('detail-description').textContent = post.description;
        document.getElementById('detail-badge').style.display = post.verified ? 'inline-block' : 'none';

        // Update Progress Bar
        const totalItems = post.items.length;
        const completedItems = post.items.filter(item => item.status !== 'available').length;
        const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.getElementById('progress-text');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${percentage}% Completado`;
        }

        const itemsList = document.getElementById('detail-items-list');
        itemsList.innerHTML = '';

        post.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'story-item';

            let statusLabel = item.status === 'available' ? 'Disponible' :
                             item.status === 'reserved' ? 'Reservado' : 'Entregado';
            let badgeClass = item.status === 'available' ? 'badge-green' : 'badge-orange';
            let btnLabel = item.status === 'available' ? 'Reservar' : statusLabel;
            let btnDisabled = item.status !== 'available' ? 'disabled' : '';

            itemDiv.innerHTML = `
                <span>${item.name}</span>
                <span class="badge ${badgeClass}">${statusLabel}</span>
                <button class="btn-reserve ${btnDisabled}" ${btnDisabled ? 'disabled' : ''} data-item-id="${item.id}">${btnLabel}</button>
            `;
            itemsList.appendChild(itemDiv);
        });

        itemsList.querySelectorAll('.btn-reserve').forEach(btn => {
            btn.addEventListener('click', () => handleReserve(parseInt(btn.dataset.itemId)));
        });
    }

    function handleReserve(itemId) {
        let itemFound = null;
        state.posts.forEach(p => {
            const item = p.items.find(i => i.id === itemId);
            if (item) itemFound = item;
        });

        if (itemFound && itemFound.status === 'available') {
            itemFound.status = 'reserved';
            alert(`Has reservado el ítem. Ahora aparecerá en tu sección de Donaciones.`);
            renderDetail();
        }
    }

    // 4. Event Listeners
    if (roleSelect) {
        roleSelect.value = state.currentRole;
        roleSelect.addEventListener('change', (e) => {
            state.currentRole = e.target.value;
            localStorage.setItem('robinRole', state.currentRole);
            updateUIVisibility();
        });
    }

    document.addEventListener('click', (e) => {
        // "Ver Necesidades" buttons in Feed
        const btn = e.target.closest('.btn-action.btn-primary');
        if (btn) {
            e.preventDefault();
            const card = btn.closest('.story-card');
            const postId = card ? card.dataset.postId : null;
            if (postId) window.location.href = `detail.html?id=${postId}`;
        }

        // Profile Edit Button
        if (e.target.id === 'btn-edit-profile') {
            if (!isEditingProfile) {
                toggleEditMode();
            }
        }

        // Change Photo Button
        if (e.target.id === 'btn-change-photo') {
            alert('Abriendo selector de archivos...');
        }

        // Notification Filter Tabs
        const filterTab = e.target.closest('.filter-tab');
        if (filterTab) {
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.toggle('active', tab === filterTab);
            });
            renderNotifications(filterTab.dataset.filter);
        }

        // Mark All As Read
        if (e.target.id === 'mark-all-read') {
            markAllAsRead();
        }

        // Donations Tab Logic
        if (e.target.classList.contains('tab-btn') && e.target.closest('.donations-tabs')) {
            const tab = e.target.dataset.tab;
            document.querySelectorAll('.donations-tabs .tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tab);
            });

            const items = document.querySelectorAll('.donation-item');
            const groups = document.querySelectorAll('.beneficiary-group');

            items.forEach(item => {
                const status = item.dataset.status;
                if (tab === 'all') item.style.display = 'flex';
                else if (tab === 'pending' && status === 'pending') item.style.display = 'flex';
                else if (tab === 'delivered' && status === 'delivered') item.style.display = 'flex';
                else item.style.display = 'none';
            });

            groups.forEach(group => {
                const hasVisibleItems = Array.from(group.querySelectorAll('.donation-item'))
                    .some(item => item.style.display !== 'none');
                group.style.display = hasVisibleItems ? 'block' : 'none';
            });
        }

        // Confirm Delivery
        if (e.target.classList.contains('btn-confirm')) {
            e.preventDefault();
            const item = e.target.closest('.donation-item');
            item.dataset.status = 'delivered';
            item.querySelector('.badge').textContent = 'Entregado';
            item.querySelector('.badge').className = 'badge badge-green';
            const actions = item.querySelector('.donation-actions');
            if (actions) {
                const btnContainer = actions.querySelector('.action-buttons');
                if (btnContainer) btnContainer.innerHTML = '';
            }
            item.querySelector('.beneficiary-mini-info').innerHTML = `<span class="date-info">Entregado ahora</span>`;

            const activeTab = document.querySelector('.donations-tabs .tab-btn.active')?.dataset.tab;
            if (activeTab === 'pending') {
                item.style.display = 'none';
                const group = item.closest('.beneficiary-group');
                if (group) {
                    const hasVisible = Array.from(group.querySelectorAll('.donation-item'))
                        .some(i => i.style.display !== 'none');
                    group.style.display = hasVisible ? 'block' : 'none';
                }
            }
        }

        // Cancel Reservation
        if (e.target.classList.contains('btn-cancel')) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
                const item = e.target.closest('.donation-item');
                item.remove();
                const group = item?.closest('.beneficiary-group');
                if (group) {
                    const hasVisible = Array.from(group.querySelectorAll('.donation-item')).length > 0;
                    group.style.display = hasVisible ? 'block' : 'none';
                }
            }
        }
    });

    // Initialization based on current page
    const path = window.location.pathname;
    if (path.includes('detail.html')) {
        renderDetail();
    }
    updateUIVisibility();
    updateNotificationCounter();
    if (path.includes('notifications.html')) {
        renderNotifications();
    }
    if (path.includes('profile.html')) {
        renderProfile();
    }
});