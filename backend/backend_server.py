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
# define the Flask app
server = Flask(__name__)

redis_db = redis.Redis(host='redis-12305.c270.us-east-1-3.ec2.cloud.redislabs.com', port=12305, password='mJxWBQYqdbSipoLAcc59qUN1zPQdDMmD')

# endpoint: total_count - return the total number of times each button has been pressed
@server.route('/total_count', methods=['GET'])
def total_count():

    ################ ADD REDIS CODE HERE ##################
    
    # Make a request to the redis server to get the total number of button presses.

    # This will be polled at the rate that the frontend calls this endpoint.
    
    # Make sure to return the same data as below, replacing the 'randint' functions with the
    # Redis results.

    stream_name = 'A-stream'

    total_presses_A = 0
    total_presses_B = 0
    
    entries = redis_db.xrange(stream_name, '-', '+')

    # Process each entry
    for entry_id, entry in entries:
        try:
            # Extract the value from the entry
            value = entry[b'button'].decode()

            # Increment counts based on the value
            if value == 'A':
                total_presses_A += 1
            elif value == 'B':
                total_presses_B += 1
        except KeyError:
            # Handle case where 'button' field is missing
            print("Warning! No entry for this specific ID: ", entry_id)

    return jsonify({'total_presses_A':int(total_presses_A), 'total_presses_B':int(total_presses_B)})

    # return jsonify({'total_presses_A':randint(0,1000), 'total_presses_B':randint(0,1000)})


@server.route('/variable_count', methods=['GET'])
def variable_count():

    ################ ADD REDIS CODE HERE ##################
    
    # Make a request to the redis server to analyze the stream.

    # We just need to count the number of new stream events for each button
    # press in the last hour. 

    # This function is called once an hour by the React frontend, so no timer is needed
    # in this Python code.
    
    # Make sure to return the same data as below, replacing the 'randint' functions with the
    # Redis results.

    # The timestamps are already generated as shown below. We just need to update the 'count' variable.

    stream_name = 'A-stream'

    current_time = int(time.time() * 1000)          # converting current time to ms
    desired_hours = 1
    end_time_ms = desired_hours * 60 * 60 * 1000    # converting hours to ms
    end_time = current_time - end_time_ms  

    count_a = 0
    count_b = 0

    # print("Current time:", current_time)
    # print("Desired end time:", end_time)

    # Retrieve entries within the time range
    entries = redis_db.xrange(stream_name, end_time, current_time)
    # print(len(entries))
    # print("Entries in the last hour:", entries)

    for entry_id, entry_data in entries:
        # print("Entry ID:", entry_id.decode())
        # print("Entry data:", entry_data)

        button_press = entry_data[b'button'].decode()
        
        # Increment the corresponding counter based on the button press
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

if __name__ == '__main__':
    server.run(host='0.0.0.0', debug=True)
