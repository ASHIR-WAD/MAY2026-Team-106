*Important Info*

backend/
├── app/
│   ├── __init__.py             # Application factory (loads blueprints, configures extensions)
│   ├── config.py               # Runtime profiles (Development, Testing, Production)
│   ├── extensions.py           # Decoupled instances (db = SQLAlchemy(), bcrypt, etc.)
│   ├── models.py               # UNIFIED DATABASE SCHEMA (Contains all tables, relationships, and enums)
│   ├── api/                    # API Endpoints (Flask-RESTful Resources & Routing)
│   │   ├── __init__.py         # Central Blueprint hub & route mapper
│   │   ├── auth.py             # Half 1: Auth endpoints
│   │   ├── users.py            # Half 1 & 2: Profiles, Document Upload, Follows, Bookmarks
│   │   ├── events.py           # Half 1 & 2: Management, Discovery, Tags, Reviews
│   │   ├── tickets.py          # Half 1: Ticket tiers
│   │   ├── orders.py           # Half 1 & 2: Checkout, Confirm, Order Reviews
│   │   ├── notifications.py    # Half 1: Basic notification polling
│   │   ├── analytics.py        # Half 2: Organiser Dashboard data
│   │   ├── admin.py            # Half 2: Trust, Safety & Approvals
│   │   └── location.py         # Half 2: Nominatim Geocoding proxy
       # SPRINT 2 CODE: Nominatim OpenStreetMap Proxy Engine
│   └── services/               # Decoupled integrations and business logic utilities
│       ├── __init__.py
│       └── openstreetmap.py    # SPRINT 2 CODE: External Nominatim API query client
├── migrations/                 # Database schema evolution tracking (Alembic/Flask-Migrate)
├── tests/                      # Automated functional verification architecture
│   ├── conftest.py             # Reusable pytest fixtures and database sandbox isolation configs
│   ├── test_sprint1.py         # SPRINT 1 TEST CASES: Core verification test routines
│   └── test_sprint2.py         # SPRINT 2 TEST CASES: Extended functional behavior tests
├── .env                        # Production secret profiles, keys, and DB passwords (git-ignored)
├── .flaskenv                   # Global environmental flags (FLASK_APP=run.py, FLASK_DEBUG=1)
├── requirements.txt            # System component dependencies manifest
└── run.py                      # Production WSGI application gateway entry point
