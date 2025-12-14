
export const FALLBACK_DIAGRAM_CODE = `flowchart TB

    A["User Input Received"] --> B{"Is input shorter than 20 characters?"}

    B -- Yes --> X["Show This Flow Diagram"]
    B -- No --> C["Send Description to LLM"]

    C --> D{"Did LLM create valid Mermaid code?"}
    D -- Yes --> E["Generate Your Awesome Diagram!"]
    D -- No --> X

    %% Styling for important decision/failure nodes
    style A stroke:#D50000
    style B stroke:#D50000
    style D stroke:#D50000
    style X stroke:#D50000`;

export const EXAMPLES = [
  {
    label: "Flowchart",
    description: "A troubleshooting flow for a lamp. It checks if the lamp is plugged in and if the bulb is burned out to determine whether to plug it in, replace the bulb, or repair the lamp.",
    code: `graph TD
    A[Lamp doesn't work] --> B{Is lamp plugged in?}
    B -- No --> C[Plug in lamp]
    B -- Yes --> D{Bulb burned out?}
    D -- Yes --> E[Replace bulb]
    D -- No --> F[Repair lamp]`
  },
  {
    label: "Sequence",
    description: "A web request sequence. The User enters a URL in the Browser, which sends a Request to the Server. The Server queries the Database, gets Data back, and sends a Response to the Browser to render.",
    code: `sequenceDiagram
    actor User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Enters URL
    Browser->>Server: HTTP Request
    Server->>Database: Query Data
    Database-->>Server: Return Data
    Server-->>Browser: HTTP Response
    Browser-->>User: Render Page`
  },
  {
    label: "State Diagram",
    description: "A state machine for a traffic light system. It cycles through Green, Yellow, and Red states, with specific transitions defined for each phase.",
    code: `stateDiagram-v2
    [*] --> Green
    Green --> Yellow
    Yellow --> Red
    Red --> Green`
  },
  {
    label: "Class Diagram",
    description: "A class diagram representing a simple banking system. It defines the structure and relationships between Bank, Account, and Customer classes.",
    code: `classDiagram
    class Bank {
        +String name
        +getAccounts()
    }
    class Account {
        +String owner
        +BigDecimal balance
        +deposit(amount)
        +withdraw(amount)
    }
    class Customer {
        +String name
        +String address
    }
    Bank "1" -- "*" Account : manages
    Customer "1" -- "*" Account : owns`
  },
  {
    label: "Entity Relationship",
    description: "An ER diagram for an e-commerce database. It maps the relationships between Customers, Orders, and Line Items using standard cardinality notation.",
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`
  },
  {
    label: "User Journey",
    description: "A typical day routine modeled as a User Journey. It tracks satisfaction scores (1-5) across different activities like sleeping, commuting, working, and going home.",
    code: `journey
    title A Typical Work Day
    section Morning
      Wake up: 3: Me, Cat
      Coffee: 5: Me
      Commute: 1: Me
    section Work
      Meetings: 2: Me
      Coding: 5: Me
    section Evening
      Go home: 4: Me
      Sleep: 5: Me, Cat`
  },
  {
    label: "Timeline",
    description: "A product launch timeline spanning 2023 and 2024. It visualizes phases from Strategy & Concept, through Design & Development, to the final Launch and Marketing campaigns.",
    code: `timeline
    title Product Launch Timeline
    2023 Q1 : Strategy
            : Concept
    2023 Q2 : Design
            : Prototyping
    2023 Q3 : Development
            : Testing
    2023 Q4 : Launch
            : Marketing`
  },
  {
    label: "Gantt Chart",
    description: "A project schedule for a website redesign. It tracks the timeline for Wireframing, UI Design, Backend, and Frontend development phases.",
    code: `gantt
    title Website Redesign
    dateFormat  YYYY-MM-DD
    section Design
    Wireframes      :a1, 2024-01-01, 7d
    UI Visuals      :after a1, 10d
    section Dev
    Backend         :2024-01-10, 15d
    Frontend        :2024-01-15, 12d`
  },
  {
    label: "Pie Chart",
    description: "A simple pie chart visualizing the distribution of bugs reported by severity level in a software project.",
    code: `pie title Bug Severity Distribution
    "Critical" : 5
    "Major" : 15
    "Minor" : 45
    "Trivial" : 35`
  },
  {
    label: "Mindmap",
    description: "A mindmap organizing a marketing strategy. It breaks down into Digital, Print, and Event channels with sub-strategies for each.",
    code: `mindmap
  root((Marketing))
    Digital
      Social Media
      SEO
      Email
    Print
      Flyers
      Billboards
    Events
      Webinars
      Conferences`
  }
];
