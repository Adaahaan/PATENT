from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Items(db.Model):
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), nullable=False)
    name_ru = db.Column(db.String(255), nullable=True)
    name_en = db.Column(db.String(255), nullable=False)
    name_fr = db.Column(db.String(255), nullable=False)
    name_ky = db.Column(db.String(255), nullable=False)
    class_code = db.Column(db.String(10), nullable=False)
    
    def __repr__(self):
        return f'<Item {self.code}: {self.name_ru}>'

class Class(db.Model):
    __tablename__ = 'classes'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    tags = db.Column(db.JSON, nullable=True)
    
    def __repr__(self):
        return f'<Class {self.code}>'



########################################################
# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from flask_login import UserMixin
# from flask_principal import Permission, RoleNeed

# app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///your_database.db'
# db = SQLAlchemy(app)

# # Роли
# class Role(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(80), unique=True, nullable=False)
#     users = db.relationship('User', backref='role', lazy=True)

# # Пользователь
# class User(UserMixin, db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(150), unique=True, nullable=False)
#     email = db.Column(db.String(150), unique=True, nullable=False)
#     password = db.Column(db.String(150), nullable=False)
#     role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)

#     def __repr__(self):
#         return f'<User {self.username}>'

# # Права доступа
# class Permissions:
#     user_permission = Permission(RoleNeed('user'))
#     translator_permission = Permission(RoleNeed('translator'))
#     moderator_permission = Permission(RoleNeed('moderator'))

# # Создание базы данных
# with app.app_context():
#     db.create_all()
########################################################