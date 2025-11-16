USE travel_tourism_db;

-- Insert Sample Users (Password: 'password123' - should be hashed in real application)
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('admin', 'admin@travel.com', '$2b$10$jiMnmqUi8u9rKHZshC1D6uFmeoHTgXSiVuciTf9qg71E0br0isxWW', 'Admin User', '9876543212', 'admin'),
('satyamanand', 'satyamanand@gmail.com', '$2b$10$RjPOZJfHJTsJTp.iDUrF.uTSkMrMWgYtqR8tgaLJ1hn7m1rPmLPBS', 'Satyam Anand', '8757223456', 'customer'),
('sudhanshuraj', 'sudhanshuraj@gmail.com', '$2b$10$uM7u69NslqZRwJpSqSFeUuYp2nHduWpvunjt63T9XuWtpJ42lEMjq', 'Sudhanshu Raj', '6243897612', 'customer');


-- Insert Destinations
INSERT INTO destinations (name, country, description, image_url, popular) VALUES
('Paris', 'France', 'The City of Light, known for the Eiffel Tower, art, and cuisine', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', TRUE),
('Bali', 'Indonesia', 'Tropical paradise with beautiful beaches and temples', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', TRUE),
('Tokyo', 'Japan', 'Modern metropolis blending tradition with futuristic technology', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', TRUE),
('Rome', 'Italy', 'Ancient city with historic landmarks and amazing food', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', TRUE),
('Maldives', 'Maldives', 'Stunning island paradise with crystal clear waters', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', TRUE),
('Dubai', 'UAE', 'Luxury destination with modern architecture and shopping', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', FALSE);

-- Insert Packages
INSERT INTO packages (destination_id, title, description, duration_days, duration_nights, price, max_people, included_services, excluded_services, itinerary, image_url, available) VALUES
(1, 'Paris Romantic Getaway', 'Experience the romance of Paris with this 5-day package including Eiffel Tower, Louvre, and Seine cruise', 5, 4, 1299.99, 2, 'Hotel accommodation, Breakfast, Airport transfers, Guided tours', 'Lunch, Dinner, Personal expenses', 'Day 1: Arrival and Eiffel Tower\nDay 2: Louvre Museum\nDay 3: Versailles Palace\nDay 4: Seine River Cruise\nDay 5: Departure', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', TRUE),
(2, 'Bali Beach Paradise', 'Relax on pristine beaches and explore ancient temples in Bali', 7, 6, 999.99, 4, 'Hotel accommodation, Breakfast, Airport transfers, Temple tours, Beach activities', 'Lunch, Dinner, Water sports', 'Day 1: Arrival\nDay 2-3: Beach relaxation\nDay 4: Temple tours\nDay 5-6: Water activities\nDay 7: Departure', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', TRUE),
(3, 'Tokyo Adventure', 'Explore the vibrant city of Tokyo with modern and traditional experiences', 6, 5, 1499.99, 3, 'Hotel accommodation, Breakfast, JR Pass, Guided tours', 'Lunch, Dinner, Shopping', 'Day 1: Arrival\nDay 2: Shibuya and Harajuku\nDay 3: Traditional temples\nDay 4: Mount Fuji day trip\nDay 5: Shopping and entertainment\nDay 6: Departure', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', TRUE),
(4, 'Rome Historical Tour', 'Walk through history in the Eternal City', 5, 4, 1199.99, 4, 'Hotel accommodation, Breakfast, Colosseum tickets, Vatican tour', 'Lunch, Dinner, Personal expenses', 'Day 1: Arrival and Colosseum\nDay 2: Vatican Museums\nDay 3: Roman Forum\nDay 4: Trevi Fountain and Spanish Steps\nDay 5: Departure', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', TRUE),
(5, 'Maldives Luxury Escape', 'Ultimate luxury experience in overwater villas', 7, 6, 2999.99, 2, 'Overwater villa, All meals, Water sports, Spa treatment, Airport transfers', 'Alcoholic beverages, Diving courses', 'Day 1: Arrival and villa check-in\nDay 2-5: Beach and water activities\nDay 6: Spa day\nDay 7: Departure', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8', TRUE),
(6, 'Dubai Shopping Extravaganza', 'Shop till you drop in the luxury capital', 4, 3, 899.99, 4, 'Hotel accommodation, Breakfast, Desert safari, Shopping mall tours', 'Shopping expenses, Lunch, Dinner', 'Day 1: Arrival\nDay 2: Burj Khalifa and Dubai Mall\nDay 3: Desert safari\nDay 4: Departure', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c', TRUE);

-- Insert Sample Bookings
INSERT INTO bookings (user_id, package_id, booking_date, travel_date, num_people, total_amount, status, payment_status) VALUES
(2, 1, '2024-10-15', '2024-12-20', 2, 2599.98, 'confirmed', 'paid'),
(3, 2, '2024-10-20', '2024-11-15', 3, 2999.97, 'confirmed', 'paid'),
(2, 3, '2024-10-25', '2025-01-10', 2, 2999.98, 'pending', 'pending');

-- Insert Sample Reviews
INSERT INTO reviews (user_id, package_id, booking_id, rating, comment) VALUES
(2, 1, 1, 5, 'Amazing experience! Paris was beautiful and the tour was well organized.'),
(3, 2, 2, 4, 'Great beaches and friendly guides. Would recommend!');