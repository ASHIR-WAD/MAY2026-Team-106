from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

# --- Many-to-Many Association Tables ---

class UserInterestTag(db.Model):
    __tablename__ = 'user_interest_tags'
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('interest_tags.id', ondelete='CASCADE'), primary_key=True)


class UserFollow(db.Model):
    __tablename__ = 'user_follows'
    follower_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True)
    following_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True)
    followed_at = db.Column(db.DateTime, server_default=db.func.now())


class EventTag(db.Model):
    __tablename__ = 'event_tags'
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), primary_key=True)
    tag_id = db.Column(db.Integer, db.ForeignKey('interest_tags.id', ondelete='CASCADE'), primary_key=True)


class NotificationRecipient(db.Model):
    __tablename__ = 'notification_recipients'
    notification_id = db.Column(db.Integer, db.ForeignKey('notifications.id', ondelete='CASCADE'), primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), primary_key=True)
    read_at = db.Column(db.DateTime, nullable=True)
    hide_at = db.Column(db.DateTime, nullable=True)


# --- Core Models ---

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False) # 'ATTENDEE, ORGANISER, ADMIN'
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    status = db.Column(db.String(30), server_default='ACTIVE') # 'ACTIVE, SUSPENDED, PENDING_APPROVAL'
    pfp_url = db.Column(db.String(255), nullable=True)
    dob = db.Column(db.Date, nullable=True)
    description = db.Column(db.Text, nullable=True)
    bookmarks = db.Column(ARRAY(db.Integer), nullable=True) # event IDs
    docs = db.Column(db.String(255), nullable=True)

    # Relationships
    interest_tags = db.relationship('InterestTag', secondary='user_interest_tags', backref=db.backref('users', lazy='dynamic'))

    # Password Hashing Logic
    @property
    def password(self):
        raise AttributeError('Password is not a readable attribute.')

    @password.setter
    def password(self, plain_password):
        self.password_hash = generate_password_hash(plain_password)

    def verify_password(self, plain_password):
        return check_password_hash(self.password_hash, plain_password)


class InterestTag(db.Model):
    __tablename__ = 'interest_tags'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tag_name = db.Column(db.String(50), unique=True, nullable=False)


class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    organiser_id = db.Column(ARRAY(db.Integer), nullable=False) # Array of user IDs
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    imp_info = db.Column(ARRAY(db.String(255)), nullable=True)
    venue = db.Column(db.String(255), nullable=False)
    capacity_limit = db.Column(db.Integer, nullable=False)
    registration_deadline = db.Column(db.DateTime, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    age_limit = db.Column(db.Integer, nullable=True)
    banner_url = db.Column(db.String(255), nullable=True)
    pfp_url = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), nullable=True) # 'PENDING_MODERATION, ACTIVE, CANCELLED'
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    terms_url = db.Column(db.String(255), nullable=True)

    # Relationships
    tags = db.relationship('InterestTag', secondary='event_tags', backref=db.backref('events', lazy='dynamic'))
    media_gallery = db.relationship('MediaGallery', backref='event', cascade='all, delete-orphan')
    ticket_types = db.relationship('TicketType', backref='event', cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='event')


class MediaGallery(db.Model):
    __tablename__ = 'media_gallery'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)


class TicketType(db.Model):
    __tablename__ = 'ticket_types'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    quantity_total = db.Column(db.Integer, nullable=False)
    quantity_sold = db.Column(db.Integer, server_default='0')


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    attendee_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='RESTRICT'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='RESTRICT'), nullable=False)
    ticket_type_ids = db.Column(ARRAY(db.Integer), nullable=True)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(db.String(30), nullable=True) # 'PENDING, SUCCESS, FAILED'
    payment_gateway_ref = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    access_code = db.Column(db.String(100), unique=True, nullable=False)

    # Relationships
    attendee = db.relationship('User', foreign_keys=[attendee_id], backref='orders')
    review = db.relationship('EventReview', backref='order', uselist=False, cascade='all, delete-orphan')


class EventReview(db.Model):
    __tablename__ = 'event_reviews'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), unique=True, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='SET NULL'), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    broadcast_type = db.Column(db.String(30), nullable=True) # 'CRITICAL_UPDATE, EARLY_BIRD'
    sent_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    recipients = db.relationship('User', secondary='notification_recipients', backref=db.backref('notifications', lazy='dynamic'))
    event = db.relationship('Event', backref='notifications')


class PlatformModerationLog(db.Model):
    __tablename__ = 'platform_moderation_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='SET NULL'), nullable=True)
    action_taken = db.Column(db.String(50), nullable=True) # 'APPROVED, PURGED'
    reason = db.Column(db.Text, nullable=True)
    logged_at = db.Column(db.DateTime, server_default=db.func.now())

    # Explicit foreign key backrefs to handle ambiguity under User
    admin = db.relationship('User', foreign_keys=[admin_id], backref='moderation_actions_logged')
    target_user = db.relationship('User', foreign_keys=[user_id], backref='moderation_history')
    event = db.relationship('Event', backref='moderation_logs')
