import requests
import sys
from datetime import datetime

class DrivingSchoolAPITester:
    def __init__(self, base_url="https://a41cb229-ff9d-4f20-8f5d-abd767f07eff.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_user_email = f"test_user_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"
        self.school_id = None
        self.enrollment_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_register_student(self):
        """Test student registration"""
        success, response = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            201,
            data={
                "firstName": "Test",
                "lastName": "User",
                "email": self.test_user_email,
                "password": self.test_password,
                "phoneNumber": "1234567890",
                "address": "123 Test St",
                "role": "student",
                "region": "Alger",
                "gender": "male"
            }
        )
        if success and 'token' in response:
            self.token = response['token']
        return success

    def test_register_driving_school(self):
        """Test driving school registration"""
        school_manager_email = f"school_manager_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "Driving School Registration",
            "POST",
            "auth/register",
            201,
            data={
                "firstName": "School",
                "lastName": "Manager",
                "email": school_manager_email,
                "password": self.test_password,
                "phoneNumber": "1234567890",
                "address": "123 School St",
                "role": "manager",
                "region": "Alger",
                "gender": "male"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            
            # Now create the driving school
            school_success, school_response = self.run_test(
                "Create Driving School",
                "POST",
                "driving-schools",
                201,
                data={
                    "name": f"Test Driving School {datetime.now().strftime('%H%M%S')}",
                    "address": "123 School St",
                    "region": "Alger",
                    "phoneNumber": "1234567890",
                    "email": f"school_{datetime.now().strftime('%H%M%S')}@example.com",
                    "description": "A test driving school for API testing",
                    "licenseNumber": "TEST123",
                    "hasMaleInstructors": True,
                    "hasFemaleInstructors": True,
                    "priceCode": "5000",
                    "priceParking": "8000",
                    "priceRoad": "12000"
                }
            )
            
            if school_success and 'id' in school_response:
                self.school_id = school_response['id']
                print(f"Created driving school with ID: {self.school_id}")
                
            return school_success
        return success

    def test_login(self):
        """Test login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.test_user_email,
                "password": self.test_password
            }
        )
        if success and 'token' in response:
            self.token = response['token']
        return success

    def test_get_user_profile(self):
        """Test getting user profile"""
        if not self.token:
            print("⚠️ Skipping user profile test - no token available")
            return False
        
        return self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )[0]

    def test_get_all_schools(self):
        """Test getting all schools"""
        success, response = self.run_test(
            "Get All Driving Schools",
            "GET",
            "driving-schools",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            self.school_id = response[0]['id']
            print(f"Found school ID: {self.school_id}")
            return True
        
        return success

    def test_get_school_by_id(self):
        """Test getting a school by ID"""
        if not self.school_id:
            print("⚠️ Skipping school detail test - no school ID available")
            return False
        
        return self.run_test(
            "Get Driving School by ID",
            "GET",
            f"driving-schools/{self.school_id}",
            200
        )[0]

    def test_create_enrollment(self):
        """Test creating an enrollment"""
        if not self.token or not self.school_id:
            print("⚠️ Skipping enrollment test - missing required IDs")
            return False
        
        success, response = self.run_test(
            "Create Enrollment",
            "POST",
            "enrollments",
            201,
            data={
                "drivingSchoolId": self.school_id,
                "instructorId": "",  # Optional
                "includeCode": True,
                "includeParking": True,
                "includeRoad": True
            }
        )
        
        if success and response and 'enrollment' in response and 'id' in response['enrollment']:
            self.enrollment_id = response['enrollment']['id']
            print(f"Created enrollment with ID: {self.enrollment_id}")
            return True
            
        return success

    def test_get_student_enrollments(self):
        """Test getting student enrollments"""
        if not self.token:
            print("⚠️ Skipping student enrollments test - no token available")
            return False
        
        return self.run_test(
            "Get Student Enrollments",
            "GET",
            "enrollments/student",
            200
        )[0]

    def test_process_payment(self):
        """Test processing a payment"""
        if not self.token or not self.enrollment_id:
            print("⚠️ Skipping payment test - missing required IDs")
            return False
        
        return self.run_test(
            "Process Algerian Payment",
            "POST",
            "payments/algerian",
            201,
            data={
                "enrollmentId": self.enrollment_id,
                "amount": "25000",
                "cardType": "CIB",
                "cardNumber": "1234567890123456",
                "cardHolderName": "Test User",
                "expiryDate": "12/25",
                "cvv": "123"
            }
        )[0]

    def test_get_student_payments(self):
        """Test getting student payments"""
        if not self.token:
            print("⚠️ Skipping student payments test - no token available")
            return False
        
        return self.run_test(
            "Get Student Payments",
            "GET",
            "payments/student",
            200
        )[0]

def main():
    # Setup
    tester = DrivingSchoolAPITester()
    
    # Test user authentication
    print("\n===== Testing Student Registration and Login =====")
    register_success = tester.test_register_student()
    if not register_success:
        print("⚠️ Registration failed, trying login with existing user...")
    
    login_success = tester.test_login()
    if not login_success:
        print("❌ Login failed, continuing with limited tests")
    else:
        tester.test_get_user_profile()
    
    # Test driving school registration (with a new user)
    print("\n===== Testing Driving School Registration =====")
    tester.test_register_driving_school()
    
    # Test school-related endpoints
    print("\n===== Testing Driving School Endpoints =====")
    tester.test_get_all_schools()
    tester.test_get_school_by_id()
    
    # Test enrollment and payment (requires login as student)
    if login_success:
        print("\n===== Testing Enrollment Process =====")
        tester.test_login()  # Login again as student
        enrollment_success = tester.test_create_enrollment()
        if enrollment_success:
            tester.test_process_payment()
        
        print("\n===== Testing Dashboard Data =====")
        tester.test_get_student_enrollments()
        tester.test_get_student_payments()

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())