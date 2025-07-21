// Booking functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeBookingForm();
    initializeContactForm();
});

function initializeBookingForm() {
    const form = document.getElementById('booking-form');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const passengersSelect = document.getElementById('passengers');
    const ticketTypeSelect = document.getElementById('ticket-type');
    const totalPriceElement = document.getElementById('total-price');

    if (!form || !fromSelect || !toSelect || !passengersSelect || !ticketTypeSelect || !totalPriceElement) {
        return;
    }

    // Calculate price when form changes
    [passengersSelect, ticketTypeSelect].forEach(element => {
        element.addEventListener('change', calculateTotalPrice);
    });

    // Prevent selecting same origin and destination
    fromSelect.addEventListener('change', function() {
        const selectedFrom = this.value;
        Array.from(toSelect.options).forEach(option => {
            option.disabled = option.value === selectedFrom;
        });
        if (toSelect.value === selectedFrom) {
            toSelect.value = '';
        }
        calculateTotalPrice();
    });

    toSelect.addEventListener('change', function() {
        const selectedTo = this.value;
        Array.from(fromSelect.options).forEach(option => {
            option.disabled = option.value === selectedTo;
        });
        if (fromSelect.value === selectedTo) {
            fromSelect.value = '';
        }
        calculateTotalPrice();
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        processBooking();
    });
}

function calculateTotalPrice() {
    const passengersSelect = document.getElementById('passengers');
    const ticketTypeSelect = document.getElementById('ticket-type');
    const totalPriceElement = document.getElementById('total-price');
    
    if (!passengersSelect || !ticketTypeSelect || !totalPriceElement) {
        return 0;
    }
    
    const passengers = parseInt(passengersSelect.value) || 1;
    const ticketType = ticketTypeSelect.value;
    
    let basePrice = 0;
    switch(ticketType) {
        case 'economy':
            basePrice = 25;
            break;
        case 'business':
            basePrice = 45;
            break;
        case 'vip':
            basePrice = 65;
            break;
    }
    
    const totalPrice = basePrice * passengers;
    totalPriceElement.textContent = `GH₵${totalPrice}`;
    
    return totalPrice;
}

function processBooking() {
    const booking = {};
    
    // Collect form data
    booking.from = document.getElementById('from').value;
    booking.to = document.getElementById('to').value;
    booking.departureDate = document.getElementById('departure-date').value;
    booking.departureTime = document.getElementById('departure-time').value;
    booking.passengers = document.getElementById('passengers').value;
    booking.ticketType = document.getElementById('ticket-type').value;
    booking.totalPrice = calculateTotalPrice();
    
    // Validate form
    if (!booking.from || !booking.to || !booking.departureDate || 
        !booking.departureTime || !booking.passengers || !booking.ticketType) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (booking.from === booking.to) {
        showNotification('Origin and destination cannot be the same', 'error');
        return;
    }
    
    // Store current booking
    currentBooking = booking;
    
    // Populate payment modal
    populatePaymentModal(booking);
    
    // Show payment modal
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.style.display = 'block';
    }
}

function populatePaymentModal(booking) {
    const cityNames = {
        'accra': 'Accra',
        'kumasi': 'Kumasi',
        'tamale': 'Tamale',
        'cape-coast': 'Cape Coast',
        'tema': 'Tema',
        'takoradi': 'Takoradi'
    };
    
    const routeElement = document.getElementById('payment-route');
    const datetimeElement = document.getElementById('payment-datetime');
    const passengersElement = document.getElementById('payment-passengers');
    const totalElement = document.getElementById('payment-total');
    
    if (routeElement) {
        routeElement.textContent = `${cityNames[booking.from]} → ${cityNames[booking.to]}`;
    }
    
    if (datetimeElement) {
        datetimeElement.textContent = `${booking.departureDate} at ${booking.departureTime}`;
    }
    
    if (passengersElement) {
        passengersElement.textContent = `${booking.passengers} passenger(s)`;
    }
    
    if (totalElement) {
        totalElement.textContent = `GH₵${booking.totalPrice}`;
    }
}

function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulate form submission
        const submitButton = this.querySelector('button');
        if (!submitButton) return;
        
        const originalText = submitButton.textContent;
        
        submitButton.innerHTML = '<span class="loading"></span> Sending...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            this.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 1500);
    });
}