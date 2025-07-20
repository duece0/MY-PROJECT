// QuickRide Bus Booking Application
// Author: QuickRide Team
// Version: 1.0

// Global State Management
let currentBookingData = {};
let tickets = JSON.parse(localStorage.getItem('quickride_tickets')) || [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    registerServiceWorker();
});

function initializeApp() {
    setupEventListeners();
    setMinDate();
    calculatePrice();
    loadTickets();
    setupNavigation();
    setupMobileMenu();
}

// Navigation System
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.remove('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load tickets if showing my-tickets section
        if (sectionId === 'my-tickets') {
            loadTickets();
        }
    }
}

// Mobile Menu Setup
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Booking form
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', handleContactSubmit);
    
    // Price calculation
    const priceInputs = ['departure', 'destination', 'passengers', 'ticketType'];
    priceInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        element.addEventListener('change', calculatePrice);
    });
    
    // Payment modal
    setupPaymentModal();
    
    // Filter buttons
    setupFilterButtons();
    
    // Card input formatting
    setupCardFormatting();
    
    // Modal close handlers
    setupModalCloseHandlers();
}

// Set minimum date for booking (today)
function setMinDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
}

// Price Calculation
function calculatePrice() {
    const departure = document.getElementById('departure').value;
    const destination = document.getElementById('destination').value;
    const passengers = parseInt(document.getElementById('passengers').value) || 0;
    const ticketTypeSelect = document.getElementById('ticketType');
    const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
    const basePrice = parseInt(selectedOption.getAttribute('data-price')) || 0;
    
    let totalPrice = 0;
    
    if (departure && destination && passengers && basePrice) {
        // Base calculation
        totalPrice = basePrice * passengers;
        
        // Distance-based pricing adjustment
        const distanceMultiplier = getDistanceMultiplier(departure, destination);
        totalPrice = Math.round(totalPrice * distanceMultiplier);
    }
    
    document.getElementById('totalPrice').textContent = `GHS ${totalPrice}`;
    return totalPrice;
}

function getDistanceMultiplier(departure, destination) {
    // Simulate distance-based pricing
    const distances = {
        'Accra-Kumasi': 1.2,
        'Accra-Tamale': 1.8,
        'Accra-Cape Coast': 0.8,
        'Accra-Takoradi': 1.0,
        'Accra-Ho': 0.9,
        'Accra-Sunyani': 1.3,
        'Kumasi-Tamale': 1.5,
        'Kumasi-Cape Coast': 1.4,
        // Add more routes as needed
    };
    
    const route = `${departure}-${destination}`;
    const reverseRoute = `${destination}-${departure}`;
    
    return distances[route] || distances[reverseRoute] || 1.0;
}

// Booking Form Submission
function handleBookingSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateBookingForm()) {
        return;
    }
    
    // Collect booking data
    currentBookingData = {
        departure: document.getElementById('departure').value,
        destination: document.getElementById('destination').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        passengers: parseInt(document.getElementById('passengers').value),
        ticketType: document.getElementById('ticketType').value,
        totalPrice: calculatePrice()
    };
    
    // Show payment modal
    showPaymentModal();
}

function validateBookingForm() {
    const departure = document.getElementById('departure').value;
    const destination = document.getElementById('destination').value;
    
    if (departure === destination) {
        showNotification('Departure and destination cannot be the same!', 'error');
        return false;
    }
    
    const selectedDate = new Date(document.getElementById('date').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Please select a future date!', 'error');
        return false;
    }
    
    return true;
}

// Payment Modal Setup
function setupPaymentModal() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const processPaymentBtn = document.getElementById('processPayment');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            showPaymentForm(this.value);
            updatePaymentButton();
        });
    });
    
    processPaymentBtn.addEventListener('click', processPayment);
}

function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    const bookingSummary = document.getElementById('bookingSummary');
    
    // Update booking summary
    bookingSummary.innerHTML = `
        <div class="summary-item">
            <span>Route:</span>
            <span>${currentBookingData.departure} → ${currentBookingData.destination}</span>
        </div>
        <div class="summary-item">
            <span>Date:</span>
            <span>${formatDate(currentBookingData.date)}</span>
        </div>
        <div class="summary-item">
            <span>Time:</span>
            <span>${formatTime(currentBookingData.time)}</span>
        </div>
        <div class="summary-item">
            <span>Passengers:</span>
            <span>${currentBookingData.passengers}</span>
        </div>
        <div class="summary-item">
            <span>Ticket Type:</span>
            <span>${currentBookingData.ticketType}</span>
        </div>
        <div class="summary-item">
            <span>Total Amount:</span>
            <span>GHS ${currentBookingData.totalPrice}</span>
        </div>
    `;
    
    modal.classList.add('active');
}

function showPaymentForm(paymentMethod) {
    // Hide all payment forms
    const forms = document.querySelectorAll('.payment-form');
    forms.forEach(form => form.style.display = 'none');
    
    // Show selected payment form
    const targetForm = document.getElementById(`${paymentMethod}Form`);
    if (targetForm) {
        targetForm.style.display = 'block';
    }
}

function updatePaymentButton() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentBtn = document.getElementById('processPayment');
    
    paymentBtn.disabled = !selectedMethod;
}

// Card Input Formatting
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiryDate');
    const cvvInput = document.getElementById('cvv');
    
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            this.value = this.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
    }
    
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
        });
    }
    
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }
}

// Payment Processing
function processPayment() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    
    if (!selectedMethod) {
        showNotification('Please select a payment method!', 'error');
        return;
    }
    
    if (!validatePaymentForm(selectedMethod.value)) {
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate payment processing
    setTimeout(() => {
        hideLoading();
        
        // Create ticket
        const ticket = createTicket();
        
        // Save ticket
        tickets.push(ticket);
        saveTickets();
        
        // Close payment modal
        closeModal('paymentModal');
        
        // Show success modal
        showSuccessModal(ticket);
        
        // Reset form
        document.getElementById('bookingForm').reset();
        setMinDate();
        calculatePrice();
        
    }, 2000);
}

function validatePaymentForm(paymentMethod) {
    let isValid = true;
    let errorMessage = '';
    
    switch (paymentMethod) {
        case 'mobileMoney':
            const network = document.getElementById('mobileNetwork').value;
            const mobileNumber = document.getElementById('mobileNumber').value;
            
            if (!network) {
                errorMessage = 'Please select a mobile network!';
                isValid = false;
            } else if (!mobileNumber || mobileNumber.length < 10) {
                errorMessage = 'Please enter a valid phone number!';
                isValid = false;
            }
            break;
            
        case 'card':
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('cardName').value;
            
            if (!cardNumber || cardNumber.length < 16) {
                errorMessage = 'Please enter a valid card number!';
                isValid = false;
            } else if (!expiryDate || expiryDate.length < 5) {
                errorMessage = 'Please enter a valid expiry date!';
                isValid = false;
            } else if (!cvv || cvv.length < 3) {
                errorMessage = 'Please enter a valid CVV!';
                isValid = false;
            } else if (!cardName.trim()) {
                errorMessage = 'Please enter the cardholder name!';
                isValid = false;
            }
            break;
            
        case 'bank':
            const bankName = document.getElementById('bankName').value;
            const accountNumber = document.getElementById('accountNumber').value;
            
            if (!bankName) {
                errorMessage = 'Please select a bank!';
                isValid = false;
            } else if (!accountNumber || accountNumber.length < 10) {
                errorMessage = 'Please enter a valid account number!';
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        showNotification(errorMessage, 'error');
    }
    
    return isValid;
}

// Ticket Creation
function createTicket() {
    const ticketId = generateTicketId();
    const seatNumbers = generateSeatNumbers(currentBookingData.passengers);
    
    return {
        id: ticketId,
        ...currentBookingData,
        seatNumbers: seatNumbers,
        bookingDate: new Date().toISOString(),
        status: 'upcoming',
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
}

function generateTicketId() {
    return 'QR' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
}

function generateSeatNumbers(count) {
    const seats = [];
    const startSeat = Math.floor(Math.random() * 20) + 1; // Random starting seat
    
    for (let i = 0; i < count; i++) {
        seats.push(startSeat + i);
    }
    
    return seats;
}

// Success Modal
function showSuccessModal(ticket) {
    const modal = document.getElementById('successModal');
    const ticketDetails = document.getElementById('ticketDetails');
    
    ticketDetails.innerHTML = `
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
            <p><strong>Seats:</strong> ${ticket.seatNumbers.join(', ')}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

// Ticket Management
function loadTickets() {
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>No Tickets Found</h3>
                <p>You haven't booked any tickets yet.</p>
            </div>
        `;
        return;
    }
    
    const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const filteredTickets = filterTickets(tickets, currentFilter);
    
    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <h3>No Tickets Match Filter</h3>
                <p>Try selecting a different filter.</p>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = filteredTickets.map(ticket => createTicketCard(ticket)).join('');
}

function filterTickets(tickets, filter) {
    const now = new Date();
    
    switch (filter) {
        case 'upcoming':
            return tickets.filter(ticket => {
                const ticketDate = new Date(ticket.date + 'T' + ticket.time);
                return ticket.status === 'upcoming' && ticketDate > now;
            });
        case 'completed':
            return tickets.filter(ticket => {
                const ticketDate = new Date(ticket.date + 'T' + ticket.time);
                return ticket.status === 'upcoming' && ticketDate <= now;
            });
        case 'cancelled':
            return tickets.filter(ticket => ticket.status === 'cancelled');
        default:
            return tickets;
    }
}

function createTicketCard(ticket) {
    const ticketDate = new Date(ticket.date + 'T' + ticket.time);
    const now = new Date();
    const isUpcoming = ticket.status === 'upcoming' && ticketDate > now;
    const isCompleted = ticket.status === 'upcoming' && ticketDate <= now;
    const isCancelled = ticket.status === 'cancelled';
    
    let status = 'upcoming';
    let statusClass = 'status-upcoming';
    
    if (isCancelled) {
        status = 'cancelled';
        statusClass = 'status-cancelled';
    } else if (isCompleted) {
        status = 'completed';
        statusClass = 'status-completed';
    }
    
    return `
        <div class="ticket-card">
            <div class="ticket-header">
                <div class="ticket-route">${ticket.departure} → ${ticket.destination}</div>
                <div class="ticket-status ${statusClass}">${status.toUpperCase()}</div>
            </div>
            <div class="ticket-details">
                <div class="ticket-detail">
                    <div class="ticket-detail-label">Ticket ID</div>
                    <div class="ticket-detail-value">${ticket.id}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">Date</div>
                    <div class="ticket-detail-value">${formatDate(ticket.date)}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">Time</div>
                    <div class="ticket-detail-value">${formatTime(ticket.time)}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">Passengers</div>
                    <div class="ticket-detail-value">${ticket.passengers}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">Seats</div>
                    <div class="ticket-detail-value">${ticket.seatNumbers.join(', ')}</div>
                </div>
                <div class="ticket-detail">
                    <div class="ticket-detail-label">Total</div>
                    <div class="ticket-detail-value">GHS ${ticket.totalPrice}</div>
                </div>
            </div>
            ${isUpcoming ? `
                <div class="ticket-actions">
                    <button class="cancel-btn" onclick="cancelTicket('${ticket.id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Reload tickets with new filter
            loadTickets();
        });
    });
}

function cancelTicket(ticketId) {
    if (confirm('Are you sure you want to cancel this ticket?')) {
        const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
        if (ticketIndex !== -1) {
            tickets[ticketIndex].status = 'cancelled';
            saveTickets();
            loadTickets();
            showNotification('Ticket cancelled successfully!', 'success');
        }
    }
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    // Simulate sending message
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        document.getElementById('contactForm').reset();
    }, 1500);
}

// Local Storage
function saveTickets() {
    localStorage.setItem('quickride_tickets', JSON.stringify(tickets));
}

// Modal Management
function setupModalCloseHandlers() {
    const closeButtons = document.querySelectorAll('.close');
    const modals = document.querySelectorAll('.modal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('active');
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Loading Overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = notification.querySelector('.notification-message');
    const closeButton = notification.querySelector('.notification-close');
    
    messageElement.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
    
    // Manual close
    closeButton.addEventListener('click', function() {
        notification.classList.remove('show');
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Add some demo tickets for testing (remove in production)
if (tickets.length === 0) {
    const demoTickets = [
        {
            id: 'QR123456',
            departure: 'Accra',
            destination: 'Kumasi',
            date: '2024-01-20',
            time: '08:00',
            passengers: 2,
            ticketType: 'Business',
            totalPrice: 160,
            seatNumbers: [15, 16],
            bookingDate: new Date().toISOString(),
            status: 'upcoming',
            paymentMethod: 'mobileMoney'
        },
        {
            id: 'QR123457',
            departure: 'Kumasi',
            destination: 'Tamale',
            date: '2024-01-15',
            time: '14:00',
            passengers: 1,
            ticketType: 'VIP',
            totalPrice: 180,
            seatNumbers: [8],
            bookingDate: new Date(Date.now() - 86400000).toISOString(),
            status: 'upcoming',
            paymentMethod: 'card'
        }
    ];
    
    tickets.push(...demoTickets);
    saveTickets();
}

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'activated') {
                                showNotification('App updated! Refresh to see new features.', 'success');
                            }
                        });
                    });
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button/banner
    showInstallPrompt();
});

function showInstallPrompt() {
    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1004;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideUp 0.3s ease-out;
        ">
            <div>
                <strong>📱 Install QuickRide</strong><br>
                <small>Get the full app experience!</small>
            </div>
            <div>
                <button onclick="installApp()" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 5px;
                    margin-right: 0.5rem;
                    cursor: pointer;
                    font-weight: bold;
                ">Install</button>
                <button onclick="dismissInstallPrompt()" style="
                    background: transparent;
                    color: white;
                    border: 1px solid white;
                    padding: 0.5rem 1rem;
                    border-radius: 5px;
                    cursor: pointer;
                ">Later</button>
            </div>
        </div>
    `;
    installBanner.id = 'installBanner';
    document.body.appendChild(installBanner);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('QuickRide installed successfully!', 'success');
            }
            deferredPrompt = null;
            dismissInstallPrompt();
        });
    }
}

function dismissInstallPrompt() {
    const banner = document.getElementById('installBanner');
    if (banner) {
        banner.remove();
    }
}

// Export functions for global access
window.showSection = showSection;
window.closeModal = closeModal;
window.cancelTicket = cancelTicket;
window.installApp = installApp;
window.dismissInstallPrompt = dismissInstallPrompt;