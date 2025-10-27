// Payment Processing for QuickRide Application
document.addEventListener('DOMContentLoaded', function() {
    initializePayment();
});

let paymentData = {};

// Ticket pricing
const TICKET_PRICES = {
    economy: 25,
    business: 45,
    vip: 65
};

// Initialize payment functionality
function initializePayment() {
    setupPaymentForm();
    setupPaymentMethodToggle();
}

// Setup payment form handlers
function setupPaymentForm() {
    const paymentForm = document.getElementById('payment-form');
    if (!paymentForm) return;
    
    paymentForm.addEventListener('submit', handlePaymentSubmission);
    
    // Setup form field listeners
    const formFields = ['passenger-name', 'passenger-email', 'passenger-phone', 'payment-method'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', updatePaymentData);
            field.addEventListener('change', updatePaymentData);
        }
    });
}

// Setup payment method toggle
function setupPaymentMethodToggle() {
    const paymentMethodSelect = document.getElementById('payment-method');
    if (!paymentMethodSelect) return;
    
    paymentMethodSelect.addEventListener('change', function() {
        togglePaymentDetails(this.value);
    });
}

// Toggle payment details based on selected method
function togglePaymentDetails(method) {
    const cardDetails = document.getElementById('card-details');
    const momoDetails = document.getElementById('momo-details');
    
    // Hide all payment details
    if (cardDetails) cardDetails.style.display = 'none';
    if (momoDetails) momoDetails.style.display = 'none';
    
    // Show relevant payment details
    if (method === 'card' && cardDetails) {
        cardDetails.style.display = 'block';
        setupCardValidation();
    } else if (method === 'momo' && momoDetails) {
        momoDetails.style.display = 'block';
        setupMomoValidation();
    }
}

// Setup card validation
function setupCardValidation() {
    const cardNumber = document.getElementById('card-number');
    const expiry = document.getElementById('expiry');
    const cvv = document.getElementById('cvv');
    
    if (cardNumber) cardNumber.addEventListener('input', formatCardNumber);
    if (expiry) expiry.addEventListener('input', formatExpiry);
    if (cvv) cvv.addEventListener('input', formatCVV);
}

// Setup mobile money validation
function setupMomoValidation() {
    const momoNumber = document.getElementById('momo-number');
    if (momoNumber) momoNumber.addEventListener('input', formatMomoNumber);
}

// Format card number with spaces
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
}

// Format expiry date as MM/YY
function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0,2) + '/' + value.substring(2,4);
    }
    e.target.value = value;
}

// Format CVV (numbers only)
function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
}

// Format mobile money number
function formatMomoNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.substring(0, 10);
    e.target.value = value;
}

// Update payment data object
function updatePaymentData() {
    paymentData = {
        passengerName: document.getElementById('passenger-name')?.value || '',
        passengerEmail: document.getElementById('passenger-email')?.value || '',
        passengerPhone: document.getElementById('passenger-phone')?.value || '',
        paymentMethod: document.getElementById('payment-method')?.value || ''
    };
}

// Handle payment form submission
function handlePaymentSubmission(e) {
    e.preventDefault();
    updatePaymentData();
    
    if (!validatePaymentForm()) return;
    
    const bookingData = window.BookingModule ? window.BookingModule.getCurrentBooking() : {};
    processPayment(bookingData, paymentData);
}

// Validate payment form
function validatePaymentForm() {
    const requiredFields = ['passenger-name', 'passenger-email', 'passenger-phone', 'payment-method'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            isValid = false;
            if (field) field.closest('.form-group').classList.add('error');
        }
    });
    
    // Validate email format
    const email = document.getElementById('passenger-email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            isValid = false;
            email.closest('.form-group').classList.add('error');
        }
    }
    
    if (!isValid) {
        QuickRide.showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

// Process payment
function processPayment(bookingData, paymentData) {
    const payButton = document.querySelector('.pay-button');
    const originalText = payButton.textContent;
    
    // Show loading state
    payButton.textContent = 'Processing...';
    payButton.disabled = true;
    payButton.classList.add('loading');
    
    // Simulate payment processing (90% success rate for demo)
    setTimeout(() => {
        const success = Math.random() > 0.1;
        
        if (success) {
            processPaymentSuccess(bookingData, paymentData);
        } else {
            QuickRide.showNotification('Payment failed. Please try again.', 'error');
        }
        
        // Reset button
        payButton.textContent = originalText;
        payButton.disabled = false;
        payButton.classList.remove('loading');
    }, 3000);
}

// Handle successful payment - Generate individual tickets
function processPaymentSuccess(bookingData, paymentData) {
    const passengerCount = parseInt(bookingData.passengers) || 1;
    const generatedTickets = [];
    const groupBookingId = 'booking_' + Date.now();
    
    // Generate individual tickets for each passenger
    for (let i = 1; i <= passengerCount; i++) {
        const ticketData = {
            id: 'ticket_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5),
            ticketNumber: generateIndividualTicketNumber(i, passengerCount),
            groupBookingId: groupBookingId, // Link tickets from same booking
            passengerNumber: i,
            totalPassengers: passengerCount,
            seatNumber: generateSeatNumber(i, bookingData.ticketType),
            ...bookingData,
            ...paymentData,
            passengers: 1, // Each ticket is for 1 passenger
            individualPrice: calculateIndividualPrice(bookingData.ticketType),
            totalBookingPrice: bookingData.totalPrice,
            status: 'upcoming',
            bookingDate: new Date().toISOString().split('T')[0],
            paymentDate: new Date().toISOString(),
            paymentStatus: 'completed'
        };
        
        // Save individual ticket
        QuickRide.saveTicket(ticketData);
        generatedTickets.push(ticketData);
    }
    
    // Close payment modal
    QuickRide.closeModal('payment-modal');
    
    // Show success modal with all generated tickets
    showSuccessModal(generatedTickets);
    
    // Reset forms
    resetPaymentForm();
    if (window.BookingModule) {
        window.BookingModule.resetBookingForm();
    }
}

// Generate individual ticket number with passenger identifier
function generateIndividualTicketNumber(passengerNum, totalPassengers) {
    const prefix = 'QR';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    const passengerSuffix = String(passengerNum).padStart(2, '0');
    
    return `${prefix}${timestamp}${random}P${passengerSuffix}`;
}

// Generate seat number based on passenger number and ticket type
function generateSeatNumber(passengerNum, ticketType) {
    let seatPrefix = '';
    
    switch(ticketType) {
        case 'economy':
            seatPrefix = 'E';
            break;
        case 'business':
            seatPrefix = 'B';
            break;
        case 'vip':
            seatPrefix = 'V';
            break;
        default:
            seatPrefix = 'R';
    }
    
    // Generate seat number (row and seat)
    const row = Math.ceil(passengerNum / 4);
    const seatLetter = ['A', 'B', 'C', 'D'][(passengerNum - 1) % 4];
    
    return `${seatPrefix}${row}${seatLetter}`;
}

// Calculate individual ticket price
function calculateIndividualPrice(ticketType) {
    return TICKET_PRICES[ticketType] || 0;
}

// Show success modal with multiple tickets
function showSuccessModal(generatedTickets) {
    const ticketDetails = document.getElementById('ticket-details');
    if (ticketDetails && generatedTickets.length > 0) {
        const firstTicket = generatedTickets[0];
        
        let ticketsHtml = `
            <div class="success-ticket-details">
                <h4>Booking Confirmation</h4>
                <p><strong>Group Booking ID:</strong> ${firstTicket.groupBookingId}</p>
                <p><strong>Route:</strong> ${capitalizeFirst(firstTicket.from)} → ${capitalizeFirst(firstTicket.to)}</p>
                <p><strong>Date:</strong> ${QuickRide.formatDate(firstTicket.departureDate)}</p>
                <p><strong>Time:</strong> ${QuickRide.formatTime(firstTicket.departureTime)}</p>
                <p><strong>Total Amount:</strong> ${QuickRide.formatCurrency(firstTicket.totalBookingPrice)}</p>
                
                <div class="individual-tickets">
                    <h5>Individual Tickets Generated:</h5>
        `;
        
        generatedTickets.forEach((ticket, index) => {
            ticketsHtml += `
                <div class="ticket-item">
                    <div class="ticket-header">
                        <strong>Passenger ${ticket.passengerNumber}</strong>
                        <span class="ticket-number">${ticket.ticketNumber}</span>
                    </div>
                    <div class="ticket-info">
                        <span>Seat: ${ticket.seatNumber}</span>
                        <span>Price: ${QuickRide.formatCurrency(ticket.individualPrice)}</span>
                    </div>
                </div>
            `;
        });
        
        ticketsHtml += `
                </div>
                <p class="notice"><em>Each passenger will receive a separate ticket with unique QR code.</em></p>
            </div>
        `;
        
        ticketDetails.innerHTML = ticketsHtml;
    }
    
    QuickRide.showModal('success-modal');
    
    // Auto-close after 8 seconds and redirect to tickets
    setTimeout(() => {
        QuickRide.closeModal('success-modal');
        QuickRide.showSection('my-tickets');
    }, 8000);
}

// Reset payment form
function resetPaymentForm() {
    const form = document.getElementById('payment-form');
    if (form) {
        form.reset();
        
        // Hide payment details
        const cardDetails = document.getElementById('card-details');
        const momoDetails = document.getElementById('momo-details');
        
        if (cardDetails) cardDetails.style.display = 'none';
        if (momoDetails) momoDetails.style.display = 'none';
        
        // Clear validation states
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
    }
    
    paymentData = {};
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// Export payment functions
window.PaymentModule = {
    processPayment,
    resetPaymentForm,
    validatePaymentForm,
    generateIndividualTicketNumber,
    generateSeatNumber
};