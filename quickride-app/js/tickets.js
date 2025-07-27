// Tickets Management for QuickRide Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTickets();
});

let currentFilter = 'all';
let tickets = [];

// Initialize tickets functionality
function initializeTickets() {
    setupTicketFilters();
    loadTickets();
}

// Setup ticket filter buttons
function setupTicketFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Set current filter
            currentFilter = this.getAttribute('data-filter');
            
            // Display filtered tickets
            displayTickets();
        });
    });
}

// Load tickets from localStorage
function loadTickets() {
    tickets = JSON.parse(localStorage.getItem('quickride_tickets')) || [];
    displayTickets();
}

// Display tickets based on current filter
function displayTickets() {
    const container = document.getElementById('tickets-container');
    if (!container) return;
    
    // Filter tickets based on current filter
    let filteredTickets = tickets;
    if (currentFilter !== 'all') {
        filteredTickets = tickets.filter(ticket => ticket.status === currentFilter);
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Show loading state
    container.innerHTML = '<div class="tickets-loading"><div class="loading-spinner"></div>Loading tickets...</div>';
    
    // Simulate loading delay
    setTimeout(() => {
        container.innerHTML = '';
        
        if (filteredTickets.length === 0) {
            showEmptyState(container);
        } else {
            filteredTickets.forEach((ticket, index) => {
                const ticketCard = createTicketCard(ticket, index);
                container.appendChild(ticketCard);
            });
        }
    }, 800);
}

// Create ticket card element
function createTicketCard(ticket, index) {
    const card = document.createElement('div');
    card.className = `ticket-card ${ticket.status}`;
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="ticket-header">
            <div class="ticket-number">${ticket.ticketNumber}</div>
            <div class="ticket-status ${ticket.status}">${ticket.status}</div>
        </div>
        
        <div class="ticket-route">
            <div class="route-location">
                <div class="city">${capitalizeFirst(ticket.from)}</div>
                <div class="station">Bus Terminal</div>
            </div>
            <i class="fas fa-arrow-right route-arrow"></i>
            <div class="route-location">
                <div class="city">${capitalizeFirst(ticket.to)}</div>
                <div class="station">Bus Terminal</div>
            </div>
        </div>
        
        <div class="ticket-details">
            <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                <span class="detail-value">${QuickRide.formatDate(ticket.departureDate)} at ${QuickRide.formatTime(ticket.departureTime)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Passengers</span>
                <span class="detail-value">${ticket.passengers} passenger${ticket.passengers > 1 ? 's' : ''}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Ticket Type</span>
                <span class="detail-value">${capitalizeFirst(ticket.ticketType)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Seat Preference</span>
                <span class="detail-value">${capitalizeFirst(ticket.travelPreference)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Price</span>
                <span class="detail-value price">${QuickRide.formatCurrency(ticket.totalPrice)}</span>
            </div>
        </div>
        
        ${ticket.status === 'upcoming' ? createQRCode(ticket.ticketNumber) : ''}
        
        <div class="ticket-actions">
            ${createTicketActions(ticket)}
        </div>
    `;
    
    return card;
}

// Create QR code placeholder
function createQRCode(ticketNumber) {
    return `
        <div class="ticket-qr">
            <div class="qr-code">
                <i class="fas fa-qrcode"></i>
            </div>
            <div class="qr-text">Scan for boarding</div>
        </div>
    `;
}

// Create ticket action buttons based on status
function createTicketActions(ticket) {
    let actions = '';
    
    switch(ticket.status) {
        case 'upcoming':
            actions = `
                <button class="action-btn action-btn-primary" onclick="downloadTicket('${ticket.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="action-btn action-btn-secondary" onclick="viewTicketDetails('${ticket.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn action-btn-danger" onclick="cancelTicket('${ticket.id}')">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
            break;
            
        case 'processing':
            actions = `
                <button class="action-btn action-btn-secondary" onclick="viewTicketDetails('${ticket.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="action-btn action-btn-danger" onclick="cancelTicket('${ticket.id}')">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
            break;
            
        case 'completed':
            actions = `
                <button class="action-btn action-btn-primary" onclick="downloadTicket('${ticket.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="action-btn action-btn-secondary" onclick="viewTicketDetails('${ticket.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn action-btn-secondary" onclick="rebookTicket('${ticket.id}')">
                    <i class="fas fa-redo"></i> Rebook
                </button>
            `;
            break;
            
        case 'cancelled':
            actions = `
                <button class="action-btn action-btn-secondary" onclick="viewTicketDetails('${ticket.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="action-btn action-btn-secondary" onclick="rebookTicket('${ticket.id}')">
                    <i class="fas fa-redo"></i> Rebook
                </button>
            `;
            break;
    }
    
    return actions;
}

// Show empty state when no tickets
function showEmptyState(container) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    let message = '';
    let icon = '';
    
    switch(currentFilter) {
        case 'upcoming':
            icon = 'fa-calendar-alt';
            message = 'No upcoming trips';
            break;
        case 'processing':
            icon = 'fa-clock';
            message = 'No tickets being processed';
            break;
        case 'completed':
            icon = 'fa-check-circle';
            message = 'No completed trips';
            break;
        case 'cancelled':
            icon = 'fa-times-circle';
            message = 'No cancelled tickets';
            break;
        default:
            icon = 'fa-ticket-alt';
            message = 'No tickets found';
    }
    
    emptyState.innerHTML = `
        <i class="fas ${icon}"></i>
        <h3>${message}</h3>
        <p>Start your journey by booking your first ticket!</p>
        <button class="cta-button" onclick="QuickRide.showSection('booking')">
            <i class="fas fa-plus"></i> Book a Ticket
        </button>
    `;
    
    container.appendChild(emptyState);
}

// Ticket action functions
function downloadTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    QuickRide.showNotification('Ticket download started...', 'info');
    
    // Simulate download
    setTimeout(() => {
        QuickRide.showNotification('Ticket downloaded successfully!', 'success');
    }, 2000);
}

function viewTicketDetails(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Create modal content
    const modalContent = `
        <div class="ticket-details-modal">
            <h3>Ticket Details - ${ticket.ticketNumber}</h3>
            <div class="details-grid">
                <div class="detail-item">
                    <label>Route:</label>
                    <span>${capitalizeFirst(ticket.from)} → ${capitalizeFirst(ticket.to)}</span>
                </div>
                <div class="detail-item">
                    <label>Date & Time:</label>
                    <span>${QuickRide.formatDate(ticket.departureDate)} at ${QuickRide.formatTime(ticket.departureTime)}</span>
                </div>
                <div class="detail-item">
                    <label>Passengers:</label>
                    <span>${ticket.passengers}</span>
                </div>
                <div class="detail-item">
                    <label>Ticket Type:</label>
                    <span>${capitalizeFirst(ticket.ticketType)}</span>
                </div>
                <div class="detail-item">
                    <label>Seat Preference:</label>
                    <span>${capitalizeFirst(ticket.travelPreference)}</span>
                </div>
                <div class="detail-item">
                    <label>Total Price:</label>
                    <span>${QuickRide.formatCurrency(ticket.totalPrice)}</span>
                </div>
                <div class="detail-item">
                    <label>Booking Date:</label>
                    <span>${QuickRide.formatDate(ticket.bookingDate)}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge ${ticket.status}">${capitalizeFirst(ticket.status)}</span>
                </div>
                <div class="detail-item">
                    <label>Emergency Contact:</label>
                    <span>${ticket.emergencyContactName} (${ticket.emergencyContactPhone})</span>
                </div>
            </div>
        </div>
    `;
    
    // Show modal (you would need to create a generic modal system)
    showTicketModal('Ticket Details', modalContent);
}

function cancelTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    if (confirm(`Are you sure you want to cancel ticket ${ticket.ticketNumber}?`)) {
        // Update ticket status
        QuickRide.updateTicketStatus(ticketId, 'cancelled');
        
        QuickRide.showNotification('Ticket cancelled successfully', 'success');
        
        // Refresh display
        loadTickets();
    }
}

function rebookTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Pre-fill booking form with ticket data
    if (confirm('Would you like to create a new booking with the same details?')) {
        // Switch to booking section
        QuickRide.showSection('booking');
        
        // Pre-fill form (you would need to expose this function from booking.js)
        setTimeout(() => {
            document.getElementById('from').value = ticket.from;
            document.getElementById('to').value = ticket.to;
            document.getElementById('passengers').value = ticket.passengers;
            document.getElementById('ticket-type').value = ticket.ticketType;
            document.getElementById('travel-preference').value = ticket.travelPreference;
            
            QuickRide.showNotification('Form pre-filled with previous booking details', 'info');
        }, 500);
    }
}

// Show ticket modal
function showTicketModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('ticket-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticket-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2 id="modal-title">${title}</h2>
                <div id="modal-body">${content}</div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Setup close functionality
        modal.querySelector('.close').addEventListener('click', () => {
            QuickRide.closeModal('ticket-modal');
        });
    } else {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
    }
    
    QuickRide.showModal('ticket-modal');
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

// Add sample tickets for demonstration
function addSampleTickets() {
    if (tickets.length === 0) {
        const sampleTickets = [
            {
                id: 'ticket-1',
                ticketNumber: 'QR123456ABC',
                from: 'accra',
                to: 'kumasi',
                departureDate: '2025-01-20',
                departureTime: '08:00',
                passengers: 2,
                ticketType: 'business',
                travelPreference: 'window',
                totalPrice: 90,
                status: 'upcoming',
                bookingDate: '2025-01-15',
                emergencyContactName: 'John Doe',
                emergencyContactPhone: '+233241234567',
                passengerName: 'Alice Johnson',
                passengerEmail: 'alice@example.com',
                passengerPhone: '+233245555555'
            },
            {
                id: 'ticket-2',
                ticketNumber: 'QR789012DEF',
                from: 'tamale',
                to: 'accra',
                departureDate: '2025-01-18',
                departureTime: '14:00',
                passengers: 1,
                ticketType: 'economy',
                travelPreference: 'aisle',
                totalPrice: 25,
                status: 'processing',
                bookingDate: '2025-01-16',
                emergencyContactName: 'Mary Smith',
                emergencyContactPhone: '+233267890123',
                passengerName: 'Bob Wilson',
                passengerEmail: 'bob@example.com',
                passengerPhone: '+233201111111'
            }
        ];
        
        // Save sample tickets
        localStorage.setItem('quickride_tickets', JSON.stringify(sampleTickets));
        tickets = sampleTickets;
    }
}

// Initialize with sample data if needed
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment the line below to add sample tickets for testing
    // addSampleTickets();
});

// Export functions for global access
window.TicketsModule = {
    displayTickets,
    loadTickets,
    downloadTicket,
    viewTicketDetails,
    cancelTicket,
    rebookTicket
};