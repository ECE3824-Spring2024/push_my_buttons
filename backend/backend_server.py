## 
# @brief Runs a Flask backend that queries a Redis database.
#
# @section Description
# This program runs the backend for a web server that continuously
# monitors a Redis stream. The stream contains an entry for each
# button press event. The backend communicates with a React-based
# frontend using HTTP requests.
#
# @section Author
# - Muho Ahmed, Michael Caiozzo, Anna Chau, Luke Dewees, John Nori, and Abraham Paroya (c) 2024

# imports
from flask import Flask, request, jsonify
from datetime import datetime
from random import randint
import redis
import time
import pytz

# define the Flask app
server = Flask(__name__)

# connect to the Redis database
redis_db = redis.Redis(host='redis-12305.c270.us-east-1-3.ec2.cloud.redislabs.com', port=12305, password='mJxWBQYqdbSipoLAcc59qUN1zPQdDMmD')

# endpoint: total_count - return the total number of times each button has been pressed
@server.route('/total_count', methods=['GET'])
def total_count():

    stream_name = 'A-stream'

    # initializations
    total_presses_A = 0
    total_presses_B = 0
    
    # grabbing all entries in stream
    entries = redis_db.xrange(stream_name, '-', '+')

    # processing entries
    for entry_id, entry in entries:
        try:
            # extract the value from the entry
            value = entry[b'button'].decode()

            # increment counts based on the value
            if value == 'A':
                total_presses_A += 1
            elif value == 'B':
                total_presses_B += 1

        except KeyError:
            # handle case where 'button' field is missing
            print("Warning! No entry for this specific ID: ", entry_id)

    return jsonify({'total_presses_A':int(total_presses_A), 'total_presses_B':int(total_presses_B)})

# endpoint: variable_count - return the total number of times each button has been pressed in the last hour
@server.route('/variable_count', methods=['GET'])
def variable_count():

    stream_name = 'A-stream'

    # time conversion preparation for future use of xrange
    current_time = int(time.time() * 1000)                      # converting current time to ms
    desired_hours = 1                                           # specify hours (we chose to check every 1 hour)
    end_time_ms = desired_hours * 60 * 60 * 1000                # converting desired hours to ms
    end_time = current_time - end_time_ms                       # final end time

    # initializations
    count_a = 0
    count_b = 0

    # print("Current time:", current_time)
    # print("Desired end time:", end_time)

    # grab entries within the time range
    entries = redis_db.xrange(stream_name, end_time, current_time)
    # print("Entries in the last hour:", entries)

    # extract the value from the entries from last hour
    for entry_id, entry_data in entries:
        button_press = entry_data[b'button'].decode()

        # print("Entry ID:", entry_id.decode())
        # print("Entry data:", entry_data)
        
        # increment counts based on the value
        if button_press == 'A':
            count_a += 1
        elif button_press == 'B':
            count_b += 1

    return jsonify(
        {
            'var_presses_A': [
                {'timestamp':datetime.now().isoformat(sep='T', timespec='seconds'), 'count':int(count_a)}
            ],
            'var_presses_B': [
                {'timestamp':datetime.now().isoformat(sep='T', timespec='seconds'), 'count':int(count_b)}
            ]
        }
    )

# endpoint: initialize_count - return the total number of times each button has been pressed in the last nine hours
@server.route('/initialize_count', methods=['GET'])
def initialize_count():

    stream_name = 'A-stream'

    # time conversion preparation for future use of xrange
    current_time = int(time.time() * 1000)                      # converting current time to ms
    desired_hours = 1                                           # specify hours (we chose to check every 1 hour)
    end_time_ms = desired_hours * 60 * 60 * 1000                # converting desired hours to ms
    end_time = current_time - end_time_ms                       # final end time

    # initializations
    count_a = [0]*10
    count_b = [0]*10

    # create an array of timestamps for the last 10 hours
    desired_history = 10
    end_times = []
    for i in range(0, desired_history):
        end_times.append(current_time - ((i+1) * 60 * 60 * 1000))
    
    # print("Current date:", datetime.fromtimestamp(current_time/1000))
    # print("Desired end date:", datetime.fromtimestamp(end_time/1000))

    # grab entries for each specified time range
    entries_across_range = []
    for end_time in end_times:
        entries_across_range.append(redis_db.xrange(stream_name, end_time, current_time))
        current_time = end_time

    # for each hour-long interval, count the total number of button presses
    for i,entries in enumerate(entries_across_range):
        for entry_id, entry_data in entries:
            button_press = entry_data[b'button'].decode()

            print("Entry ID:", entry_id.decode())
            print("Entry data:", entry_data)
        
            # increment counts based on the value
            if button_press == 'A':
                count_a[i] += 1
            elif button_press == 'B':
                count_b[i] += 1

    # format the data using JSON so that the frontend can understand it
    return_dictionary = {'var_presses_A':[], 'var_presses_B':[]}
    end_times.pop()
    end_times.reverse()
    #end_times.append(int(time.time() * 1000) )
    count_a.reverse()
    count_b.reverse()
    for t,ca,cb in zip(end_times,count_a,count_b):
        return_dictionary['var_presses_A'].append({'timestamp':datetime.fromtimestamp(t/1000).isoformat(sep='T', timespec='seconds'), 'count':int(ca)})
        return_dictionary['var_presses_B'].append({'timestamp':datetime.fromtimestamp(t/1000).isoformat(sep='T', timespec='seconds'), 'count':int(cb)})

    return jsonify(return_dictionary)

# endpoint: query - return the total number of times each button has been pressed in the specified range
@server.route('/query', methods=['POST'])
def query():

    stream_name = "A-stream"

    # get the dates and times input by the user
    data = request.json
    start_date = data.get('start_date')
    start_time = data.get('start_time')
    end_date = data.get('end_date')
    end_time = data.get('end_time')

    start_datetime = datetime.strptime(f"{start_date} {start_time}", "%Y-%m-%d %H:%M")
    end_datetime = datetime.strptime(f"{end_date} {end_time}", "%Y-%m-%d %H:%M")

    edt = pytz.timezone('America/New_York')

    start_datetime = edt.localize(start_datetime)
    end_datetime = edt.localize(end_datetime)

    start_timestamp = int(start_datetime.timestamp() * 1000)
    end_timestamp = int(end_datetime.timestamp() * 1000)

    print(start_timestamp, end_timestamp)
    entries = redis_db.xrange(stream_name, start_timestamp, end_timestamp)
    print(entries)

    # extract the value from the entries from last hour
    count_a = 0
    count_b = 0
    for entry_id, entry_data in entries:
        button_press = entry_data[b'button'].decode()

        # increment counts based on the value
        if button_press == 'A':
            count_a += 1
        elif button_press == 'B':
            count_b += 1
        
    return jsonify({'query_count_A':count_a,'query_count_B':count_b})

if __name__ == '__main__':
    server.run(host='0.0.0.0', debug=True)
