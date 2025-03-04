from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from datetime import datetime
from flask_migrate import Migrate
import pandas as pd
from flask import Flask,render_template,request,jsonify,redirect,url_for,session

from models import Class

app = Flask(__name__)

# Конфигурация базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///items.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersecretkey'

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Модель для базы данных
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    name_ru = db.Column(db.String(255), nullable=False)
    name_en = db.Column(db.String(255), nullable=False)
    name_fr = db.Column(db.String(255), nullable=False)
    name_ky = db.Column(db.String(255), nullable=False)
    class_code = db.Column(db.String(10), nullable=False)
    is_nice = db.Column(db.Boolean, default=True)
    

    # def take_tr(translated_names, language):
    #     tr_names = []
    #     for i in translated_names







# Инициализация базы данных
def add_new_items():
    with app.app_context():
        new_items = []
        for item in new_items:
            existing_item = Item.query.filter_by(code=item.code).first()
            if not existing_item:
                db.session.add(item)
        db.session.commit()

def initialize_database():
    db.create_all()
    add_new_items()

# Главная страница
@app.route('/')
def home():
    current_date = datetime.now().strftime('%Y.%m.%d')
    return render_template('index.html', current_date=current_date)

# Браузер терминов
@app.route('/browse', methods=['GET'])
def browse():
    class_code = request.args.get('class')
    nice_only = request.args.get('nice_only') == 'true'

    query = Item.query
    if class_code:
        query = query.filter(Item.class_code == class_code)
    if nice_only:
        query = query.filter(Item.is_nice == True)

    items = query.all()
    return jsonify({
        "totalResults": len(items),
        "results": [{"code": item.code, "name_ru": item.name_ru, "class_code": item.class_code} for item in items]
    })

# Поиск терминов
@app.route('/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query', '').strip().lower()
    class_code = data.get('classCode')
    nice_only = data.get('niceOnly', False)

    query_filter = Item.query
    if query:
        query_filter = query_filter.filter(Item.name_ru.ilike(f"%{query}%"))
    if class_code:
        query_filter = query_filter.filter(Item.class_code == class_code)
    if nice_only:
        query_filter = query_filter.filter(Item.is_nice == True)

    results = query_filter.all()
    return jsonify({
        "totalResults": len(results),
        "results": [{"code": item.code, "name_ru": item.name_ru, "class_code": item.class_code} for item in results]
    })

# Получение терминов по классу
@app.route('/class/<class_code>')
def get_class_details(class_code):
    try:
        items = db.session.query(Item).filter_by(class_code=class_code).all()
        items_data = [{"code": item.code, "name_ru": item.name_ru, "class_code": item.class_code} for item in items]
        
        return jsonify({
            'class_code': class_code,
            'items': items_data,
            'total': len(items_data)
        })
    except Exception as e:
        return jsonify({'error': 'Ошибка при получении данных', 'message': str(e)}), 500

# @app.route('/admin_tr', methods=['GET', 'POST'])
# def admin():
#     if request.method == 'POST':
#         code = request.form.get('code')
#         name_ru = request.form.get('name_ru')
#         name_en = request.form.get('name_en')
#         name_fr = request.form.get('name_fr')
#         name_ky = request.form.get('name_ky')
#         class_code = request.form.get('class_code')
#         if code and name_ru and class_code:
#             existing_item = Item.query.filter_by(code=code).first()
#             if not existing_item:
#                 new_item = Item(code=code, name_ru=name_ru, name_en=name_en, name_fr=name_fr, name_ky=name_ky, class_code=class_code)
#                 db.session.add(new_item)
#                 db.session.commit()

#         return redirect(url_for('admin'))

#     items = Item.query.all()
#     return render_template('admin.html', items=items)

# Данные для входа
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'password123'  # Лучше хранить в .env или хешировать

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            return "Неверный логин или пароль", 403
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('login'))

@app.route('/admin_tr', methods=['GET', 'POST'])
def admin():
    if not session.get('admin_logged_in'):
        return redirect(url_for('login'))

    if request.method == 'POST':
        code = request.form.get('code')
        name_ru = request.form.get('name_ru')
        name_en = request.form.get('name_en')
        name_fr = request.form.get('name_fr')
        name_ky = request.form.get('name_ky')
        class_code = request.form.get('class_code')
        
        if code and name_ru and class_code:
            existing_item = Item.query.filter_by(code=code).first()
            if not existing_item:
                new_item = Item(code=code, name_ru=name_ru, name_en=name_en, name_fr=name_fr, name_ky=name_ky, class_code=class_code)
                db.session.add(new_item)
                db.session.commit()
        return redirect(url_for('admin'))

    items = Item.query.all()
    return render_template('admin.html', items=items)


@app.route('/transfer', methods=['POST'])
def transfer_data():
    data = request.json.get('data')

@app.route('/import', methods=['POST'])
def import_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file found'}), 400

    file = request.files['file']
    if file and file.filename.endswith('.csv'):
        try:
            # Пример обработки CSV
            df = pd.read_csv(file)
            # Тут можно добавить обработку данных, например, сохранение в БД

            # Отправляем обратно данные
            return jsonify({'success': True, 'items': df.to_dict(orient='records')})
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500
    return jsonify({'success': False, 'message': 'Invalid file type'}), 400



@app.route('/translate', methods=['GET', 'POST'])
def translate():
    if request.method == 'POST':
        language = request.form.get('language')

        if language not in ['ru', 'en', 'fr', 'ky']:
            return redirect(url_for('index'))

        # Получаем все элементы с заполненными переводами
        items = Item.query.all()
        
        # Фильтруем только те переводы, которые не пустые
        translated_names = {
            getattr(item, f'name_{language}') for item in items if getattr(item, f'name_{language}')
        }

        # Преобразуем множество имен в строку через запятую
        translated_names_str = ', '.join(translated_names)

        return render_template('translated_items.html', translated_names=translated_names_str)

    return render_template('translate_form.html')





@app.route('/delete/<int:id>')
def delete_item(id):
    item = Item.query.get(id)
    if item:
        db.session.delete(item)
        db.session.commit()
    return redirect(url_for('admin'))







# Запуск приложения
if __name__ == 'main':
    with app.app_context():
        initialize_database()
    app.run(debug=True)  