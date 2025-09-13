**Setup**
**Backend**

Install MSSQL database and make sure it is running.
Navigate to the backend folder:
cd src/Contact-Manager.Api


Run the backend:
dotnet run

The API will start on port 5000.

**Frontend**

Navigate to the frontend folder:
cd frontend

Install dependencies:
npm install


Start the React application:
npm start


The frontend will start on port 3000.

**API Endpoints**

**Upload CSV**
**POST** /contact-manager/api/contracts

Upload a .csv file containing contact data.

**Get Contacts**
**GET** /contact-manager/api/contracts
**Query parameters:**
Page (default: 1)
PageSize (default: 100)
Returns a paginated list of contacts.

**Get Contact by ID**
**GET** /contact-manager/api/contracts/{id}
Returns details of a specific contact.

**Update Contact**
**PATCH** /contact-manager/api/contracts/{id}
Update specific fields of a contact.

**Delete Contact**
**DELETE** /contact-manager/api/contracts
Deletes a contact (usually by ID in request body).

**Notes**
Make sure the backend is running before accessing the frontend.
CSV file must have proper headers matching the database schema.
API follows REST conventions for CRUD operations.
