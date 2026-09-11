# Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ EVENT : organizes
    USER ||--o{ REGISTRATION : makes
    EVENT ||--o{ REGISTRATION : receives
    USER ||--o{ EVENT : books_via_bookedBy

    USER {
      ObjectId _id PK
      String name
      String email UK
      String phone
      String password
      String role
      Date createdAt
      Date lastLogin
    }
    EVENT {
      ObjectId _id PK
      String title
      String description
      Date date
      Date registrationDeadline
      String time
      String venue
      String category
      Number capacity
      Number price
      String image
      ObjectId createdBy FK
      ObjectId organizerId FK
      ObjectId[] bookedBy FK
      String status
    }
    REGISTRATION {
      ObjectId _id PK
      ObjectId userId FK
      ObjectId eventId FK
      Date registrationDate
      Date createdAt
      Date updatedAt
    }
    FEEDBACK {
      ObjectId _id PK
      String name
      String email
      String message
    }
```

Feedback is stored in the `feedback` collection but has no User or Event reference in the current schema. `Event.bookedBy` is the legacy denormalized booking list; new participant registrations also create a `Registration` document.
