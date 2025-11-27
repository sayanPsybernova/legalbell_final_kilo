# Client Database Separation

## Overview
The LegalBell system now uses separate databases for clients and lawyers to improve data organization and security.

## Database Files

### 1. `clientdb.json` - Client Database
- **Purpose**: Stores all client registration data
- **Structure**:
```json
{
  "clients": [
    {
      "id": 100,
      "name": "Client Name",
      "email": "client@example.com",
      "password": "hashed_password",
      "role": "client",
      "createdAt": "2025-11-27T15:42:48.386Z"
    }
  ]
}
```

### 2. `db.json` - Main Database (Lawyers & Bookings)
- **Purpose**: Stores lawyer data, bookings, and lawyer user accounts
- **Structure**: 
  - `lawyers[]` - Lawyer profiles
  - `bookings[]` - All booking data
  - `users[]` - Lawyer login accounts only

## API Endpoints Affected

### Client Operations (use `clientdb.json`)
- `POST /api/register` (role: "client")
- `POST /api/login` (role: "client")
- `GET /api/client/:id`
- `PUT /api/client/:id`
- `GET /api/client/:id/bookings`

### Lawyer Operations (use `db.json`)
- `POST /api/register` (role: "lawyer")
- `POST /api/login` (role: "lawyer")
- `GET /api/lawyers`
- `GET /api/lawyers/:id`
- `POST /api/bookings`
- `GET /api/bookings`

## Security Features
- All passwords are hashed using SHA-256
- Client and lawyer data are completely separated
- Login authentication checks appropriate database based on role

## Migration Notes
- Existing clients in `db.json` remain there for backward compatibility
- All new client registrations go to `clientdb.json`
- No changes were made to lawyer data structure

## Testing
Run `node test_clientdb.js` to verify the client database separation is working correctly.

## Benefits
1. **Better Organization**: Client data is separated from lawyer data
2. **Enhanced Security**: Reduced data exposure between user types
3. **Scalability**: Easier to manage client-specific features
4. **Backup Flexibility**: Can backup client data independently