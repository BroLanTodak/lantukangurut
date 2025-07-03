// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add floating animation to particles
function createParticles() {
    const particles = document.querySelector('.particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 15 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 6 + 's';
        particles.appendChild(particle);
    }
}

// Initialize particles on load
window.addEventListener('load', createParticles);

// Header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Calendar functionality
let allEvents = [];
let filteredEvents = [];

// Load calendar data
async function loadCalendarData() {
    try {
        const response = await fetch('./cuti_perayaan_2025.json');
        const data = await response.json();
        allEvents = data.perayaan;
        filteredEvents = [...allEvents];
        
        // Update statistics
        updateStatistics(data.statistik);
        
        // Render calendar
        renderCalendar();
        
        // Setup event listeners
        setupFilters();
        
    } catch (error) {
        console.error('Error loading calendar data:', error);
        document.getElementById('calendarGrid').innerHTML = 
            '<div class="loading">Ralat memuatkan data kalendar. Sila cuba lagi.</div>';
    }
}

// Update statistics display
function updateStatistics(stats) {
    document.getElementById('totalHolidays').textContent = stats.jumlah_cuti_kebangsaan + stats.jumlah_cuti_negeri + stats.jumlah_perayaan_tradisional;
    document.getElementById('publicHolidays').textContent = stats.jumlah_cuti_kebangsaan;
    document.getElementById('stateHolidays').textContent = stats.jumlah_cuti_negeri;
    document.getElementById('traditionalEvents').textContent = stats.jumlah_perayaan_tradisional;
}

// Render calendar events
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    
    if (filteredEvents.length === 0) {
        calendarGrid.innerHTML = '<div class="loading">Tiada perayaan ditemui untuk filter yang dipilih.</div>';
        return;
    }
    
    // Sort events by date
    filteredEvents.sort((a, b) => new Date(a.tarikh) - new Date(b.tarikh));
    
    const eventsHTML = filteredEvents.map(event => {
        const eventClass = getEventClass(event.jenis);
        const formattedDate = formatDate(event.tarikh);
        const traditions = event.tradisi.slice(0, 3); // Show max 3 traditions
        
        return `
            <div class="calendar-event ${eventClass}">
                <div class="event-date">${formattedDate}</div>
                <h3 class="event-title">${event.nama}</h3>
                <div class="event-type">${getEventTypeLabel(event.jenis)}</div>
                <div class="event-kaum">Kaum: ${getKaumLabel(event.kaum)}</div>
                <p class="event-meaning">${event.makna}</p>
                <div class="event-traditions">
                    ${traditions.map(tradition => `<span class="tradition-tag">${tradition}</span>`).join('')}
                    ${event.tradisi.length > 3 ? `<span class="tradition-tag">+${event.tradisi.length - 3} lagi</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    calendarGrid.innerHTML = eventsHTML;
}

// Get CSS class for event type
function getEventClass(jenis) {
    switch(jenis) {
        case 'cuti_umum': return 'cuti-kebangsaan';
        case 'cuti_negeri': return 'cuti-negeri';
        case 'perayaan_tradisional': return 'perayaan-tradisional';
        default: return '';
    }
}

// Get event type label
function getEventTypeLabel(jenis) {
    switch(jenis) {
        case 'cuti_umum': return 'Cuti Kebangsaan';
        case 'cuti_negeri': return 'Cuti Negeri';
        case 'perayaan_tradisional': return 'Perayaan Tradisional';
        default: return jenis;
    }
}

// Get kaum label
function getKaumLabel(kaum) {
    switch(kaum) {
        case 'semua': return 'Semua Rakyat';
        case 'melayu': return 'Melayu/Islam';
        case 'cina': return 'Cina';
        case 'india': return 'India/Hindu';
        case 'kristian': return 'Kristian';
        case 'dayak': return 'Dayak';
        case 'kadazandusun': return 'Kadazandusun';
        case 'punjabi': return 'Punjabi/Sikh';
        case 'thai': return 'Thai';
        case 'bali': return 'Bali';
        default: return kaum;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('ms-MY', options);
}

// Setup filter event listeners
function setupFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const kaumFilter = document.getElementById('kaumFilter');
    const searchInput = document.getElementById('searchInput');
    
    typeFilter.addEventListener('change', applyFilters);
    kaumFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
}

// Apply filters
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const kaumFilter = document.getElementById('kaumFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredEvents = allEvents.filter(event => {
        // Type filter
        const typeMatch = typeFilter === 'all' || event.jenis === typeFilter;
        
        // Kaum filter
        let kaumMatch = true;
        if (kaumFilter !== 'all') {
            if (kaumFilter === 'pribumi') {
                kaumMatch = event.kaum === 'dayak' || event.kaum === 'kadazandusun';
            } else {
                kaumMatch = event.kaum === kaumFilter;
            }
        }
        
        // Search filter
        const searchMatch = searchTerm === '' || 
            event.nama.toLowerCase().includes(searchTerm) ||
            event.makna.toLowerCase().includes(searchTerm) ||
            event.kaum.toLowerCase().includes(searchTerm);
        
        return typeMatch && kaumMatch && searchMatch;
    });
    
    renderCalendar();
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page with calendar section
    if (document.getElementById('calendarGrid')) {
        loadCalendarData();
    }
});