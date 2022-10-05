import _database as db
from math import radians, cos, sin, asin, sqrt
import time

PORT = 50943
COUNT = 5


def parse_message(msg):
    message = msg.decode()
    message = message.split(':')
    msg_type = message[0]
    return message[1:], msg_type


def parse_help_request(connection, message, max_time_from_closest_users, max_distance, s):
    timestamp = message[0]
    dev_id = message[1]
    gpscoord = message[2]

    user_id, exists = db.check_if_entry_exists(
        connection, 'users', 'dev_id', 'dev_id', dev_id, False)

    if not exists:
        return

    help = (user_id, timestamp, gpscoord)
    db.create_help_entry(connection, help)

    users = get_closest_users(connection, gpscoord,
                              max_distance,
                              int(timestamp) - max_time_from_closest_users)

    for user in users:
        if user[0] == dev_id:
            continue
        if not db.create_request_entry(connection, dev_id, user[0]):
            continue
        ip_address, _ = db.check_if_entry_exists(
            connection, 'users', 'ip_address', 'dev_id', user[0], False)
        message = 'NOTIFY:{}:{}:{:.2f}km'.format(user[0], gpscoord, user[1])
        ip_address, port = ip_address.split(',')
        s.sendto(bytes(message, 'UTF-8'), (ip_address, int(port)))

    pallaksenpollot = db.get_all_pallaksen_pollot(connection)

    for user in pallaksenpollot:
        if user[0] == dev_id:
            continue
        ip_address, _ = db.check_if_entry_exists(
            connection, 'users', 'ip_address', 'dev_id', user[0], False)
        message = 'NOTIFY:{}:{}'.format(user[0], gpscoord)
        ip_address, port = ip_address.split(',')
        s.sendto(bytes(message, 'UTF-8'), (ip_address, int(port)))


def parse_database_entry(connection, message, addr, max_entry_age):
    timestamp = message[0]
    dev_id = message[1]
    etunimi = message[2]
    sukunimi = message[3]
    gpscoord = message[4]

    addr_str = '{},{}'.format(addr[0], addr[1])
    user = (dev_id, etunimi, sukunimi, addr_str)
    user_entry_id, exists = db.check_if_entry_exists(
        connection, 'users', 'dev_id', 'dev_id', dev_id, False)

    if not exists:
        user_id = db.create_user_entry(connection, user)
    else:
        user_id = user_entry_id

    data = (user_id, timestamp, gpscoord)
    try:
        db.create_data_entry(connection, data)
        db.update_ip_address(connection, dev_id, addr_str)
    except:
        print('INFO:Entry already exists')


def parse_database_help_delete(connection, message, s):
    dev_id = message[0]

    _, exists = db.check_if_entry_exists(
        connection, 'help', 'dev_id', 'dev_id', dev_id, False)

    if not exists:
        return

    users = db.select_request_entry(connection, dev_id, 'help_requester')

    for user in users:
        ip_address, _ = db.check_if_entry_exists(
            connection, 'users', 'ip_address', 'dev_id', user[0], False)
        message = 'HELP_OVER:{}'.format(user[0])
        ip_address, port = ip_address.split(',')
        s.sendto(bytes(message, 'UTF-8'), (ip_address, int(port)))
        db.delete_request_entry(connection, user[0], 'help_giver')

    db.delete_help_entry(connection, dev_id)
    db.delete_request_entry(connection, dev_id, 'help_requester')


def calculate_distance(lat1, lon1, lat2, lon2):
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371
    return c * r  # distance in km


def get_closest_users(connection, gpscoord, max_distance, timestamp):
    users = db.get_latest_locations(connection, timestamp)
    users_in_range = []

    for user in users:
        gps1 = user[2].split(',')
        gps2 = gpscoord.split(',')
        lat1 = float(gps1[0])
        lon1 = float(gps1[1])
        lat2 = float(gps2[0])
        lon2 = float(gps2[1])

        distance = calculate_distance(lat1, lon1, lat2, lon2)

        if distance <= max_distance:
            users_in_range.append((user[0], distance))

    return users_in_range


def parse_help_response(connection, message, max_time_from_closest_users, s):
    timestamp = int(time.time()/1000) - max_time_from_closest_users
    helper = message[0]
    state = message[1]
    _, exists = db.check_if_entry_exists(
        connection, 'requests', 'state', 'help_giver', helper, False)
    if not exists:
        return

    requester, _ = db.check_if_entry_exists(
        connection, 'requests', 'help_requester', 'help_giver', helper, False)

    if state == '0':
        db.delete_request_entry(connection, helper, 'help_giver')
        return

    db.update_request_state(connection, state, helper)

    count = db.get_helper_count(connection, requester)

    entry = db.select_request_entry(connection, helper, 'help_giver')
    ip_address, _ = db.check_if_entry_exists(
        connection, 'users', 'ip_address', 'dev_id', entry[0][1], False)
    users = db.get_latest_locations(connection, timestamp)
    for user in users:
        if user[0] == helper:
            gpscoord = user[2]
            break

    message = 'HELPER_ACCEPTED:{}:{}'.format(helper, gpscoord)
    ip_address, port = ip_address.split(',')
    s.sendto(bytes(message, 'UTF-8'), (ip_address, int(port)))

    if count >= COUNT:
        pending_helpers = db.get_all_pending_requests(connection, requester)

        for _helper in pending_helpers:
            address, _ = db.check_if_entry_exists(
                connection, 'users', 'ip_address', 'dev_id', _helper[0], False)
            message = 'HELP_OVER:{}'.format(_helper[0])
            addr = address.split(',')
            s.sendto(bytes(message, 'UTF-8'), (addr[0], int(addr[1])))
            db.delete_request_entry(connection, _helper[0], 'help_giver')

    return


def parse_help_decline(connection, message, s):
    helper = message[0]
    _, exists = db.check_if_entry_exists(
        connection, 'requests', 'state', 'help_giver', helper, False)

    if not exists:
        return

    entry = db.select_request_entry(connection, helper, 'help_giver')
    db.delete_request_entry(connection, helper, 'help_giver')

    ip_address, _ = db.check_if_entry_exists(
        connection, 'users', 'ip_address', 'dev_id', entry[0][1], False)
    message = 'HELPER_WITHDRAWN:{}'.format(helper)
    ip_address, port = ip_address.split(',')
    s.sendto(bytes(message, 'UTF-8'), (ip_address, int(port)))

    return


def do_work(giver, requester, coordinates):
    connection = db.connect_to_database()

    j = len(coordinates)-1
    requester_gps = 0
    giver_gps = 0

    for i in range(len(coordinates)):
        user1 = coordinates[i][0]
        if user1 == requester:
            requester_gps = coordinates[i][2]
        elif user1 == giver:
            giver_gps = coordinates[i][2]

    requester_addr, _ = db.check_if_entry_exists(
        connection, 'users', 'ip_address', 'dev_id', giver, False)
    requester_message = 'HELP_TARGET_UPDATE:{}:{}'.format(giver, requester_gps)

    giver_addr, _ = db.check_if_entry_exists(
        connection, 'users', 'ip_address', 'dev_id', requester, False)
    giver_message = 'HELPER_UPDATED:{}:{}'.format(giver, giver_gps)

    result = [[requester_message, requester_addr],
              [giver_message, giver_addr]]
    return result


def send_location_updates(connection, timestamp, s):
    requests = db.get_all_requests(connection)
    coordinates = db.get_latest_locations(connection, timestamp)

    messages = []
    for request in requests:
        message = do_work(request[0], request[1], coordinates)
        messages.append(message)

    for message in messages:
        requester_message, requester_addr = message[0][0], message[0][1]
        giver_message, giver_addr = message[1][0], message[1][1]

        requester_addr, requester_port = requester_addr.split(',')
        giver_addr, giver_port = giver_addr.split(',')
        s.sendto(bytes(requester_message, 'UTF-8'),
                 (requester_addr, int(requester_port)))
        s.sendto(bytes(giver_message, 'UTF-8'), (giver_addr, int(giver_port)))

    return
