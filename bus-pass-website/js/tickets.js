// Tickets functionality

document.addEventListener('DOMContentLoaded', function() {
    displayTickets();
});

function displayTickets(filter = 'all') {
    const container = document.getElementById('tickets-container');
    if (!container) return;
    
    let filteredTickets = userTickets;
    
    // Apply filter
    if (filter !== 'all') {
        filteredTickets = userTickets.filter(ticket => ticket.status === filter);
    }
    
    if (filteredTickets.length === 0) {
        container.innerHTML = `
            <div class="no-tickets">
                <i class="fas fa-ticket-alt" style="font-size: 4rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3>No tickets found</h3>
                <p>You haven't booked any tickets yet. Start by booking your first trip!</p>
                <button onclick="showSection('booking')" class="cta-button">Book Now</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTickets.map(ticket => `
        <div class="ticket-card fade-in">
            <div class="ticket-header">
                <span class="ticket-id">${ticket.id}</span>
                <span class="ticket-status status-${ticket.status}">${ticket.status.toUpperCase()}</span>
            </div>
            <div class="ticket-route">${ticket.from} → ${ticket.to}</div>
            <div class="ticket-details">
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${ticket.departureDate}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Time</div>
                    <div class="detail-value">${ticket.departureTime}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Passengers</div>
                    <div class="detail-value">${ticket.passengers}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Type</div>
                    <div class="detail-value">${ticket.ticketType.toUpperCase()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Seats</div>
                    <div class="detail-value">${ticket.seatNumbers.join(', ')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total</div>
                    <div class="detail-value">GH₵${ticket.totalPrice}</div>
                </div>
            </div>
            <div class="ticket-actions">
                ${ticket.status === 'upcoming' ? `
                    <button class="action-btn btn-primary" onclick="viewTicketDetails('${ticket.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn btn-danger" onclick="cancelTicket('${ticket.id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : `
                    <button class="action-btn btn-secondary" onclick="viewTicketDetails('${ticket.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                `}
            </div>
        </div>
    `).join('');
    
    // Initialize filter buttons
    initializeFilterButtons(filter);
}

function initializeFilterButtons(activeFilter = 'all') {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === activeFilter) {
            btn.classList.add('active');
        }
        
        // Remove existing event listeners by cloning the button
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            displayTickets(newBtn.dataset.filter);
        });
    });
}

function viewTicketDetails(ticketId) {
    const ticket = userTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const details = `
Ticket Details:

ID: ${ticket.id}
Passenger: ${ticket.passengerName}
Email: ${ticket.passengerEmail}
Phone: ${ticket.passengerPhone}
Route: ${ticket.from} → ${ticket.to}
Date: ${ticket.departureDate}
Time: ${ticket.departureTime}
Passengers: ${ticket.passengers}
Type: ${ticket.ticketType.toUpperCase()}
Seats: ${ticket.seatNumbers.join(', ')}
Total: GH₵${ticket.totalPrice}
Payment Method: ${ticket.paymentMethod.toUpperCase()}
Booking Date: ${ticket.bookingDate}
Status: ${ticket.status.toUpperCase()}
    `;
    
    alert(details);
}

function cancelTicket(ticketId) {
    if (!confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) {
        return;
    }
    
    const ticketIndex = userTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return;
    
    userTickets[ticketIndex].status = 'cancelled';
    localStorage.setItem('userTickets', JSON.stringify(userTickets));
    
    // Get current filter to maintain the view
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
    
    displayTickets(currentFilter);
    showNotification('Ticket cancelled successfully', 'success');
}