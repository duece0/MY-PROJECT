// Payment functionality

document.addEventListener('DOMContentLoaded', function() {
    initializePaymentForm();
});

function initializePaymentForm() {
    const paymentMethodSelect = document.getElementById('payment-method');
    const cardDetails = document.getElementById('card-details');
    const momoDetails = document.getElementById('momo-details');
    const paymentForm = document.getElementById('payment-form');
    
    if (!paymentMethodSelect || !paymentForm) return;
    
    // Show/hide payment method details
    paymentMethodSelect.addEventListener('change', function() {
        if (cardDetails) cardDetails.style.display = 'none';
        if (momoDetails) momoDetails.style.display = 'none';
        
        if (this.value === 'card' && cardDetails) {
            cardDetails.style.display = 'block';
        } else if (this.value === 'momo' && momoDetails) {
            momoDetails.style.display = 'block';
        }
    });
    
    // Format card number input
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            this.value = value.substring(0, 19); // Limit to 16 digits + 3 spaces
        });
    }
    
    // Format expiry date input
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            this.value = value;
        });
    }
    
    // Format CVV input
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 3);
        });
    }
    
    // Format mobile money number
    const momoNumberInput = document.getElementById('momo-number');
    if (momoNumberInput) {
        momoNumberInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 0) {
                // Format as Ghana phone number
                value = value.substring(0, 10);
                if (value.length >= 3) {
                    value = value.substring(0, 3) + ' ' + value.substring(3);
                }
                if (value.length >= 7) {
                    value = value.substring(0, 7) + ' ' + value.substring(7);
                }
            }
            this.value = value;
        });
    }
    
    // Handle payment form submission
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment();
    });
    
    // Close modal functionality
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

function processPayment() {
    const paymentForm = document.getElementById('payment-form');
    const payButton = paymentForm.querySelector('.pay-button');
    
    if (!payButton) return;
    
    const originalText = payButton.innerHTML;
    
    // Validate payment form
    if (!validatePaymentForm()) {
        return;
    }
    
    // Show loading state
    payButton.innerHTML = '<span class="loading"></span> Processing...';
    payButton.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Generate ticket
        const ticket = generateTicket();
        userTickets.push(ticket);
        
        // Save to localStorage (in a real app, this would be saved to a server)
        localStorage.setItem('userTickets', JSON.stringify(userTickets));
        
        // Hide payment modal
        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            paymentModal.style.display = 'none';
        }
        
        // Show success modal
        showSuccessModal(ticket);
        
        // Reset forms and button
        paymentForm.reset();
        payButton.innerHTML = originalText;
        payButton.disabled = false;
        
        // Reset booking form
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.reset();
        }
        
        const totalPriceElement = document.getElementById('total-price');
        if (totalPriceElement) {
            totalPriceElement.textContent = 'GH₵0';
        }
        
        // Show success notification
        showNotification('Payment successful! Your ticket has been booked.', 'success');
        
    }, 2000);
}

function validatePaymentForm() {
    const passengerName = document.getElementById('passenger-name');
    const passengerEmail = document.getElementById('passenger-email');
    const passengerPhone = document.getElementById('passenger-phone');
    const paymentMethod = document.getElementById('payment-method');
    
    if (!passengerName || !passengerName.value.trim()) {
        showNotification('Please enter passenger name', 'error');
        return false;
    }
    
    if (!passengerEmail || !passengerEmail.value.trim()) {
        showNotification('Please enter email address', 'error');
        return false;
    }
    
    if (!passengerPhone || !passengerPhone.value.trim()) {
        showNotification('Please enter phone number', 'error');
        return false;
    }
    
    if (!paymentMethod || !paymentMethod.value) {
        showNotification('Please select a payment method', 'error');
        return false;
    }
    
    // Additional validation for card payments
    if (paymentMethod.value === 'card') {
        const cardNumber = document.getElementById('card-number');
        const expiry = document.getElementById('expiry');
        const cvv = document.getElementById('cvv');
        
        if (!cardNumber || !cardNumber.value.replace(/\s/g, '').length >= 16) {
            showNotification('Please enter a valid card number', 'error');
            return false;
        }
        
        if (!expiry || !expiry.value.match(/^\d{2}\/\d{2}$/)) {
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
            return false;
        }
        
        if (!cvv || cvv.value.length < 3) {
            showNotification('Please enter a valid CVV', 'error');
            return false;
        }
    }
    
    // Additional validation for mobile money
    if (paymentMethod.value === 'momo') {
        const momoNumber = document.getElementById('momo-number');
        
        if (!momoNumber || momoNumber.value.replace(/\s/g, '').length < 10) {
            showNotification('Please enter a valid mobile money number', 'error');
            return false;
        }
    }
    
    return true;
}

function generateTicket() {
    const cityNames = {
        'accra': 'Accra',
        'kumasi': 'Kumasi',
        'tamale': 'Tamale',
        'cape-coast': 'Cape Coast',
        'tema': 'Tema',
        'takoradi': 'Takoradi'
    };
    
    const ticket = {
        id: 'QR' + Date.now().toString().slice(-8),
        passengerName: document.getElementById('passenger-name').value,
        passengerEmail: document.getElementById('passenger-email').value,
        passengerPhone: document.getElementById('passenger-phone').value,
        from: cityNames[currentBooking.from],
        to: cityNames[currentBooking.to],
        departureDate: currentBooking.departureDate,
        departureTime: currentBooking.departureTime,
        passengers: currentBooking.passengers,
        ticketType: currentBooking.ticketType,
        totalPrice: currentBooking.totalPrice,
        paymentMethod: document.getElementById('payment-method').value,
        bookingDate: new Date().toISOString().split('T')[0],
        bookingTime: new Date().toLocaleTimeString(),
        status: 'upcoming',
        seatNumbers: generateSeatNumbers(parseInt(currentBooking.passengers))
    };
    
    return ticket;
}

function generateSeatNumbers(count) {
    const seats = [];
    for (let i = 0; i < count; i++) {
        const row = Math.floor(Math.random() * 20) + 1;
        const seat = String.fromCharCode(65 + Math.floor(Math.random() * 4)); // A, B, C, D
        seats.push(`${row}${seat}`);
    }
    return seats;
}

function showSuccessModal(ticket) {
    const modal = document.getElementById('success-modal');
    const ticketDetails = document.getElementById('ticket-details');
    
    if (!modal || !ticketDetails) return;
    
    ticketDetails.innerHTML = `
        <div class="ticket-summary">
            <p><strong>Ticket ID:</strong> ${ticket.id}</p>
            <p><strong>Passenger:</strong> ${ticket.passengerName}</p>
            <p><strong>Route:</strong> ${ticket.from} → ${ticket.to}</p>
            <p><strong>Date & Time:</strong> ${ticket.departureDate} at ${ticket.departureTime}</p>
            <p><strong>Passengers:</strong> ${ticket.passengers}</p>
            <p><strong>Seats:</strong> ${ticket.seatNumbers.join(', ')}</p>
            <p><strong>Total:</strong> GH₵${ticket.totalPrice}</p>
        </div>
    `;
    
    modal.style.display = 'block';
}