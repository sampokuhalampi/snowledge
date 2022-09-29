from socket import *
import select
import _database as db
import _parser as prs
from datetime import datetime
import time


class UdpServer:
    def __init__(self):
        self.connection = db.connect_to_database()
        self.status = True

        self.udp = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP)
        self.udp.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)
        self.udp.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        self.udp.bind(('', 50943))

        db.init_tables(self.connection)
        self.max_time_from_closest_users = 7200
        self.max_distance_from_help_request = 2.0
        self.max_entry_age = 172800

    def run(self):
        print("Run function working")
        last_time = time.time()
        while self.status:
            curr_time = time.time()
            if curr_time - last_time > 30:
                last_time = curr_time
                timestamp = time.time() - self.max_time_from_closest_users
                prs.send_location_updates(self.connection, timestamp, self.udp)

                old_entries = db.fetch_old_entries(
                    self.connection, self.max_entry_age)
                db.delete_old_entries(self.connection, old_entries)
                db.delete_old_users(self.connection)

            readable, _, _ = select.select([self.udp], [], [], 60)
            if not readable:
                continue
            msg, addr = readable[0].recvfrom(4096)
            message, msg_type = prs.parse_message(msg)

            try:
                if msg_type == "HELP":
                    prs.parse_help_request(
                        self.connection,
                        message,
                        self.max_time_from_closest_users,
                        self.max_distance_from_help_request,
                        self.udp
                    )
                elif msg_type == "LOCATION":
                    prs.parse_database_entry(
                        self.connection,
                        message,
                        addr,
                        self.max_entry_age
                    )
                elif msg_type == "HELP_DELETE":
                    prs.parse_database_help_delete(
                        self.connection, message, self.udp)
                elif msg_type == "HELP_RESPONSE":
                    prs.parse_help_response(
                        self.connection, message, self.max_time_from_closest_users, self.udp)
                elif msg_type == "DECLINE":
                    prs.parse_help_decline(self.connection, message, self.udp)
                elif msg_type == "KEEP_ALIVE":
                    self.udp.sendto(bytes(message[0], "UTF-8"), addr)
            except:
                print('Message parse error.')


if __name__ == "__main__":
    udp = UdpServer()
    udp.run()
