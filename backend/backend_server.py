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

# define the Flask app
server = Flask(__name__)

# endpoint: total_count - return the total number of times each button has been pressed
@server.route('/total_count', methods=['GET'])
def total_count():

    ################ ADD REDIS CODE HERE ##################
    
    # Make a request to the redis server to get the total number of button presses.

    # This will be polled at the rate that the frontend calls this endpoint.
    
    # Make sure to return the same data as below, replacing the 'randint' functions with the
    # Redis results.

    return jsonify({'total_presses_A':randint(0,1000), 'total_presses_B':randint(0,1000)})

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

    return jsonify(
        {
            'var_presses_A': [
                {'timestamp':datetime.now().isoformat(sep='T', timespec='seconds'), 'count':randint(0,1000)}
            ],
            'var_presses_B': [
                {'timestamp':datetime.now().isoformat(sep='T', timespec='seconds'), 'count':randint(0,1000)}
            ]
        }
    )

if __name__ == '__main__':
    server.run(host='0.0.0.0', debug=True)
