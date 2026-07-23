#!/usr/bin/env python3
"""
SoilCredit Backend API Test Suite
Tests all endpoints in app/api/[[...path]]/route.js
"""

import requests
import json
import sys
from typing import Dict, Any

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

def test_health_endpoint():
    """Test 1: GET /api/health"""
    log_test("GET /api/health - Health Check Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        
        if not validate_response(response, 200, "Health endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        required_keys = ['ok', 'service', 'ts']
        for key in required_keys:
            if key not in data:
                log_error(f"Missing key: {key}")
                return False
            log_success(f"Key '{key}' present")
        
        # Validate values
        if data['ok'] != True:
            log_error(f"Expected ok=true, got {data['ok']}")
            return False
        log_success("ok = true ✓")
        
        if data['service'] != 'soilcredit':
            log_error(f"Expected service='soilcredit', got {data['service']}")
            return False
        log_success("service = 'soilcredit' ✓")
        
        if not isinstance(data['ts'], (int, float)):
            log_error(f"Expected ts to be a number, got {type(data['ts'])}")
            return False
        log_success(f"ts = {data['ts']} (number) ✓")
        
        log_success("Health endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Health endpoint test FAILED: {str(e)}")
        return False

def test_root_endpoint():
    """Test 2: GET /api (empty path)"""
    log_test("GET /api - Root Endpoint (Empty Path)")
    
    try:
        response = requests.get(BASE_URL, timeout=10)
        
        if not validate_response(response, 200, "Root endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Should have same structure as health
        required_keys = ['ok', 'service', 'ts']
        for key in required_keys:
            if key not in data:
                log_error(f"Missing key: {key}")
                return False
        
        if data['ok'] != True or data['service'] != 'soilcredit':
            log_error(f"Expected same structure as health endpoint")
            return False
        
        log_success("Root endpoint returns same structure as health ✓")
        log_success("Root endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Root endpoint test FAILED: {str(e)}")
        return False

def test_stats_endpoint_initial():
    """Test 3: GET /api/stats - Initial stats"""
    log_test("GET /api/stats - Stats Endpoint (Initial)")
    
    try:
        response = requests.get(f"{BASE_URL}/stats", timeout=10)
        
        if not validate_response(response, 200, "Stats endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        required_keys = ['treesProtected', 'carbonCapturedT', 'registeredLands', 
                        'activeInvestors', 'countries', 'creditPrice']
        for key in required_keys:
            if key not in data:
                log_error(f"Missing key: {key}")
                return False
            log_success(f"Key '{key}' present")
        
        # Validate all are numbers
        for key in required_keys:
            if not isinstance(data[key], (int, float)):
                log_error(f"Expected {key} to be a number, got {type(data[key])}")
                return False
            log_success(f"{key} = {data[key]} (number) ✓")
        
        # Validate creditPrice
        if data['creditPrice'] != 42.8:
            log_error(f"Expected creditPrice=42.8, got {data['creditPrice']}")
            return False
        log_success("creditPrice = 42.8 ✓")
        
        log_success("Stats endpoint test PASSED")
        return data  # Return data for later comparison
        
    except Exception as e:
        log_error(f"Stats endpoint test FAILED: {str(e)}")
        return False

def test_marketplace_endpoint():
    """Test 4: GET /api/marketplace"""
    log_test("GET /api/marketplace - Marketplace Listings")
    
    try:
        response = requests.get(f"{BASE_URL}/marketplace", timeout=10)
        
        if not validate_response(response, 200, "Marketplace endpoint"):
            return False
        
        data = response.json()
        
        # Validate structure
        if 'listings' not in data:
            log_error("Missing 'listings' key")
            return False
        log_success("Key 'listings' present")
        
        listings = data['listings']
        if not isinstance(listings, list):
            log_error(f"Expected listings to be an array, got {type(listings)}")
            return False
        log_success(f"listings is an array ✓")
        
        # Validate count
        if len(listings) != 6:
            log_error(f"Expected 6 listings, got {len(listings)}")
            return False
        log_success(f"listings.length = 6 ✓")
        
        # Validate each listing has required fields
        required_fields = ['id', 'title', 'owner', 'location', 'area', 'price', 
                          'esg', 'credits', 'status', 'category', 'tag', 'flag']
        
        for i, listing in enumerate(listings):
            log_info(f"Validating listing {i+1}: {listing.get('title', 'N/A')}")
            for field in required_fields:
                if field not in listing:
                    log_error(f"Listing {i+1} missing field: {field}")
                    return False
            log_success(f"Listing {i+1} has all required fields ✓")
        
        log_success("Marketplace endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Marketplace endpoint test FAILED: {str(e)}")
        return False

def test_calculator_valid_input():
    """Test 5: POST /api/calculator with valid input"""
    log_test("POST /api/calculator - Valid Input")
    
    try:
        payload = {
            "area": 1000,
            "soil": "loamy",
            "region": "tropical",
            "forestType": "primary",
            "vegetation": "dense"
        }
        
        log_info(f"Request payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/calculator", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Calculator endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        required_keys = ['ok', 'id', 'estimatedCarbonPerYear', 'tenYearCarbon', 
                        'creditsPerYear', 'annualIncomeUSD', 'tenYearIncomeUSD', 
                        'creditPrice', 'projection']
        
        for key in required_keys:
            if key not in data:
                log_error(f"Missing key: {key}")
                return False
            log_success(f"Key '{key}' present")
        
        # Validate ok
        if data['ok'] != True:
            log_error(f"Expected ok=true, got {data['ok']}")
            return False
        log_success("ok = true ✓")
        
        # Validate id is uuid string
        if not isinstance(data['id'], str) or len(data['id']) < 32:
            log_error(f"Expected id to be a UUID string, got {data['id']}")
            return False
        log_success(f"id = {data['id']} (UUID) ✓")
        
        # Validate math: 1000 * 4.5 * 1.0 * 1.4 * 1.5 * 1.3 = 12285
        expected_carbon = 12285
        if abs(data['estimatedCarbonPerYear'] - expected_carbon) > 1:
            log_error(f"Expected estimatedCarbonPerYear ≈ {expected_carbon}, got {data['estimatedCarbonPerYear']}")
            return False
        log_success(f"estimatedCarbonPerYear = {data['estimatedCarbonPerYear']} ≈ {expected_carbon} ✓")
        
        # Validate creditPrice
        if data['creditPrice'] != 42.8:
            log_error(f"Expected creditPrice=42.8, got {data['creditPrice']}")
            return False
        log_success("creditPrice = 42.8 ✓")
        
        # Validate projection array
        if not isinstance(data['projection'], list):
            log_error(f"Expected projection to be an array, got {type(data['projection'])}")
            return False
        
        if len(data['projection']) != 10:
            log_error(f"Expected projection to have 10 items, got {len(data['projection'])}")
            return False
        log_success(f"projection has 10 items ✓")
        
        # Validate projection items
        for i, item in enumerate(data['projection']):
            required_proj_keys = ['year', 'carbon', 'credits', 'income']
            for key in required_proj_keys:
                if key not in item:
                    log_error(f"Projection item {i+1} missing key: {key}")
                    return False
        log_success("All projection items have required keys ✓")
        
        log_success("Calculator (valid input) test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Calculator (valid input) test FAILED: {str(e)}")
        return False

def test_calculator_empty_body():
    """Test 6: POST /api/calculator with empty body"""
    log_test("POST /api/calculator - Empty Body")
    
    try:
        payload = {}
        
        log_info(f"Request payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/calculator", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Calculator endpoint (empty body)"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Should not crash, should return 0 for estimatedCarbonPerYear
        if 'estimatedCarbonPerYear' not in data:
            log_error("Missing estimatedCarbonPerYear")
            return False
        
        if data['estimatedCarbonPerYear'] != 0:
            log_error(f"Expected estimatedCarbonPerYear=0 for empty body, got {data['estimatedCarbonPerYear']}")
            return False
        log_success("estimatedCarbonPerYear = 0 (as expected for empty input) ✓")
        
        log_success("Calculator (empty body) test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Calculator (empty body) test FAILED: {str(e)}")
        return False

def test_contact_endpoint():
    """Test 7: POST /api/contact"""
    log_test("POST /api/contact - Contact Form Submission")
    
    try:
        payload = {
            "name": "Ada Lovelace",
            "email": "ada@planet.earth",
            "company": "Analytics Engine",
            "message": "Interested in ESG marketplace"
        }
        
        log_info(f"Request payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/contact", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Contact endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        if 'ok' not in data or 'id' not in data:
            log_error("Missing 'ok' or 'id' key")
            return False
        
        if data['ok'] != True:
            log_error(f"Expected ok=true, got {data['ok']}")
            return False
        log_success("ok = true ✓")
        
        if not isinstance(data['id'], str) or len(data['id']) < 32:
            log_error(f"Expected id to be a UUID string, got {data['id']}")
            return False
        log_success(f"id = {data['id']} (UUID) ✓")
        
        log_success("Contact endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Contact endpoint test FAILED: {str(e)}")
        return False

def test_land_endpoint():
    """Test 8: POST /api/land"""
    log_test("POST /api/land - Land Registration")
    
    try:
        payload = {
            "name": "Test Plot",
            "area": 120,
            "region": "tropical"
        }
        
        log_info(f"Request payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/land", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Land endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        if 'ok' not in data or 'id' not in data:
            log_error("Missing 'ok' or 'id' key")
            return False
        
        if data['ok'] != True:
            log_error(f"Expected ok=true, got {data['ok']}")
            return False
        log_success("ok = true ✓")
        
        if not isinstance(data['id'], str) or len(data['id']) < 32:
            log_error(f"Expected id to be a UUID string, got {data['id']}")
            return False
        log_success(f"id = {data['id']} (UUID) ✓")
        
        log_success("Land endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Land endpoint test FAILED: {str(e)}")
        return False

def test_newsletter_endpoint():
    """Test 9: POST /api/newsletter"""
    log_test("POST /api/newsletter - Newsletter Subscription")
    
    try:
        payload = {
            "email": "test@example.com"
        }
        
        log_info(f"Request payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{BASE_URL}/newsletter", json=payload, timeout=10)
        
        if not validate_response(response, 200, "Newsletter endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        if 'ok' not in data or 'id' not in data:
            log_error("Missing 'ok' or 'id' key")
            return False
        
        if data['ok'] != True:
            log_error(f"Expected ok=true, got {data['ok']}")
            return False
        log_success("ok = true ✓")
        
        if not isinstance(data['id'], str) or len(data['id']) < 32:
            log_error(f"Expected id to be a UUID string, got {data['id']}")
            return False
        log_success(f"id = {data['id']} (UUID) ✓")
        
        log_success("Newsletter endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Newsletter endpoint test FAILED: {str(e)}")
        return False

def test_stats_endpoint_after_posts(initial_stats):
    """Test 10: GET /api/stats - After POSTs to verify persistence"""
    log_test("GET /api/stats - After POSTs (Verify Persistence)")
    
    try:
        response = requests.get(f"{BASE_URL}/stats", timeout=10)
        
        if not validate_response(response, 200, "Stats endpoint (after POSTs)"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        if not initial_stats:
            log_error("No initial stats to compare with")
            return False
        
        log_info(f"Initial stats: {json.dumps(initial_stats, indent=2)}")
        
        # We added 1 land and 2 calculations (valid + empty)
        # Expected changes:
        # - registeredLands: +1
        # - treesProtected: +47 (1 land * 47)
        # - carbonCapturedT: +24 (2 calcs * 12)
        
        expected_lands = initial_stats['registeredLands'] + 1
        expected_trees = initial_stats['treesProtected'] + 47
        expected_carbon = initial_stats['carbonCapturedT'] + 24
        
        if data['registeredLands'] != expected_lands:
            log_error(f"Expected registeredLands={expected_lands}, got {data['registeredLands']}")
            return False
        log_success(f"registeredLands increased by 1: {initial_stats['registeredLands']} → {data['registeredLands']} ✓")
        
        if data['treesProtected'] != expected_trees:
            log_error(f"Expected treesProtected={expected_trees}, got {data['treesProtected']}")
            return False
        log_success(f"treesProtected increased by 47: {initial_stats['treesProtected']} → {data['treesProtected']} ✓")
        
        if data['carbonCapturedT'] != expected_carbon:
            log_error(f"Expected carbonCapturedT={expected_carbon}, got {data['carbonCapturedT']}")
            return False
        log_success(f"carbonCapturedT increased by 24: {initial_stats['carbonCapturedT']} → {data['carbonCapturedT']} ✓")
        
        log_success("Stats persistence test PASSED")
        return True
        
    except Exception as e:
        log_error(f"Stats persistence test FAILED: {str(e)}")
        return False

def test_404_endpoint():
    """Test 11: GET /api/some/unknown/route - 404 test"""
    log_test("GET /api/some/unknown/route - 404 Test")
    
    try:
        response = requests.get(f"{BASE_URL}/some/unknown/route", timeout=10)
        
        if not validate_response(response, 404, "404 endpoint"):
            return False
        
        data = response.json()
        log_info(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        if 'ok' not in data or 'error' not in data:
            log_error("Missing 'ok' or 'error' key")
            return False
        
        if data['ok'] != False:
            log_error(f"Expected ok=false, got {data['ok']}")
            return False
        log_success("ok = false ✓")
        
        if data['error'] != 'Not found':
            log_error(f"Expected error='Not found', got {data['error']}")
            return False
        log_success("error = 'Not found' ✓")
        
        log_success("404 endpoint test PASSED")
        return True
        
    except Exception as e:
        log_error(f"404 endpoint test FAILED: {str(e)}")
        return False

def main():
    print(f"\n{Colors.BLUE}{'='*80}{Colors.END}")
    print(f"{Colors.BLUE}SoilCredit Backend API Test Suite{Colors.END}")
    print(f"{Colors.BLUE}Base URL: {BASE_URL}{Colors.END}")
    print(f"{Colors.BLUE}{'='*80}{Colors.END}\n")
    
    results = {}
    
    # Test 1: Health endpoint
    results['health'] = test_health_endpoint()
    
    # Test 2: Root endpoint
    results['root'] = test_root_endpoint()
    
    # Test 3: Stats endpoint (initial)
    initial_stats = test_stats_endpoint_initial()
    results['stats_initial'] = bool(initial_stats)
    
    # Test 4: Marketplace endpoint
    results['marketplace'] = test_marketplace_endpoint()
    
    # Test 5: Calculator with valid input
    results['calculator_valid'] = test_calculator_valid_input()
    
    # Test 6: Calculator with empty body
    results['calculator_empty'] = test_calculator_empty_body()
    
    # Test 7: Contact endpoint
    results['contact'] = test_contact_endpoint()
    
    # Test 8: Land endpoint
    results['land'] = test_land_endpoint()
    
    # Test 9: Newsletter endpoint
    results['newsletter'] = test_newsletter_endpoint()
    
    # Test 10: Stats endpoint (after POSTs)
    results['stats_persistence'] = test_stats_endpoint_after_posts(initial_stats)
    
    # Test 11: 404 endpoint
    results['404'] = test_404_endpoint()
    
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
