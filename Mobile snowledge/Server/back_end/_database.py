import os
import pathlib
import sqlite3
import time
from sqlite3 import Error


with open('Mobile snowledge/Server/back_end/admin_user.txt', 'r') as file:
    lines = file.readlines()
    for i in range(len(lines)):
        lines[i] = lines[i].rstrip()
    ADMIN = lines[0]
    PASSWORD = lines[1]


def create_connection(path):
    connection = None

    try:
        connection = sqlite3.connect(path, check_same_thread=False)
    except Error as e:
        print(f"The error '{e}' occurred")

    return connection


def connect_to_database():
    path = pathlib.Path(__file__).parent.resolve()
    path = str(str(path) + '/db/')

    if not os.path.exists(path):
        os.makedirs(path)
        connection = create_connection(path+'database')
    else:
        connection = create_connection(path+'database')

    return connection


def user_authentication(connection, username, password):
    correct = False
    sql = '''SELECT password FROM accounts WHERE username=?;'''

    cur = connection.cursor()
    cur.execute(sql, (username,))
    _password = cur.fetchall()
    if _password:
        _password = _password[0][0]
        correct = password == _password

    return correct


def get_latest_locations(connection, timestamp):
    sql = '''SELECT dev_id, max(timestamp), gpscoord
             FROM data WHERE timestamp > ? GROUP BY dev_id;'''

    cur = connection.cursor()
    cur.execute(sql, (timestamp,))
    users = cur.fetchall()
    return users


def get_helper_count(connection, requester):
    sql = '''SELECT COUNT(help_giver) 
             FROM requests 
             WHERE help_requester = ? 
             AND state = 1'''

    cur = connection.cursor()
    cur.execute(sql, (requester,))
    count = cur.fetchall()
    return count[0][0]


def get_all_pending_requests(connection, requester):
    sql = '''SELECT help_giver 
             FROM requests
             WHERE help_requester = ?
             AND state = 0'''

    cur = connection.cursor()
    cur.execute(sql, (requester,))
    users = cur.fetchall()
    return users


def create_user_entry(connection, user):
    sql = ''' INSERT INTO users(dev_id,first_name,last_name,ip_address)
              VALUES (?,?,?,?) '''

    cur = connection.cursor()
    cur.execute(sql, user)
    connection.commit()
    return user[0]


def create_data_entry(connection, data):
    sql = ''' INSERT INTO data(dev_id,timestamp,gpscoord)
              VALUES (?,?,?)'''

    cur = connection.cursor()
    cur.execute(sql, data)
    connection.commit()
    return


def create_help_entry(connection, help):
    sql = ''' INSERT INTO help(dev_id,timestamp,gpscoord)
              VALUES (?,?,?)'''

    _, exists = check_if_entry_exists(
        connection, 'help', 'dev_id', 'dev_id', help[0], False)

    if exists:
        return

    cur = connection.cursor()
    cur.execute(sql, help)
    connection.commit()
    return


def create_request_entry(connection, requester, helper):
    sql = '''INSERT INTO requests(help_giver,help_requester,state)
             VALUES(?,?,?)'''

    entry, exists = check_if_entry_exists(
        connection, 'requests', 'help_giver', 'help_giver', helper, False)

    if exists:
        return False

    cur = connection.cursor()
    cur.execute(sql, (helper, requester, 0))
    connection.commit()
    return True


def update_request_state(connection, _state, helper):
    sql = '''UPDATE requests SET state=? WHERE help_giver=?'''

    cur = connection.cursor()
    cur.execute(sql, (_state, helper))
    connection.commit()


def update_ip_address(connection, dev_id, addr_str):
    sql = '''UPDATE users SET ip_address=? WHERE dev_id=?'''

    cur = connection.cursor()
    cur.execute(sql, (addr_str, dev_id))
    connection.commit()
    return


def select_request_entry(connection, entry, ID):
    sql = '''SELECT help_giver,help_requester FROM requests
             WHERE {} = ?;'''.format(ID)

    cur = connection.cursor()
    cur.execute(sql, (entry,))
    entry = cur.fetchall()
    return entry


def get_all_requests(connection):
    sql = '''SELECT * FROM requests WHERE state = 1;'''

    cur = connection.cursor()
    cur.execute(sql)
    entry = cur.fetchall()
    return entry


def get_all_pallaksen_pollot(connection):
    sql = '''SELECT * FROM users WHERE first_name= "8M0sZy" AND last_name= "FBy2sR";'''

    cur = connection.cursor()
    cur.execute(sql)
    entry = cur.fetchall()
    return entry


def delete_request_entry(connection, entry, ID):
    sql = '''DELETE FROM requests
             WHERE {} = ?;'''.format(ID)

    cur = connection.cursor()
    cur.execute(sql, (entry,))
    connection.commit()
    return


def delete_help_entry(connection, dev_id):
    sql = '''DELETE FROM help
             WHERE dev_id = ?;'''

    cur = connection.cursor()
    cur.execute(sql, (dev_id,))
    connection.commit()
    return


def fetch_old_entries(connection, threshold):
    current_time = int(time.time())
    delete_threshold = current_time - threshold
    sql = '''SELECT * FROM data
             WHERE timestamp < ?;'''
    cur = connection.cursor()
    cur.execute(sql, (delete_threshold,))
    entries = cur.fetchall()
    return entries


def delete_old_entries(connection, entries):
    sql = '''DELETE FROM data
             WHERE dev_id = ?
             AND timestamp = ?;'''

    cur = connection.cursor()
    for entry in entries:
        deletion = (entry[0], entry[1])
        cur.execute(sql, deletion)
    return


def delete_old_users(connection):
    sql = '''SELECT dev_id FROM users;'''
    delete_sql = '''DELETE FROM users WHERE dev_id = ?;'''
    delete_sql2 = '''DELETE FROM help WHERE dev_id = ?;'''

    cur = connection.cursor()
    cur.execute(sql)
    dev_ids = cur.fetchall()

    for id in dev_ids:
        _, exists = check_if_entry_exists(
            connection, 'data', 'dev_id', 'dev_id', id[0], False)
        if not exists:
            cur.execute(delete_sql, (id[0],))
            cur.execute(delete_sql2, (id[0],))
    return


def create_table(connection, create_table_sql):
    try:
        cur = connection.cursor()
        cur.execute(create_table_sql)
    except Error as e:
        print(e)


def init_tables(connection):
    sql_table_users = ''' CREATE TABLE IF NOT EXISTS users (
                            dev_id text PRIMARY KEY,
                            first_name text NOT NULL,
                            last_name text NOT NULL,
                            ip_address text NOT NULL
                         ); '''

    sql_table_data = '''CREATE TABLE IF NOT EXISTS data (
                            dev_id text,
                            timestamp integer,
                            gpscoord text,
                            PRIMARY KEY(dev_id, timestamp)
                        );'''

    sql_table_help = ''' CREATE TABLE IF NOT EXISTS help (
                            dev_id text PRIMARY KEY,
                            timestamp integer,
                            gpscoord text
                        );'''

    sql_table_accounts = '''CREATE TABLE IF NOT EXISTS accounts (
                            username text PRIMARY KEY,
                            password text NOT NULL,
                            role text NOT NULL
                            );'''

    sql_table_requests = '''CREATE TABLE IF NOT EXISTS requests (
                            help_giver text PRIMARY KEY,
                            help_requester text NOT NULL,
                            state INTEGER NOT NULL
                            );'''

    create_table(connection, sql_table_users)
    create_table(connection, sql_table_data)
    create_table(connection, sql_table_help)
    create_table(connection, sql_table_accounts)
    create_table(connection, sql_table_requests)

    sql = "DELETE FROM accounts WHERE role = 'Admin'"
    sql2 = 'INSERT OR IGNORE INTO accounts(username,password,role) VALUES(?,?,?);'
    username = ADMIN
    password = PASSWORD
    role = 'Admin'

    cur = connection.cursor()
    cur.execute(sql)
    cur.execute(sql2, (username, password, role))
    connection.commit()


def check_if_entry_exists(connection, table, key1, key2, entry, full_return):
    try:
        cur = connection.cursor()
    except Error as e:
        print(e)

    _query = "SELECT {} FROM {} WHERE {}=?".format(key1, table, key2)
    cur.execute(_query, (entry,))

    exists = cur.fetchall()

    if exists:
        if full_return:
            return exists, True
        return exists[0][0], True
    else:
        return None, False
