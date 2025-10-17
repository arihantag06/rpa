from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
SELENIUM_URL = os.environ.get('SELENIUM_URL', 'http://localhost:4444')
VNC_URL = os.environ.get('VNC_URL', 'http://localhost:7900')

# Global browser state
driver = None
browser_state = {
    'url': '',
    'title': '',
    'is_running': False
}

def get_driver():
    """Get or create Selenium WebDriver"""
    global driver
    if driver is None:
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        driver = webdriver.Remote(
            command_executor=SELENIUM_URL,
            options=options
        )
        print("✓ Browser session created")
    return driver

@app.route('/api/execute-step', methods=['POST'])
def execute_step():
    try:
        step_data = request.get_json()
        
        if not step_data:
            return jsonify({'error': 'No step data provided'}), 400
        
        result = execute_step_with_selenium(step_data)
        
        socketio.emit('step_executed', {
            'step': step_data,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/execute-workflow', methods=['POST'])
def execute_workflow():
    try:
        workflow_data = request.get_json()
        steps = workflow_data.get('steps', [])
        
        if not steps:
            return jsonify({'error': 'No steps provided'}), 400
        
        results = []
        
        for step in steps:
            result = execute_step_with_selenium(step)
            results.append({
                'step_id': step.get('id'),
                'result': result,
                'timestamp': datetime.now().isoformat()
            })
            
            socketio.emit('workflow_progress', {
                'step': step,
                'result': result,
                'completed': len(results),
                'total': len(steps),
                'timestamp': datetime.now().isoformat()
            })
        
        return jsonify({
            'success': True,
            'results': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/browser', methods=['POST'])
def browser_control():
    try:
        data = request.get_json()
        command = data.get('command')
        command_data = data.get('data', {})
        
        result = execute_browser_command(command, command_data)
        
        socketio.emit('browser_update', {
            'type': command,
            'data': result,
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    global driver
    return jsonify({
        'status': 'healthy',
        'selenium_url': SELENIUM_URL,
        'vnc_url': VNC_URL,
        'browser_active': driver is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/browser-stream-info', methods=['GET'])
def get_browser_stream_info():
    """Get live browser stream information"""
    return jsonify({
        'streamUrl': VNC_URL,  # noVNC URL for live viewing
        'streamType': 'vnc',
        'connected': True,
        'interactive': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/browser-state', methods=['GET'])
def get_browser_state():
    """Get current browser state"""
    global browser_state, driver
    
    if driver:
        try:
            browser_state['url'] = driver.current_url
            browser_state['title'] = driver.title
        except:
            pass
    
    return jsonify({
        'url': browser_state.get('url', ''),
        'title': browser_state.get('title', ''),
        'is_running': browser_state.get('is_running', False),
        'timestamp': datetime.now().isoformat()
    })

def execute_step_with_selenium(step):
    """Execute a single step using Selenium"""
    global browser_state
    
    try:
        step_type = step.get('type')
        config = step.get('config', {})
        
        browser = get_driver()
        browser_state['is_running'] = True
        
        if step_type == 'navigate':
            url = config.get('url', '')
            if not url.startswith('http'):
                url = 'https://' + url
            
            browser.get(url)
            browser_state['url'] = url
            browser_state['title'] = browser.title
            
            return {
                'success': True,
                'url': url,
                'title': browser.title
            }
        
        elif step_type == 'click':
            xpath = config.get('xpath', '')
            element = WebDriverWait(browser, 10).until(
                EC.element_to_be_clickable((By.XPATH, xpath))
            )
            element.click()
            time.sleep(0.5)  # Brief wait for page update
            
            return {'success': True, 'message': f'Clicked element: {xpath}'}
        
        elif step_type == 'type':
            xpath = config.get('xpath', '')
            text = config.get('text', '')
            
            element = WebDriverWait(browser, 10).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )
            element.clear()
            element.send_keys(text)
            time.sleep(0.5)
            
            return {'success': True, 'message': f'Typed text into: {xpath}'}
        
        elif step_type == 'wait':
            duration = config.get('duration', 1)
            time.sleep(duration)
            return {'success': True, 'message': f'Waited for {duration} seconds'}
        
        elif step_type == 'screenshot':
            screenshot = browser.get_screenshot_as_base64()
            return {
                'success': True,
                'screenshot': f'data:image/png;base64,{screenshot}'
            }
        
        else:
            return {'success': False, 'error': f'Unknown step type: {step_type}'}
            
    except Exception as e:
        browser_state['is_running'] = False
        return {'success': False, 'error': str(e)}

def execute_browser_command(command, data):
    """Execute browser commands"""
    global browser_state, driver
    
    try:
        if command == 'reset':
            if driver:
                driver.quit()
                driver = None
            browser_state = {
                'url': '',
                'title': '',
                'is_running': False
            }
            return {'success': True, 'message': 'Browser reset'}
        
        elif command == 'stop':
            browser_state['is_running'] = False
            return {'success': True, 'message': 'Browser stopped'}
        
        else:
            return {'success': False, 'error': f'Unknown command: {command}'}
            
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    print("=" * 60)
    print("Starting Live Browser Backend (Selenium + VNC)")
    print("=" * 60)
    print(f"Selenium URL: {SELENIUM_URL}")
    print(f"Live Browser View: {VNC_URL}")
    print("=" * 60)
    print("\nAccess the live browser at:")
    print(f"  {VNC_URL}")
    print("\nPassword: secret (if required)")
    print("=" * 60)
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

