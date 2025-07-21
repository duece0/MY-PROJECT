# QuickRide - Bus Pass Ticket Booking Website

A modern, responsive web application for booking bus tickets across Ghana. Built with HTML5, CSS3, and JavaScript.

## 🚀 Features

- **Modern Responsive Design**: Beautiful UI that works on all devices
- **Ticket Booking System**: Easy-to-use booking form with real-time price calculation
- **Multiple Payment Methods**: Support for Mobile Money, Credit/Debit Cards, and Bank Transfer
- **Ticket Management**: View, filter, and manage your booked tickets
- **Real-time Validation**: Form validation with user-friendly error messages
- **Local Storage**: Persistent ticket storage using browser localStorage
- **Interactive Navigation**: Smooth navigation between sections
- **Contact Form**: Get in touch with customer support

## 📁 Project Structure

```
bus-pass-website/
├── index.html              # Main HTML file
├── styles/                 # CSS stylesheets
│   ├── main.css           # Main styles (navigation, hero, footer, common)
│   ├── booking.css        # Booking form and modal styles
│   └── tickets.css        # Tickets section and card styles
├── js/                    # JavaScript modules
│   ├── main.js           # Main navigation and utilities
│   ├── booking.js        # Booking form functionality
│   ├── tickets.js        # Ticket display and management
│   └── payment.js        # Payment processing and validation
├── assets/               # Static assets
│   └── images/          # Image files (placeholder)
└── README.md            # Project documentation
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Flexbox, Grid, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript features and DOM manipulation
- **Font Awesome**: Icons for enhanced UI
- **Local Storage**: Client-side data persistence

## 🎨 Key Features Breakdown

### Home Section
- Hero section with call-to-action
- Gradient background design
- Responsive layout

### Booking System
- Route selection (6 Ghana cities)
- Date and time selection
- Passenger count selection
- Ticket type selection (Economy, Business, VIP)
- Real-time price calculation
- Form validation

### Payment Processing
- Multiple payment methods
- Input formatting (card numbers, expiry dates)
- Form validation
- Simulated payment processing
- Success confirmation

### Ticket Management
- Filter tickets by status (All, Upcoming, Completed, Cancelled)
- View detailed ticket information
- Cancel upcoming tickets
- Responsive ticket cards

### Contact Section
- Contact information display
- Contact form with validation
- Social media links

## 🚀 Getting Started

1. **Clone or download** the project files
2. **Open** `index.html` in a modern web browser
3. **Navigate** through the sections using the navigation menu
4. **Book a ticket** by filling out the booking form
5. **View your tickets** in the "My Tickets" section

## 💡 Usage Guide

### Booking a Ticket
1. Click "Book Now" or navigate to "Book Ticket"
2. Select departure and destination cities
3. Choose your travel date and time
4. Select number of passengers and ticket type
5. Review the total price
6. Click "Book Ticket" to proceed to payment
7. Fill in passenger and payment details
8. Complete the payment process

### Managing Tickets
1. Navigate to "My Tickets"
2. Use filter buttons to view specific ticket types
3. Click "View" to see detailed ticket information
4. Click "Cancel" to cancel upcoming tickets

### Payment Methods
- **Mobile Money**: MTN, Vodafone, AirtelTigo
- **Credit/Debit Card**: Visa, Mastercard, etc.
- **Bank Transfer**: Direct bank transfer

## 🎯 Sample Data

The application includes sample tickets for demonstration:
- Sample upcoming ticket: Accra → Kumasi
- Sample completed ticket: Tema → Cape Coast

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🔧 Customization

### Adding New Cities
Edit the city options in `index.html`:
```html
<option value="new-city">New City</option>
```

### Modifying Prices
Update prices in `js/booking.js`:
```javascript
switch(ticketType) {
    case 'economy':
        basePrice = 25; // Modify this value
        break;
    // ... other cases
}
```

### Styling Changes
- Main styles: `styles/main.css`
- Booking styles: `styles/booking.css`
- Tickets styles: `styles/tickets.css`

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support or questions, please contact:
- Email: support@quickride.gh
- Phone: +233 24 123 4567
- Address: Tema, Greater Accra, Ghana

## 🔮 Future Enhancements

- User authentication and registration
- Real-time seat selection
- SMS/Email notifications
- GPS tracking for buses
- Rating and review system
- Multi-language support
- Mobile app development
- Integration with real payment gateways

---

Built with ❤️ for convenient bus travel in Ghana