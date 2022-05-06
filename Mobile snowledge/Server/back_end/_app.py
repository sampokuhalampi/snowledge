from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import _database as db
import json
from time import time
from waitress import serve

time3DaysAgo = int(time()) - 259200

connection = db.connect_to_database()

app = Flask(__name__)
cors = CORS(app)


@app.route('/login', methods=['GET'])
def login_user():
    header = request.headers
    username, password = header.get('Authorization').split(':')

    auth = db.user_authentication(connection, username, password)

    if auth:
        response = jsonify({"message": "OK: Authorized"}), 200
    else:
        response = jsonify({"message": "ERROR: Unauthorized"}), 401
    return response

@app.route('/get/users', methods=['GET'])
def get_users():
    header = request.headers
    username, password = header.get('Authorization').split(':')

    auth = db.user_authentication(connection, username, password)

    users     = get_list_from_database("dev_id,first_name,last_name", "users")
    locations = get_latest_locations(time3DaysAgo)
    result_table = []

    for user in users:
        for data in locations:
            if user[0] == data[0]:
                entry = []
                entry.append(user[0])
                entry.append(user[1])
                entry.append(user[2])
                gps = data[2].split(',')
                entry.append(gps[0])
                entry.append(gps[1])
                result_table.append(entry)

    if auth:
        response = jsonify(result_table), 200
    else:
        response = jsonify({"message": "ERROR: Unauthorized"}), 401
    return response

@app.route('/get/help', methods=['GET'])
def get_help():
    header = request.headers
    username, password = header.get('Authorization').split(':')

    auth = db.user_authentication(connection, username, password)

    help_requesters = get_list_from_database("dev_id,timestamp,gpscoord", "help")
    users     = get_list_from_database("dev_id,first_name,last_name", "users")
    result_table = []

    for data in help_requesters:
        for user in users:
            if user[0] == data[0]:
                entry = []
                entry.append(user[0])
                entry.append(user[1])
                entry.append(user[2])
                entry.append(data[1])
                gps = data[2].split(',')
                entry.append(gps[0])
                entry.append(gps[1])
                result_table.append(entry)

    if auth:
        response = jsonify(result_table), 200
    else:
        response = jsonify({"message": "ERROR: Unauthorized"}), 401
    return response

@app.route('/get/location', methods=['GET', 'POST'])
def post_locations():
    header = request.headers
    username, password = header.get('Authorization').split(':')
    data = json.loads(request.data.decode())
    result = get_last_x_locations(data['num_locations'], data['dev_id'])

    result_table = []

    for location in result:
        entry = []
        entry.append(location[0])
        entry.append(location[1])
        gps = location[2].split(',')
        entry.append(gps[0])
        entry.append(gps[1])
        result_table.append(entry)

    auth = db.user_authentication(connection, username, password)

    if auth:
        response = jsonify(result_table), 200
    else:
        response = jsonify({"message": "ERROR: Unauthorized"}), 401
    return response


@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    header['Access-Control-Allow-Headers'] = '*'
    # Other headers can be added here if required
    return response

def get_list_from_database(data, source):
    sql = '''SELECT {} FROM {};'''.format(data, source)
    
    cur = connection.cursor()
    cur.execute(sql)
    _list = cur.fetchall()

    return _list

def get_latest_locations(time3DaysAgo):
    sql = '''SELECT dev_id, max(timestamp), gpscoord
             FROM data WHERE timestamp > ? GROUP BY dev_id;'''

    cur = connection.cursor()
    cur.execute(sql, (time3DaysAgo,))
    users = cur.fetchall()
    return users

def get_last_x_locations(num_locations, dev_id):
    sql = '''SELECT * FROM data WHERE dev_id=? ORDER BY timestamp DESC;'''

    cur = connection.cursor()
    cur.execute(sql, (dev_id,))
    locations = cur.fetchall()

    return locations[:num_locations]


if __name__ == "__main__":
    serve(app, port=3002)