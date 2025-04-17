## Clean Architecture (Backend Structure)

This project follows a modular "clean architecture", separating concerns into layers:

### Architecture Flow

             
            HTTP Request
                 │
                 ▼
            ┌────────────┐
            │   Route    │  ← Maps URL + method to controller (e.g. POST /supplier → controller.create)
            └────┬───────┘
                 │
                 ▼
           ┌──────────────┐
           │  Controller  │  ← Handles request & sends response
           └────┬─────────┘
                │ calls
                ▼
           ┌─────────────────┐
           │   Use-case      │  ← Business logic (e.g. check if supplier exists)
           └────┬────────────┘
                │
                │ uses / returns
                ▼
           ┌─────────────────┐
           │    Entity       │  ← Core domain model (e.g. Supplier class)
           └────┬────────────┘
                │
                │ interacts with
                ▼
           ┌─────────────────┐
           │  Repository     │  ← Handles SQL queries using mysql2
           └────┬────────────┘
                │
                ▼
           ┌─────────────────┐
           │   MySQL2 DB     │  ← Executes SQL with db.execute()
           └─────────────────┘


---

### Layer Responsibilities

| **Routes**     | `routes/supplierRoutes.js` | Maps HTTP methods + paths to controller functions 
| **Controller** | `controllers/supplierController.js`| Handles requests/responses, calls use-cases
| **Use-case**   | `use-cases/addSupplier.js`| Business logic (e.g., check if supplier exists)           
| **Entity**     | `entities/Supplier.js`    | Class or object representing the domain model          
| **Repository** | `repositories/supplierRepository.js` | Handles SQL queries via MySQL2 
| **Database**   | `config/db.js`            | MySQL2 client connection, passed to repositories         


### References:
https://merlino.agency/blog/clean-architecture-in-express-js-applications#3_interface_adapters
https://medium.com/@ben.dev.io/clean-architecture-in-node-js-39c3358d46f3
https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
https://www.youtube.com/watch?v=neGIM7BpluM&list=PLaLqLOj2bk9aaZZYoH7tMDj5obE7os45_&index=8&ab_channel=CodewithJay
https://www.youtube.com/watch?v=fc6o1gwqZuA&t=68s&ab_channel=SoftwareDeveloperDiaries
https://mr-alien.medium.com/folder-structure-for-nodejs-expressjs-project-56be9ec35548
https://www.youtube.com/watch?v=-ojYfV4NSUQ&ab_channel=Profydev


Notes: https://app.eraser.io/workspace/iuRKjv7fNpfO04fKnj0h?origin=share