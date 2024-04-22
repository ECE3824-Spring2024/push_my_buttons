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

from flask import Flask, request, jsonify
from datetime import datetime
from random import randint

server = Flask(__name__)

@server.route('/total_count', methods=['GET'])
def total_count():
    return jsonify({'total_presses_A':randint(0,1000), 'total_presses_B':randint(0,1000)})

@server.route('/variable_count', methods=['GET'])
def variable_count():
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
    server.run(debug=True)
