
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Path to the stepper motor control script
SCRIPT_PATH = "/home/pi239/Desktop/group_project_8-1/stepper_motor_test/main.py"

@app.route('/control', methods=['POST'])
def control_eraser():
    data = request.json
    action = data.get('action')
    
    if not action:
        return jsonify({'status': 'error', 'message': 'Missing action parameter'}), 400
    
    try:
        # Execute the Python script with the action as an argument
        result = subprocess.run(
            ['python', SCRIPT_PATH, action],
            capture_output=True,
            text=True,
            check=True
        )
        
        return jsonify({
            'status': 'success',
            'message': f'Command {action} executed successfully',
            'output': result.stdout
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            'status': 'error',
            'message': f'Error executing command: {e}',
            'stderr': e.stderr
        }), 500

if __name__ == '__main__':
    # Run the server on all available interfaces
    app.run(host='0.0.0.0', port=5000, debug=True)
