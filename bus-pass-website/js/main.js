// Main JavaScript functionality

// Global variables
let currentBooking = {};
let userTickets = JSON.parse(localStorage.getItem('userTickets')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const departureDateInput = document.getElementById('departure-date');
    if (departureDateInput) {
        departureDateInput.setAttribute('min', today);
    }
    
    // Initialize all components
    initializeNavigation();
    initializeSampleData();
});

// Navigation functionality
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = ['home', 'booking', 'my-tickets', 'contact'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Special handling for tickets section
        if (sectionId === 'my-tickets' && typeof displayTickets === 'function') {
            displayTickets();
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize sample data for demonstration
function initializeSampleData() {
    if (userTickets.length === 0) {
        const sampleTickets = [
            {
                id: 'QR12345678',
                passengerName: 'John Doe',
                passengerEmail: 'john@example.com',
                passengerPhone: '+233241234567',
                from: 'Accra',
                to: 'Kumasi',
                departureDate: '2025-07-15',
                departureTime: '08:00',
                passengers: '2',
                ticketType: 'business',
                totalPrice: 90,
                paymentMethod: 'momo',
                bookingDate: '2025-06-20',
                bookingTime: '14:30:00',
                status: 'upcoming',
                seatNumbers: ['12A', '12B']
            },
            {
                id: 'QR87654321',
                passengerName: 'Jane Smith',
                passengerEmail: 'jane@example.com',
                passengerPhone: '+233209876543',
                from: 'Tema',
                to: 'Cape Coast',
                departureDate: '2025-06-25',
                departureTime: '14:00',
                passengers: '1',
                ticketType: 'vip',
                totalPrice: 65,
                paymentMethod: 'card',
                bookingDate: '2025-06-18',
                bookingTime: '10:15:00',
                status: 'completed',
                seatNumbers: ['8A']
            }
        ];
        
        userTickets = sampleTickets;
        localStorage.setItem('userTickets', JSON.stringify(userTickets));
    }
}