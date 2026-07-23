#!/usr/bin/env python3
"""
SoilCredit Backend API Test Suite - Phase 2 (Auth + Land CRUD + Purchase)
Tests all endpoints in app/api/[[...path]]/route.js
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:3000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_test(name: str):
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}TEST: {name}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}")

def log_success(msg: str):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def log_error(msg: str):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def log_info(msg: str):
    print(f"{Colors.YELLOW}ℹ {msg}{Colors.END}")

def validate_response(response, expected_status: int, test_name: str) -> bool:
    """Validate response status and return True if matches"""
    if response.status_code != expected_status:
        log_error(f"{test_name} - Expected status {expected_status}, got {response.status_code}")
        log_error(f"Response: {response.text}")
        return False
    log_success(f"{test_name} - Status code {response.status_code} ✓")
    return True

# Global state for test flow
test_state = {
    'token_A': None,
    'token_B': None,
    'landId': None,
    'firstEntryId': None,
    'secondEntryId': None,
}

def test_1_signup_landowner():
    """Test 1: POST /api/auth/signup landowner A"""
    log_test("1. POST /api/auth/signup - Landowner A")
    
    try:
        payload = {
            "email": "a@t.com",
            "password": "pass123",
            "name": "Alice",
            "role": "landowner"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Signup landowner"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'token' not in data or 'user' not in data:
            log_error("Missing token or user in response")
            return False
        
        # Store token
        test_state['token_A'] = data['token']
        log_success(f"Token A captured: {test_state['token_A'][:20]}...")
        
        # Validate user
        user = data['user']
        if user.get('role') != 'landowner':
            log_error(f"Expected role=landowner, got {user.get('role')}")
            return False
        log_success(f"User role = landowner ✓")
        
        # Check no sensitive data leaked
        if 'hash' in user or 'salt' in user or '_id' in user:
            log_error("Sensitive data (hash/salt/_id) leaked in response")
            return False
        log_success("No sensitive data leaked ✓")
        
        log_success("Test 1 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 1 FAILED: {str(e)}")
        return False

def test_2_signup_company():
    """Test 2: POST /api/auth/signup company B"""
    log_test("2. POST /api/auth/signup - Company B")
    
    try:
        payload = {
            "email": "b@t.com",
            "password": "pass123",
            "name": "Bob",
            "role": "company",
            "company": "Acme ESG"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Signup company"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'token' not in data or 'user' not in data:
            log_error("Missing token or user in response")
            return False
        
        # Store token
        test_state['token_B'] = data['token']
        log_success(f"Token B captured: {test_state['token_B'][:20]}...")
        
        # Validate user
        user = data['user']
        if user.get('role') != 'company':
            log_error(f"Expected role=company, got {user.get('role')}")
            return False
        log_success(f"User role = company ✓")
        
        if user.get('company') != 'Acme ESG':
            log_error(f"Expected company='Acme ESG', got {user.get('company')}")
            return False
        log_success(f"User company = Acme ESG ✓")
        
        log_success("Test 2 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 2 FAILED: {str(e)}")
        return False

def test_3_signup_duplicate():
    """Test 3: POST /api/auth/signup duplicate email"""
    log_test("3. POST /api/auth/signup - Duplicate Email (should fail)")
    
    try:
        payload = {
            "email": "a@t.com",
            "password": "pass123",
            "name": "Alice Clone",
            "role": "landowner"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload, timeout=10)
        
        if not validate_response(response, 400, "Signup duplicate"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Email already registered' not in data.get('error', ''):
            log_error(f"Expected error message 'Email already registered', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Email already registered' ✓")
        
        log_success("Test 3 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 3 FAILED: {str(e)}")
        return False

def test_4_signup_short_password():
    """Test 4: POST /api/auth/signup with short password"""
    log_test("4. POST /api/auth/signup - Short Password (should fail)")
    
    try:
        payload = {
            "email": "c@t.com",
            "password": "abc",
            "name": "Charlie",
            "role": "landowner"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/auth/signup", json=payload, timeout=10)
        
        if not validate_response(response, 400, "Signup short password"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Password too short' not in data.get('error', ''):
            log_error(f"Expected error message 'Password too short', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Password too short' ✓")
        
        log_success("Test 4 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 4 FAILED: {str(e)}")
        return False

def test_5_login_correct():
    """Test 5: POST /api/auth/login with correct credentials"""
    log_test("5. POST /api/auth/login - Correct Credentials")
    
    try:
        payload = {
            "email": "a@t.com",
            "password": "pass123"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Login correct"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'token' not in data:
            log_error("Missing token in response")
            return False
        log_success(f"Token received: {data['token'][:20]}...")
        
        log_success("Test 5 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 5 FAILED: {str(e)}")
        return False

def test_6_login_wrong_password():
    """Test 6: POST /api/auth/login with wrong password"""
    log_test("6. POST /api/auth/login - Wrong Password (should fail)")
    
    try:
        payload = {
            "email": "a@t.com",
            "password": "wrongpass"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        
        if not validate_response(response, 401, "Login wrong password"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Invalid credentials' not in data.get('error', ''):
            log_error(f"Expected error message 'Invalid credentials', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Invalid credentials' ✓")
        
        log_success("Test 6 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 6 FAILED: {str(e)}")
        return False

def test_7_auth_me_with_token():
    """Test 7: GET /api/auth/me with token"""
    log_test("7. GET /api/auth/me - With Token")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        log_info(f"Request headers: Authorization: Bearer {test_state['token_A'][:20]}...")
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Auth me with token"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'user' not in data:
            log_error("Missing user in response")
            return False
        
        user = data['user']
        if user.get('role') != 'landowner':
            log_error(f"Expected role=landowner, got {user.get('role')}")
            return False
        log_success(f"User role = landowner ✓")
        
        # Check no sensitive data leaked
        if 'hash' in user or 'salt' in user or '_id' in user:
            log_error("Sensitive data (hash/salt/_id) leaked in response")
            return False
        log_success("No sensitive data leaked ✓")
        
        log_success("Test 7 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 7 FAILED: {str(e)}")
        return False

def test_8_auth_me_without_token():
    """Test 8: GET /api/auth/me without token"""
    log_test("8. GET /api/auth/me - Without Token (should fail)")
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        
        if not validate_response(response, 401, "Auth me without token"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Unauthenticated' not in data.get('error', ''):
            log_error(f"Expected error message 'Unauthenticated', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Unauthenticated' ✓")
        
        log_success("Test 8 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 8 FAILED: {str(e)}")
        return False

def test_9_create_land():
    """Test 9: POST /api/lands with landowner token"""
    log_test("9. POST /api/lands - Create Land (Landowner)")
    
    try:
        payload = {
            "name": "North Field",
            "location": "Ganja",
            "area": 200,
            "soil": "loamy",
            "region": "caspian",
            "forestType": "primary",
            "vegetation": "dense"
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/lands", json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Create land"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'land' not in data:
            log_error("Missing land in response")
            return False
        
        land = data['land']
        
        # Store landId
        test_state['landId'] = land.get('id')
        log_success(f"Land ID captured: {test_state['landId']}")
        
        # Validate estimate
        if 'estimate' not in land:
            log_error("Missing estimate in land")
            return False
        
        estimate = land['estimate']
        if 'estimatedCarbonPerYear' not in estimate:
            log_error("Missing estimatedCarbonPerYear in estimate")
            return False
        
        # Math: 200 * 4.5 * 1.0 * 1.1 * 1.5 * 1.3 = 1930.5
        expected_carbon = 1930.5
        actual_carbon = estimate['estimatedCarbonPerYear']
        if abs(actual_carbon - expected_carbon) > 1:
            log_error(f"Expected estimatedCarbonPerYear ≈ {expected_carbon}, got {actual_carbon}")
            return False
        log_success(f"estimatedCarbonPerYear = {actual_carbon} ≈ {expected_carbon} ✓")
        
        # Validate initial state
        if land.get('forSale') != False:
            log_error(f"Expected forSale=false, got {land.get('forSale')}")
            return False
        log_success("forSale = false ✓")
        
        if land.get('creditsAvailable') != 0:
            log_error(f"Expected creditsAvailable=0, got {land.get('creditsAvailable')}")
            return False
        log_success("creditsAvailable = 0 ✓")
        
        log_success("Test 9 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 9 FAILED: {str(e)}")
        return False

def test_10_create_land_company():
    """Test 10: POST /api/lands with company token (should fail)"""
    log_test("10. POST /api/lands - Company Token (should fail)")
    
    try:
        payload = {
            "name": "Test Field",
            "location": "Test",
            "area": 100,
            "soil": "loamy",
            "region": "temperate",
            "forestType": "primary",
            "vegetation": "moderate"
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/lands", json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 403, "Create land company"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Only landowners' not in data.get('error', ''):
            log_error(f"Expected error message containing 'Only landowners', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Only landowners...' ✓")
        
        log_success("Test 10 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 10 FAILED: {str(e)}")
        return False

def test_11_create_land_no_token():
    """Test 11: POST /api/lands without token (should fail)"""
    log_test("11. POST /api/lands - No Token (should fail)")
    
    try:
        payload = {
            "name": "Test Field",
            "location": "Test",
            "area": 100
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/lands", json=payload, timeout=10)
        
        if not validate_response(response, 401, "Create land no token"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Unauthenticated' not in data.get('error', ''):
            log_error(f"Expected error message 'Unauthenticated', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Unauthenticated' ✓")
        
        log_success("Test 11 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 11 FAILED: {str(e)}")
        return False

def test_12_get_lands():
    """Test 12: GET /api/lands with token"""
    log_test("12. GET /api/lands - Get User's Lands")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        response = requests.get(f"{BASE_URL}/lands", headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Get lands"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'lands' not in data:
            log_error("Missing lands in response")
            return False
        
        lands = data['lands']
        if not isinstance(lands, list):
            log_error(f"Expected lands to be array, got {type(lands)}")
            return False
        
        if len(lands) < 1:
            log_error(f"Expected at least 1 land, got {len(lands)}")
            return False
        log_success(f"Found {len(lands)} land(s) ✓")
        
        # Verify our land is in the list
        found = False
        for land in lands:
            if land.get('id') == test_state['landId']:
                found = True
                log_success(f"Created land found in list ✓")
                break
        
        if not found:
            log_error("Created land not found in list")
            return False
        
        log_success("Test 12 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 12 FAILED: {str(e)}")
        return False

def test_13_add_carbon_entry():
    """Test 13: POST /api/lands/{landId}/carbon - First entry"""
    log_test("13. POST /api/lands/{landId}/carbon - Add First Carbon Entry")
    
    try:
        payload = {
            "date": "2025-06-01",
            "tCO2": 500,
            "method": "satellite",
            "note": "initial"
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/lands/{test_state['landId']}/carbon", 
                                json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Add carbon entry"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'entry' not in data or 'totalCredits' not in data:
            log_error("Missing entry or totalCredits in response")
            return False
        
        # Store entry ID
        test_state['firstEntryId'] = data['entry'].get('id')
        log_success(f"First entry ID captured: {test_state['firstEntryId']}")
        
        # Validate totalCredits
        if data['totalCredits'] != 500:
            log_error(f"Expected totalCredits=500, got {data['totalCredits']}")
            return False
        log_success("totalCredits = 500 ✓")
        
        # Verify land.creditsAvailable updated
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        land_response = requests.get(f"{BASE_URL}/lands", headers=headers, timeout=10)
        land_data = land_response.json()
        
        for land in land_data.get('lands', []):
            if land.get('id') == test_state['landId']:
                if land.get('creditsAvailable') != 500:
                    log_error(f"Expected land.creditsAvailable=500, got {land.get('creditsAvailable')}")
                    return False
                log_success("land.creditsAvailable = 500 ✓")
                break
        
        log_success("Test 13 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 13 FAILED: {str(e)}")
        return False

def test_14_add_second_carbon_entry():
    """Test 14: POST /api/lands/{landId}/carbon - Second entry"""
    log_test("14. POST /api/lands/{landId}/carbon - Add Second Carbon Entry")
    
    try:
        payload = {
            "date": "2025-07-01",
            "tCO2": 250,
            "method": "satellite",
            "note": "second measurement"
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/lands/{test_state['landId']}/carbon", 
                                json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Add second carbon entry"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        # Store entry ID
        test_state['secondEntryId'] = data['entry'].get('id')
        log_success(f"Second entry ID captured: {test_state['secondEntryId']}")
        
        # Validate totalCredits
        if data['totalCredits'] != 750:
            log_error(f"Expected totalCredits=750, got {data['totalCredits']}")
            return False
        log_success("totalCredits = 750 ✓")
        
        log_success("Test 14 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 14 FAILED: {str(e)}")
        return False

def test_15_delete_carbon_entry():
    """Test 15: DELETE /api/lands/{landId}/carbon/{entryId}"""
    log_test("15. DELETE /api/lands/{landId}/carbon/{entryId} - Delete First Entry")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        response = requests.delete(f"{BASE_URL}/lands/{test_state['landId']}/carbon/{test_state['firstEntryId']}", 
                                  headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Delete carbon entry"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        # Validate totalCredits
        if data['totalCredits'] != 250:
            log_error(f"Expected totalCredits=250, got {data['totalCredits']}")
            return False
        log_success("totalCredits = 250 ✓")
        
        # Verify land.creditsAvailable updated
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        land_response = requests.get(f"{BASE_URL}/lands", headers=headers, timeout=10)
        land_data = land_response.json()
        
        for land in land_data.get('lands', []):
            if land.get('id') == test_state['landId']:
                if land.get('creditsAvailable') != 250:
                    log_error(f"Expected land.creditsAvailable=250, got {land.get('creditsAvailable')}")
                    return False
                log_success("land.creditsAvailable = 250 ✓")
                break
        
        log_success("Test 15 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 15 FAILED: {str(e)}")
        return False

def test_16_delete_carbon_entry_wrong_user():
    """Test 16: DELETE carbon entry with company token (should fail)"""
    log_test("16. DELETE /api/lands/{landId}/carbon/{entryId} - Wrong User (should fail)")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        response = requests.delete(f"{BASE_URL}/lands/{test_state['landId']}/carbon/{test_state['secondEntryId']}", 
                                  headers=headers, timeout=10)
        
        if not validate_response(response, 403, "Delete carbon entry wrong user"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Forbidden' not in data.get('error', ''):
            log_error(f"Expected error message 'Forbidden', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Forbidden' ✓")
        
        log_success("Test 16 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 16 FAILED: {str(e)}")
        return False

def test_17_update_land_for_sale():
    """Test 17: PUT /api/lands/{landId} - Set forSale=true"""
    log_test("17. PUT /api/lands/{landId} - Set forSale=true, priceCredit=45")
    
    try:
        payload = {
            "forSale": True,
            "priceCredit": 45
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.put(f"{BASE_URL}/lands/{test_state['landId']}", 
                               json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Update land"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'land' not in data:
            log_error("Missing land in response")
            return False
        
        land = data['land']
        if land.get('forSale') != True:
            log_error(f"Expected forSale=true, got {land.get('forSale')}")
            return False
        log_success("forSale = true ✓")
        
        if land.get('priceCredit') != 45:
            log_error(f"Expected priceCredit=45, got {land.get('priceCredit')}")
            return False
        log_success("priceCredit = 45 ✓")
        
        log_success("Test 17 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 17 FAILED: {str(e)}")
        return False

def test_18_marketplace_visibility():
    """Test 18: GET /api/marketplace - Verify land visible"""
    log_test("18. GET /api/marketplace - Verify Land Visible")
    
    try:
        response = requests.get(f"{BASE_URL}/marketplace", timeout=10)
        
        if not validate_response(response, 200, "Marketplace"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'listings' not in data:
            log_error("Missing listings in response")
            return False
        
        listings = data['listings']
        
        # Find our land
        found = False
        for listing in listings:
            if listing.get('id') == test_state['landId']:
                found = True
                log_success(f"Land found in marketplace ✓")
                
                # Verify it's marked for sale
                if listing.get('forSale') != True:
                    log_error(f"Expected forSale=true, got {listing.get('forSale')}")
                    return False
                log_success("Land forSale = true ✓")
                
                if listing.get('priceCredit') != 45:
                    log_error(f"Expected priceCredit=45, got {listing.get('priceCredit')}")
                    return False
                log_success("Land priceCredit = 45 ✓")
                
                break
        
        if not found:
            log_error("Land not found in marketplace")
            return False
        
        log_success("Test 18 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 18 FAILED: {str(e)}")
        return False

def test_19_purchase_credits():
    """Test 19: POST /api/purchase - Company purchases 100 credits"""
    log_test("19. POST /api/purchase - Company Purchases 100 Credits")
    
    try:
        payload = {
            "landId": test_state['landId'],
            "quantity": 100
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/purchase", json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Purchase credits"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'purchase' not in data:
            log_error("Missing purchase in response")
            return False
        
        purchase = data['purchase']
        if purchase.get('quantity') != 100:
            log_error(f"Expected quantity=100, got {purchase.get('quantity')}")
            return False
        log_success("quantity = 100 ✓")
        
        # Verify land updated
        headers_a = {"Authorization": f"Bearer {test_state['token_A']}"}
        land_response = requests.get(f"{BASE_URL}/lands", headers=headers_a, timeout=10)
        land_data = land_response.json()
        
        for land in land_data.get('lands', []):
            if land.get('id') == test_state['landId']:
                if land.get('creditsSold') != 100:
                    log_error(f"Expected land.creditsSold=100, got {land.get('creditsSold')}")
                    return False
                log_success("land.creditsSold = 100 ✓")
                
                if land.get('creditsAvailable') != 150:
                    log_error(f"Expected land.creditsAvailable=150, got {land.get('creditsAvailable')}")
                    return False
                log_success("land.creditsAvailable = 150 ✓")
                break
        
        log_success("Test 19 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 19 FAILED: {str(e)}")
        return False

def test_20_purchase_insufficient_credits():
    """Test 20: POST /api/purchase - Insufficient credits (should fail)"""
    log_test("20. POST /api/purchase - Insufficient Credits (should fail)")
    
    try:
        payload = {
            "landId": test_state['landId'],
            "quantity": 9999
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/purchase", json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 400, "Purchase insufficient credits"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Not enough credits available' not in data.get('error', ''):
            log_error(f"Expected error message 'Not enough credits available', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Not enough credits available' ✓")
        
        log_success("Test 20 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 20 FAILED: {str(e)}")
        return False

def test_21_purchase_as_landowner():
    """Test 21: POST /api/purchase - Landowner tries to purchase (should fail)"""
    log_test("21. POST /api/purchase - Landowner Token (should fail)")
    
    try:
        payload = {
            "landId": test_state['landId'],
            "quantity": 10
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/purchase", json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 403, "Purchase as landowner"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Only companies' not in data.get('error', ''):
            log_error(f"Expected error message containing 'Only companies', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Only companies...' ✓")
        
        log_success("Test 21 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 21 FAILED: {str(e)}")
        return False

def test_22_purchase_no_token():
    """Test 22: POST /api/purchase - No token (should fail)"""
    log_test("22. POST /api/purchase - No Token (should fail)")
    
    try:
        payload = {
            "landId": test_state['landId'],
            "quantity": 10
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/purchase", json=payload, timeout=10)
        
        if not validate_response(response, 401, "Purchase no token"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Unauthenticated' not in data.get('error', ''):
            log_error(f"Expected error message 'Unauthenticated', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Unauthenticated' ✓")
        
        log_success("Test 22 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 22 FAILED: {str(e)}")
        return False

def test_23_get_purchases_company():
    """Test 23: GET /api/purchases - Company view"""
    log_test("23. GET /api/purchases - Company View")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        response = requests.get(f"{BASE_URL}/purchases", headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Get purchases company"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'purchases' not in data:
            log_error("Missing purchases in response")
            return False
        
        purchases = data['purchases']
        if not isinstance(purchases, list):
            log_error(f"Expected purchases to be array, got {type(purchases)}")
            return False
        
        if len(purchases) != 1:
            log_error(f"Expected 1 purchase, got {len(purchases)}")
            return False
        log_success("Found 1 purchase ✓")
        
        log_success("Test 23 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 23 FAILED: {str(e)}")
        return False

def test_24_get_purchases_landowner():
    """Test 24: GET /api/purchases - Landowner view"""
    log_test("24. GET /api/purchases - Landowner View")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        response = requests.get(f"{BASE_URL}/purchases", headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Get purchases landowner"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        if 'purchases' not in data:
            log_error("Missing purchases in response")
            return False
        
        purchases = data['purchases']
        if not isinstance(purchases, list):
            log_error(f"Expected purchases to be array, got {type(purchases)}")
            return False
        
        if len(purchases) != 1:
            log_error(f"Expected 1 purchase, got {len(purchases)}")
            return False
        log_success("Found 1 purchase (as owner) ✓")
        
        log_success("Test 24 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 24 FAILED: {str(e)}")
        return False

def test_25_update_land_wrong_user():
    """Test 25: PUT /api/lands/{landId} - Company token (should fail)"""
    log_test("25. PUT /api/lands/{landId} - Wrong User (should fail)")
    
    try:
        payload = {
            "name": "Hacked Field"
        }
        
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.put(f"{BASE_URL}/lands/{test_state['landId']}", 
                               json=payload, headers=headers, timeout=10)
        
        if not validate_response(response, 403, "Update land wrong user"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Forbidden' not in data.get('error', ''):
            log_error(f"Expected error message 'Forbidden', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Forbidden' ✓")
        
        log_success("Test 25 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 25 FAILED: {str(e)}")
        return False

def test_26_delete_land_wrong_user():
    """Test 26: DELETE /api/lands/{landId} - Company token (should fail)"""
    log_test("26. DELETE /api/lands/{landId} - Wrong User (should fail)")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_B']}"}
        
        response = requests.delete(f"{BASE_URL}/lands/{test_state['landId']}", 
                                  headers=headers, timeout=10)
        
        if not validate_response(response, 403, "Delete land wrong user"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Forbidden' not in data.get('error', ''):
            log_error(f"Expected error message 'Forbidden', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Forbidden' ✓")
        
        log_success("Test 26 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 26 FAILED: {str(e)}")
        return False

def test_27_delete_land():
    """Test 27: DELETE /api/lands/{landId} - Landowner token"""
    log_test("27. DELETE /api/lands/{landId} - Landowner Token")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        response = requests.delete(f"{BASE_URL}/lands/{test_state['landId']}", 
                                  headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Delete land"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        # Verify land is gone from marketplace
        marketplace_response = requests.get(f"{BASE_URL}/marketplace", timeout=10)
        marketplace_data = marketplace_response.json()
        
        for listing in marketplace_data.get('listings', []):
            if listing.get('id') == test_state['landId']:
                log_error("Land still visible in marketplace after deletion")
                return False
        log_success("Land removed from marketplace ✓")
        
        log_success("Test 27 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 27 FAILED: {str(e)}")
        return False

def test_28_logout():
    """Test 28: POST /api/auth/logout"""
    log_test("28. POST /api/auth/logout - Logout")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        response = requests.post(f"{BASE_URL}/auth/logout", headers=headers, timeout=10)
        
        if not validate_response(response, 200, "Logout"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        log_success("Test 28 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 28 FAILED: {str(e)}")
        return False

def test_29_auth_me_after_logout():
    """Test 29: GET /api/auth/me after logout (should fail)"""
    log_test("29. GET /api/auth/me - After Logout (should fail)")
    
    try:
        headers = {"Authorization": f"Bearer {test_state['token_A']}"}
        
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        
        if not validate_response(response, 401, "Auth me after logout"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            log_error(f"Expected ok=false, got {data.get('ok')}")
            return False
        
        if 'Unauthenticated' not in data.get('error', ''):
            log_error(f"Expected error message 'Unauthenticated', got {data.get('error')}")
            return False
        log_success("Error message correct: 'Unauthenticated' ✓")
        
        log_success("Test 29 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 29 FAILED: {str(e)}")
        return False

def test_30_calculator_regression():
    """Test 30: POST /api/calculator - Regression test"""
    log_test("30. POST /api/calculator - Regression Test")
    
    try:
        payload = {
            "area": 1000,
            "soil": "loamy",
            "region": "tropical",
            "forestType": "primary",
            "vegetation": "dense"
        }
        
        log_info(f"Request: {json.dumps(payload, indent=2)}")
        response = requests.post(f"{BASE_URL}/calculator", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Calculator regression"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok'):
            log_error(f"Expected ok=true, got {data.get('ok')}")
            return False
        
        # Validate math: 1000 * 4.5 * 1.0 * 1.4 * 1.5 * 1.3 = 12285
        expected_carbon = 12285
        actual_carbon = data.get('estimatedCarbonPerYear')
        if abs(actual_carbon - expected_carbon) > 1:
            log_error(f"Expected estimatedCarbonPerYear={expected_carbon}, got {actual_carbon}")
            return False
        log_success(f"estimatedCarbonPerYear = {actual_carbon} (unchanged) ✓")
        
        log_success("Test 30 PASSED")
        return True
        
    except Exception as e:
        log_error(f"Test 30 FAILED: {str(e)}")
        return False

def main():
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}SoilCredit Backend API Test Suite - Phase 2{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    results = {}
    
    # Run all 30 tests in sequence
    results['1_signup_landowner'] = test_1_signup_landowner()
    results['2_signup_company'] = test_2_signup_company()
    results['3_signup_duplicate'] = test_3_signup_duplicate()
    results['4_signup_short_password'] = test_4_signup_short_password()
    results['5_login_correct'] = test_5_login_correct()
    results['6_login_wrong_password'] = test_6_login_wrong_password()
    results['7_auth_me_with_token'] = test_7_auth_me_with_token()
    results['8_auth_me_without_token'] = test_8_auth_me_without_token()
    results['9_create_land'] = test_9_create_land()
    results['10_create_land_company'] = test_10_create_land_company()
    results['11_create_land_no_token'] = test_11_create_land_no_token()
    results['12_get_lands'] = test_12_get_lands()
    results['13_add_carbon_entry'] = test_13_add_carbon_entry()
    results['14_add_second_carbon_entry'] = test_14_add_second_carbon_entry()
    results['15_delete_carbon_entry'] = test_15_delete_carbon_entry()
    results['16_delete_carbon_entry_wrong_user'] = test_16_delete_carbon_entry_wrong_user()
    results['17_update_land_for_sale'] = test_17_update_land_for_sale()
    results['18_marketplace_visibility'] = test_18_marketplace_visibility()
    results['19_purchase_credits'] = test_19_purchase_credits()
    results['20_purchase_insufficient_credits'] = test_20_purchase_insufficient_credits()
    results['21_purchase_as_landowner'] = test_21_purchase_as_landowner()
    results['22_purchase_no_token'] = test_22_purchase_no_token()
    results['23_get_purchases_company'] = test_23_get_purchases_company()
    results['24_get_purchases_landowner'] = test_24_get_purchases_landowner()
    results['25_update_land_wrong_user'] = test_25_update_land_wrong_user()
    results['26_delete_land_wrong_user'] = test_26_delete_land_wrong_user()
    results['27_delete_land'] = test_27_delete_land()
    results['28_logout'] = test_28_logout()
    results['29_auth_me_after_logout'] = test_29_auth_me_after_logout()
    results['30_calculator_regression'] = test_30_calculator_regression()
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}TEST SUMMARY{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if result else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test_name}: {status}")
    
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    if passed == total:
        print(f"{Colors.GREEN}ALL TESTS PASSED: {passed}/{total}{Colors.END}")
        print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
        return 0
    else:
        print(f"{Colors.RED}SOME TESTS FAILED: {passed}/{total} passed{Colors.END}")
        print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
