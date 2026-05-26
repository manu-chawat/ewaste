// server.js - Main Express Server
// E-Waste Collection System

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// ============================================
// ADMIN CREDENTIALS (Yahan apna password badlo)
// ============================================
const ADMIN_EMAIL = 'admin@ewaste.com';
const ADMIN_PASSWORD = 'admin123';

// ============================================
// MIDDLEWARE SETUP
// ============================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'ewaste_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ADMIN AUTH MIDDLEWARE
// ============================================
function isAdminLoggedIn(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin-login');
    }
}

// ============================================
// PAGE ROUTES
// ============================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));
app.get('/commercial', (req, res) => res.sendFile(path.join(__dirname, 'public', 'commercial.html')));
app.get('/residential', (req, res) => res.sendFile(path.join(__dirname, 'public', 'residential.html')));
app.get('/events', (req, res) => res.sendFile(path.join(__dirname, 'public', 'events.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// ============================================
// ADMIN LOGIN PAGE
// ============================================
app.get('/admin-login', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin');
    res.send(`
    <html>
    <head>
        <title>Admin Login - E-Waste</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial; background: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; }
            .card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: 380px; }
            h2 { color: #1a5c38; text-align: center; margin-bottom: 25px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; font-size: 14px; }
            input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 18px; font-size: 14px; }
            button { width: 100%; background: #1a5c38; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 16px; cursor: pointer; }
            button:hover { background: #145230; }
            .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; text-align: center; }
            .logo { text-align: center; font-size: 40px; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">🌱</div>
            <h2>Admin Login</h2>
            ${req.query.error ? '<div class="error">❌ Email ya Password galat hai!</div>' : ''}
            <form method="POST" action="/admin-login">
                <label>Email</label>
                <input type="email" name="email" placeholder="admin@ewaste.com" required />
                <label>Password</label>
                <input type="password" name="password" placeholder="Password daalo" required />
                <button type="submit">🔐 Login Karein</button>
            </form>
        </div>
    </body>
    </html>`);
});

app.post('/admin-login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        console.log('🔐 Admin Logged In');
        res.redirect('/admin');
    } else {
        res.redirect('/admin-login?error=1');
    }
});

app.get('/admin-logout', (req, res) => {
    req.session.isAdmin = false;
    res.redirect('/admin-login');
});

// ============================================
// FORM ROUTES
// ============================================

// --- 1. CONTACT FORM ---
app.post('/Request', async (req, res) => {
    const { name, email, 'phone no.': phone, message } = req.body;
    if (!name || !email || !message) {
        return res.send(`<script>alert('Sabhi fields fill karein!'); window.history.back();</script>`);
    }
    try {
        await db.execute(`INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)`, [name, email, phone || '', message]);
        console.log(`📧 New Contact Request from: ${name}`);
        res.send(`<html><body style="font-family:Arial; text-align:center; padding:50px; background:#f4f7f6;">
            <div style="background:white; padding:40px; border-radius:10px; max-width:500px; margin:auto; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#198754;">✅ Request Submitted!</h2>
                <p>Dhanyavaad <strong>${name}</strong>! Aapka message humein mil gaya.</p>
                <a href="/" style="background:#198754; color:white; padding:10px 25px; border-radius:5px; text-decoration:none;">Home Par Jayen</a>
            </div></body></html>`);
    } catch (err) {
        res.send(`<script>alert('Error: ${err.message}'); window.history.back();</script>`);
    }
});

// --- 2. COMMERCIAL PICKUP ---
app.post('/commercial-pickup', async (req, res) => {
    const { name, email, address, service } = req.body;
    if (!name || !email || !address || !service || service === 'Select Service') {
        return res.send(`<script>alert('Sabhi fields fill karein!'); window.history.back();</script>`);
    }
    try {
        await db.execute(`INSERT INTO pickup_requests (name, email, address, item_type, service_type) VALUES (?, ?, ?, ?, 'commercial')`, [name, email, address, service]);
        console.log(`🏢 New Commercial Pickup from: ${name}`);
        res.send(`<html><body style="font-family:Arial; text-align:center; padding:50px; background:#f4f7f6;">
            <div style="background:white; padding:40px; border-radius:10px; max-width:500px; margin:auto; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#198754;">✅ Commercial Pickup Scheduled!</h2>
                <p>Dhanyavaad <strong>${name}</strong>! Aapki commercial pickup request submit ho gayi.</p>
                <a href="/" style="background:#198754; color:white; padding:10px 25px; border-radius:5px; text-decoration:none;">Home Par Jayen</a>
            </div></body></html>`);
    } catch (err) {
        res.send(`<script>alert('Error aaya: ${err.message}'); window.history.back();</script>`);
    }
});

// --- 3. RESIDENTIAL PICKUP ---
app.post('/residential-pickup', async (req, res) => {
    const { name, email, address, service } = req.body;
    if (!name || !email || !address || !service || service === 'Select Service') {
        return res.send(`<script>alert('Sabhi fields fill karein!'); window.history.back();</script>`);
    }
    try {
        await db.execute(`INSERT INTO pickup_requests (name, email, address, item_type, service_type) VALUES (?, ?, ?, ?, 'residential')`, [name, email, address, service]);
        console.log(`🏠 New Residential Pickup from: ${name}`);
        res.send(`<html><body style="font-family:Arial; text-align:center; padding:50px; background:#f4f7f6;">
            <div style="background:white; padding:40px; border-radius:10px; max-width:500px; margin:auto; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#198754;">✅ Residential Pickup Booked!</h2>
                <p>Dhanyavaad <strong>${name}</strong>! Aapki pickup request confirm ho gayi.</p>
                <a href="/" style="background:#198754; color:white; padding:10px 25px; border-radius:5px; text-decoration:none;">Home Par Jayen</a>
            </div></body></html>`);
    } catch (err) {
        res.send(`<script>alert('Error aaya: ${err.message}'); window.history.back();</script>`);
    }
});

// --- 4. EVENT PICKUP ---
app.post('/event-pickup', async (req, res) => {
    const { name, email, address, service } = req.body;
    if (!name || !email || !address || !service || service === 'Select Service') {
        return res.send(`<script>alert('Sabhi fields fill karein!'); window.history.back();</script>`);
    }
    try {
        await db.execute(`INSERT INTO pickup_requests (name, email, address, item_type, service_type) VALUES (?, ?, ?, ?, 'collection_event')`, [name, email, address, service]);
        console.log(`🎪 New Event Registration from: ${name}`);
        res.send(`<html><body style="font-family:Arial; text-align:center; padding:50px; background:#f4f7f6;">
            <div style="background:white; padding:40px; border-radius:10px; max-width:500px; margin:auto; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#198754;">✅ Event Registration Done!</h2>
                <p>Dhanyavaad <strong>${name}</strong>! Aap event mein registered ho gaye hain.</p>
                <a href="/" style="background:#198754; color:white; padding:10px 25px; border-radius:5px; text-decoration:none;">Home Par Jayen</a>
            </div></body></html>`);
    } catch (err) {
        res.send(`<script>alert('Error aaya: ${err.message}'); window.history.back();</script>`);
    }
});

// --- 5. USER LOGIN ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.send(`<script>alert('Email aur Password dono zaruri hain!'); window.history.back();</script>`);
    }
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.send(`<script>alert('Email nahi mila.'); window.history.back();</script>`);
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send(`<script>alert('Password galat hai!'); window.history.back();</script>`);
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;
        console.log(`🔐 User Logged In: ${user.email}`);
        // Admin check karo
        if (user.email === ADMIN_EMAIL) {
            req.session.isAdmin = true;
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.send(`<script>alert('Login mein error: ${err.message}'); window.history.back();</script>`);
    }
});

// --- 6. REGISTER ---
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.send(`<script>alert('Sabhi fields zaruri hain!'); window.history.back();</script>`);
    }
    try {
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.send(`<script>alert('Email already registered hai!'); window.history.back();</script>`);
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        console.log(`👤 New User: ${email}`);
        res.send(`<html><body style="font-family:Arial; text-align:center; padding:50px; background:#f4f7f6;">
            <div style="background:white; padding:40px; border-radius:10px; max-width:500px; margin:auto; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color:#198754;">✅ Registration Successful!</h2>
                <p>Aapka account ban gaya. Ab login karein.</p>
                <a href="/login" style="background:#198754; color:white; padding:10px 25px; border-radius:5px; text-decoration:none;">Login Karein</a>
            </div></body></html>`);
    } catch (err) {
        res.send(`<script>alert('Registration error: ${err.message}'); window.history.back();</script>`);
    }
});

// --- 7. LOGOUT ---
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ============================================
// ADMIN API ROUTES (Protected)
// ============================================

// Status Update
app.post('/admin/update-status', isAdminLoggedIn, async (req, res) => {
    const { id, status } = req.body;
    try {
        await db.execute('UPDATE pickup_requests SET status = ? WHERE id = ?', [status, id]);
        console.log(`✅ Status updated: ID ${id} → ${status}`);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// Delete Pickup Request
app.post('/admin/delete-pickup', isAdminLoggedIn, async (req, res) => {
    const { id } = req.body;
    try {
        await db.execute('DELETE FROM pickup_requests WHERE id = ?', [id]);
        console.log(`🗑️ Deleted pickup request ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// Delete Contact Message
app.post('/admin/delete-contact', isAdminLoggedIn, async (req, res) => {
    const { id } = req.body;
    try {
        await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
        console.log(`🗑️ Deleted contact message ID: ${id}`);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

// ============================================
// ADMIN PANEL (Protected)
// ============================================
app.get('/admin', isAdminLoggedIn, async (req, res) => {
    try {
        const [pickups] = await db.execute('SELECT * FROM pickup_requests ORDER BY created_at DESC');
        const [contacts] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
        const [users] = await db.execute('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');

        const pendingCount = pickups.filter(p => p.status === 'pending').length;
        const completedCount = pickups.filter(p => p.status === 'completed').length;
        const commercialCount = pickups.filter(p => p.service_type === 'commercial').length;
        const residentialCount = pickups.filter(p => p.service_type === 'residential').length;
        const eventCount = pickups.filter(p => p.service_type === 'collection_event').length;

        let pickupRows = pickups.map(r => `
            <tr id="row-${r.id}" class="data-row" style="${r.status === 'completed' ? 'background:#d4edda;' : ''}">
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.email}</td>
                <td>${r.address}</td>
                <td>${r.item_type}</td>
                <td><span class="badge ${r.service_type}">${r.service_type}</span></td>
                <td><span class="status ${r.status}">${r.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</span></td>
                <td>${new Date(r.created_at).toLocaleString('en-IN')}</td>
                <td style="white-space:nowrap;">
                    ${r.status === 'pending' ?
                        `<button onclick="updateStatus(${r.id}, 'completed')" class="btn-complete">✅ Complete</button>`
                        :
                        `<button onclick="updateStatus(${r.id}, 'pending')" class="btn-pending">🔄 Pending</button>`
                    }
                    <button onclick="deletePickup(${r.id})" class="btn-delete">🗑️ Delete</button>
                </td>
            </tr>`).join('');

        let contactRows = contacts.map(r => `
            <tr id="contact-row-${r.id}" class="data-row">
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.email}</td>
                <td>${r.phone || '-'}</td>
                <td>${r.message}</td>
                <td>${new Date(r.created_at).toLocaleString('en-IN')}</td>
                <td><button onclick="deleteContact(${r.id})" class="btn-delete">🗑️ Delete</button></td>
            </tr>`).join('');

        let userRows = users.map(u => `
            <tr class="data-row">
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${new Date(u.created_at).toLocaleString('en-IN')}</td>
            </tr>`).join('');

        res.send(`
        <html>
        <head>
            <title>Admin Panel - E-Waste</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: Arial; background: #f4f7f6; }
                .navbar { background: #1a5c38; color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
                .navbar h1 { font-size: 20px; }
                .navbar a { color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 6px; font-size: 14px; }
                .navbar a:hover { background: rgba(255,255,255,0.3); }
                .container { padding: 25px; }
                h2 { color: #1a5c38; margin: 30px 0 15px; }

                /* Stats Cards */
                .stats { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 25px; }
                .stat-card { background: white; border-radius: 12px; padding: 20px 25px; flex: 1; min-width: 150px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); text-align: center; }
                .stat-card .num { font-size: 36px; font-weight: bold; color: #1a5c38; }
                .stat-card .num.yellow { color: #ffc107; }
                .stat-card .num.green { color: #198754; }
                .stat-card .label { font-size: 13px; color: #666; margin-top: 5px; }

                /* Charts */
                .charts { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
                .chart-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); flex: 1; min-width: 280px; }
                .chart-card h3 { color: #1a5c38; margin-bottom: 15px; font-size: 15px; }

                /* Search */
                .search-bar { margin-bottom: 15px; }
                .search-bar input { padding: 9px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; width: 300px; }

                /* Table */
                table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 30px; }
                th { background: #1a5c38; color: white; padding: 12px; text-align: left; font-size: 13px; }
                td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }

                /* Badges & Status */
                .badge { padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: bold; }
                .commercial { background: #d1ecf1; color: #0c5460; }
                .residential { background: #d4edda; color: #155724; }
                .collection_event { background: #fff3cd; color: #856404; }
                .status { padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: bold; }
                .status.pending { background: #ffc107; color: #333; }
                .status.completed { background: #198754; color: white; }

                /* Buttons */
                .btn-complete { background: #198754; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
                .btn-pending { background: #ffc107; color: #333; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 4px; }
                .btn-delete { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px; }
                .btn-complete:hover { background: #145230; }
                .btn-delete:hover { background: #b02a37; }
            </style>
        </head>
        <body>
            <div class="navbar">
                <h1>🌱 E-Waste Admin Panel</h1>
                <a href="/admin-logout">🚪 Logout</a>
            </div>

            <div class="container">

                <!-- STATS CARDS -->
                <div class="stats">
                    <div class="stat-card"><div class="num">${pickups.length}</div><div class="label">📦 Total Pickups</div></div>
                    <div class="stat-card"><div class="num yellow">${pendingCount}</div><div class="label">⏳ Pending</div></div>
                    <div class="stat-card"><div class="num green">${completedCount}</div><div class="label">✅ Completed</div></div>
                    <div class="stat-card"><div class="num">${contacts.length}</div><div class="label">📧 Messages</div></div>
                    <div class="stat-card"><div class="num">${users.length}</div><div class="label">👤 Users</div></div>
                </div>

                <!-- CHARTS -->
                <div class="charts">
                    <div class="chart-card">
                        <h3>📊 Status Overview</h3>
                        <canvas id="statusChart" height="200"></canvas>
                    </div>
                    <div class="chart-card">
                        <h3>📊 Service Type Breakdown</h3>
                        <canvas id="serviceChart" height="200"></canvas>
                    </div>
                </div>

                <!-- PICKUP REQUESTS TABLE -->
                <h2>📦 Pickup Requests</h2>
                <div class="search-bar">
                    <input type="text" id="pickupSearch" onkeyup="searchTable('pickupSearch', 'pickupTable')" placeholder="🔍 Naam ya email se search karein..." />
                </div>
                <table id="pickupTable">
                    <thead>
                        <tr>
                            <th>ID</th><th>Naam</th><th>Email</th><th>Address</th>
                            <th>Item</th><th>Type</th><th>Status</th><th>Date</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${pickupRows}</tbody>
                </table>

                <!-- CONTACT MESSAGES TABLE -->
                <h2>📧 Contact Messages</h2>
                <div class="search-bar">
                    <input type="text" id="contactSearch" onkeyup="searchTable('contactSearch', 'contactTable')" placeholder="🔍 Naam ya email se search karein..." />
                </div>
                <table id="contactTable">
                    <thead>
                        <tr>
                            <th>ID</th><th>Naam</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>${contactRows}</tbody>
                </table>

                <!-- USERS TABLE -->
                <h2>👤 Registered Users</h2>
                <div class="search-bar">
                    <input type="text" id="userSearch" onkeyup="searchTable('userSearch', 'userTable')" placeholder="🔍 Naam ya email se search karein..." />
                </div>
                <table id="userTable">
                    <thead>
                        <tr><th>ID</th><th>Naam</th><th>Email</th><th>Registered Date</th></tr>
                    </thead>
                    <tbody>${userRows}</tbody>
                </table>

            </div>

            <script>
                // ---- CHARTS ----
                new Chart(document.getElementById('statusChart'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Pending', 'Completed'],
                        datasets: [{
                            data: [${pendingCount}, ${completedCount}],
                            backgroundColor: ['#ffc107', '#198754'],
                            borderWidth: 2
                        }]
                    },
                    options: { plugins: { legend: { position: 'bottom' } } }
                });

                new Chart(document.getElementById('serviceChart'), {
                    type: 'bar',
                    data: {
                        labels: ['Commercial', 'Residential', 'Collection Event'],
                        datasets: [{
                            label: 'Requests',
                            data: [${commercialCount}, ${residentialCount}, ${eventCount}],
                            backgroundColor: ['#0c5460', '#155724', '#856404'],
                            borderRadius: 6
                        }]
                    },
                    options: {
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                    }
                });

                // ---- SEARCH ----
                function searchTable(inputId, tableId) {
                    const filter = document.getElementById(inputId).value.toLowerCase();
                    const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(filter) ? '' : 'none';
                    });
                }

                // ---- STATUS UPDATE ----
                async function updateStatus(id, status) {
                    const res = await fetch('/admin/update-status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, status })
                    });
                    const result = await res.json();
                    if (result.success) location.reload();
                    else alert('Error: ' + result.error);
                }

                // ---- DELETE PICKUP ----
                async function deletePickup(id) {
                    if (!confirm('Kya aap sure hain? Yeh request delete ho jayegi!')) return;
                    const res = await fetch('/admin/delete-pickup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    });
                    const result = await res.json();
                    if (result.success) {
                        document.getElementById('row-' + id).remove();
                    } else {
                        alert('Error: ' + result.error);
                    }
                }

                // ---- DELETE CONTACT ----
                async function deleteContact(id) {
                    if (!confirm('Kya aap sure hain? Yeh message delete ho jayega!')) return;
                    const res = await fetch('/admin/delete-contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    });
                    const result = await res.json();
                    if (result.success) {
                        document.getElementById('contact-row-' + id).remove();
                    } else {
                        alert('Error: ' + result.error);
                    }
                }
            </script>
        </body>
        </html>`);
    } catch (err) {
        res.send('Error: ' + err.message);
    }
});

// ============================================
// SERVER START
// ============================================
app.listen(PORT, () => {
    console.log('');
    console.log('🌱 ====================================');
    console.log('   E-WASTE COLLECTION SYSTEM STARTED');
    console.log('🌱 ====================================');
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📊 Database: ewaste (MySQL)`);
    console.log('');
    console.log('📄 Pages:');
    console.log(`   Home     → http://localhost:${PORT}/`);
    console.log(`   Contact  → http://localhost:${PORT}/contact`);
    console.log(`   Login    → http://localhost:${PORT}/login`);
    console.log(`   Admin    → http://localhost:${PORT}/admin`);
    console.log('');
    console.log('🔐 Admin Credentials:');
    console.log(`   Email    → admin@ewaste.com`);
    console.log(`   Password → admin123`);
    console.log('🌱 ====================================');
});
