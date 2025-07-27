// Booking Logic for QuickRide Application
document.addEventListener('DOMContentLoaded', function() {
    initializeBooking();
});

// Booking data and configuration
const TICKET_PRICES = {
    economy: 25,
    business: 45,
    vip: 65
};

const ROUTE_DISTANCES = {
    'accra-kumasi': 250,
    'accra-tamale': 400,
    'accra-cape-coast': 150,
    'accra-tema': 30,
    'accra-takoradi': 200,
    'kumasi-tamale': 200,
    'kumasi-cape-coast': 180,
    'kumasi-tema': 270,
    'kumasi-takoradi': 220,
    'tamale-cape-coast': 350,
    'tamale-tema': 420,
    'tamale-takoradi': 380,
    'cape-coast-tema': 160,
    'cape-coast-takoradi': 80,
    'tema-takoradi': 180
};

let currentBooking = {
    from: '',
    to: '',
    departureDate: '',
    departureTime: '',
    passengers: 1,
    ticketType: '',
    travelPreference: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    totalPrice: 0
};

// Initialize booking functionality
function initializeBooking() {
    setupBookingForm();
    setupPriceCalculation();
    setupFormValidation();
    setupRouteValidation();
}

// Setup booking form handlers
function setupBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
    
    bookingForm.addEventListener('submit', handleBookingSubmission);
    
    // Setup form field listeners
    const formFields = ['from', 'to', 'departure-date', 'departure-time', 'passengers', 'ticket-type'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateBookingData);
            field.addEventListener('input', updateBookingData);
        }
    });
    
    // Emergency contact fields
    const emergencyName = document.getElementById('emergency-contact-name');
    const emergencyPhone = document.getElementById('emergency-contact-phone');
    
    if (emergencyName) emergencyName.addEventListener('input', updateBookingData);
    if (emergencyPhone) emergencyPhone.addEventListener('input', updateBookingData);
}

// Setup price calculation
function setupPriceCalculation() {
    const priceElements = ['passengers', 'ticket-type'];
    priceElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', calculatePrice);
        }
    });
    
    // Initial price calculation
    calculatePrice();
}

// Calculate and display total price
function calculatePrice() {
    const passengers = parseInt(document.getElementById('passengers')?.value || 1);
    const ticketType = document.getElementById('ticket-type')?.value;
    
    let basePrice = 0;
    if (ticketType && TICKET_PRICES[ticketType]) {
        basePrice = TICKET_PRICES[ticketType];
    }
    
    const totalPrice = basePrice * passengers;
    currentBooking.totalPrice = totalPrice;
    
    // Update price display
    const priceDisplay = document.getElementById('total-price');
    if (priceDisplay) {
        priceDisplay.textContent = QuickRide.formatCurrency(totalPrice);
        
        // Add animation effect
        priceDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            priceDisplay.style.transform = 'scale(1)';
        }, 200);
    }
}

// Update booking data object
function updateBookingData() {
    currentBooking.from = document.getElementById('from')?.value || '';
    currentBooking.to = document.getElementById('to')?.value || '';
    currentBooking.departureDate = document.getElementById('departure-date')?.value || '';
    currentBooking.departureTime = document.getElementById('departure-time')?.value || '';
    currentBooking.passengers = parseInt(document.getElementById('passengers')?.value || 1);
    currentBooking.ticketType = document.getElementById('ticket-type')?.value || '';
    currentBooking.travelPreference = document.getElementById('travel-preference')?.value || '';
    currentBooking.emergencyContactName = document.getElementById('emergency-contact-name')?.value || '';
    currentBooking.emergencyContactPhone = document.getElementById('emergency-contact-phone')?.value || '';
    
    // Recalculate price
    calculatePrice();
    
    // Validate route
    validateRoute();
}

// Setup form validation
function setupFormValidation() {
    const requiredFields = [
        'from', 'to', 'departure-date', 'departure-time', 
        'passengers', 'ticket-type', 'travel-preference',
        'emergency-contact-name', 'emergency-contact-phone'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldId));
            field.addEventListener('input', () => clearFieldError(fieldId));
        }
    });
}

// Validate individual field
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return false;
    
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    
    // Remove existing error states
    fieldGroup.classList.remove('error', 'success');
    const existingError = fieldGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    let isValid = true;
    let errorMessage = '';
    
    // Field-specific validation
    switch(fieldId) {
        case 'from':
        case 'to':
            if (!value) {
                isValid = false;
                errorMessage = 'Please select a location';
            }
            break;
            
        case 'departure-date':
            if (!value) {
                isValid = false;
                errorMessage = 'Please select a departure date';
            } else {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    isValid = false;
                    errorMessage = 'Please select a future date';
                }
            }
            break;
            
        case 'emergency-contact-phone':
            if (!value) {
                isValid = false;
                errorMessage = 'Please provide emergency contact phone';
            } else if (!/^[0-9+\-\s()]{10,}$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
            
        case 'emergency-contact-name':
            if (!value) {
                isValid = false;
                errorMessage = 'Please provide emergency contact name';
            } else if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
            break;
            
        default:
            if (!value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
    }
    
    // Display error or success
    if (!isValid) {
        fieldGroup.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
        fieldGroup.appendChild(errorDiv);
    } else if (value) {
        fieldGroup.classList.add('success');
    }
    
    return isValid;
}

// Clear field error state
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const fieldGroup = field.closest('.form-group');
    fieldGroup.classList.remove('error');
    
    const errorMessage = fieldGroup.querySelector('.error-message');
    if (errorMessage) errorMessage.remove();
}

// Setup route validation
function setupRouteValidation() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    
    if (fromSelect && toSelect) {
        fromSelect.addEventListener('change', validateRoute);
        toSelect.addEventListener('change', validateRoute);
    }
}

// Validate route selection
function validateRoute() {
    const from = document.getElementById('from')?.value;
    const to = document.getElementById('to')?.value;
    
    if (from && to) {
        if (from === to) {
            showRouteError('Departure and destination cannot be the same');
            return false;
        } else {
            hideRouteError();
            showRoutePreview(from, to);
            return true;
        }
    }
    
    hideRoutePreview();
    return true;
}

// Show route error
function showRouteError(message) {
    const fromGroup = document.getElementById('from').closest('.form-group');
    const toGroup = document.getElementById('to').closest('.form-group');
    
    [fromGroup, toGroup].forEach(group => {
        group.classList.add('error');
        const existingError = group.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        group.appendChild(errorDiv);
    });
}

// Hide route error
function hideRouteError() {
    const fromGroup = document.getElementById('from').closest('.form-group');
    const toGroup = document.getElementById('to').closest('.form-group');
    
    [fromGroup, toGroup].forEach(group => {
        group.classList.remove('error');
        const errorMessage = group.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();
    });
}

// Show route preview
function showRoutePreview(from, to) {
    hideRoutePreview();
    
    const routeKey = `${from}-${to}`;
    const reverseRouteKey = `${to}-${from}`;
    const distance = ROUTE_DISTANCES[routeKey] || ROUTE_DISTANCES[reverseRouteKey];
    
    if (distance) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'route-preview active';
        previewDiv.innerHTML = `
            <div class="route-info">
                <span class="route-from">${capitalizeFirst(from)}</span>
                <i class="fas fa-arrow-right route-arrow"></i>
                <span class="route-to">${capitalizeFirst(to)}</span>
                <span class="route-distance">(${distance} km)</span>
            </div>
        `;
        
        const bookingForm = document.querySelector('.booking-form');
        const priceDisplay = document.querySelector('.price-display');
        bookingForm.insertBefore(previewDiv, priceDisplay);
    }
}

// Hide route preview
function hideRoutePreview() {
    const existingPreview = document.querySelector('.route-preview');
    if (existingPreview) {
        existingPreview.remove();
    }
}

// Handle booking form submission
function handleBookingSubmission(e) {
    e.preventDefault();
    
    // Update booking data
    updateBookingData();
    
    // Validate all fields
    const requiredFields = [
        'from', 'to', 'departure-date', 'departure-time', 
        'passengers', 'ticket-type', 'travel-preference',
        'emergency-contact-name', 'emergency-contact-phone'
    ];
    
    let isFormValid = true;
    requiredFields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isFormValid = false;
        }
    });
    
    // Validate route
    if (!validateRoute()) {
        isFormValid = false;
    }
    
    if (!isFormValid) {
        QuickRide.showNotification('Please correct the errors in the form', 'error');
        return;
    }
    
    // Check if price is calculated
    if (currentBooking.totalPrice <= 0) {
        QuickRide.showNotification('Please select a valid ticket type', 'error');
        return;
    }
    
    // Store passenger count for individual ticket generation
    currentBooking.individualTickets = true;
    
    // Show payment modal
    showPaymentModal();
}

// Show payment modal with booking details
function showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (!modal) return;
    
    // Populate payment summary
    document.getElementById('payment-route').textContent = 
        `${capitalizeFirst(currentBooking.from)} → ${capitalizeFirst(currentBooking.to)}`;
    
    document.getElementById('payment-datetime').textContent = 
        `${QuickRide.formatDate(currentBooking.departureDate)} at ${QuickRide.formatTime(currentBooking.departureTime)}`;
    
    document.getElementById('payment-passengers').textContent = 
        `${currentBooking.passengers} passenger${currentBooking.passengers > 1 ? 's' : ''}`;
    
    document.getElementById('payment-total').textContent = 
        QuickRide.formatCurrency(currentBooking.totalPrice);
    
    QuickRide.showModal('payment-modal');
}

// Reset booking form
function resetBookingForm() {
    const form = document.getElementById('booking-form');
    if (form) {
        form.reset();
        
        // Reset current booking data
        currentBooking = {
            from: '',
            to: '',
            departureDate: '',
            departureTime: '',
            passengers: 1,
            ticketType: '',
            travelPreference: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            totalPrice: 0
        };
        
        // Reset price display
        const priceDisplay = document.getElementById('total-price');
        if (priceDisplay) {
            priceDisplay.textContent = QuickRide.formatCurrency(0);
        }
        
        // Clear any error states
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) errorMessage.remove();
        });
        
        // Hide route preview
        hideRoutePreview();
        
        // Set minimum date
        const dateInput = document.getElementById('departure-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            dateInput.value = today;
        }
    }
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// Get current booking data
function getCurrentBooking() {
    return { ...currentBooking };
}

// Export booking functions
window.BookingModule = {
    getCurrentBooking,
    resetBookingForm,
    calculatePrice,
    validateRoute
};