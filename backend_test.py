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
        self.course_id = None

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

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )[0]

    def test_status_endpoint(self):
        """Test the status endpoint"""
        return self.run_test(
            "Status Endpoint",
            "POST",
            "status",
            200,
            data={"client_name": "API Tester"}
        )[0]

    def test_get_status_checks(self):
        """Test getting status checks"""
        return self.run_test(
            "Get Status Checks",
            "GET",
            "status",
            200
        )[0]

    def test_register_user(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "users/register",
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

    def test_login(self):
        """Test login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "users/login",
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
            "users/me",
            200
        )[0]

    def test_get_all_schools(self):
        """Test getting all schools"""
        success, response = self.run_test(
            "Get All Schools",
            "GET",
            "driving-schools",
            200
        )
        
        if success and len(response) > 0:
            self.school_id = response[0]['id']
            print(f"Found school ID: {self.school_id}")
        
        return success[0] if isinstance(success, tuple) else success

    def test_get_schools_by_region(self):
        """Test getting schools by region"""
        return self.run_test(
            "Get Schools by Region",
            "GET",
            "driving-schools/region/Alger",
            200
        )[0]

    def test_get_school_by_id(self):
        """Test getting a school by ID"""
        if not self.school_id:
            print("⚠️ Skipping school detail test - no school ID available")
            return False
        
        return self.run_test(
            "Get School by ID",
            "GET",
            f"driving-schools/{self.school_id}",
            200
        )[0]

    def test_register_school(self):
        """Test school registration"""
        success, response = self.run_test(
            "School Registration",
            "POST",
            "driving-schools/register",
            201,
            data={
                "name": f"Test Driving School {datetime.now().strftime('%H%M%S')}",
                "address": "123 Test St",
                "region": "Alger",
                "phoneNumber": "1234567890",
                "email": f"school_{datetime.now().strftime('%H%M%S')}@example.com",
                "description": "A test driving school",
                "licenseNumber": "TEST123",
                "hasMaleInstructors": True,
                "hasFemaleInstructors": True
            }
        )
        
        if success and 'id' in response:
            self.school_id = response['id']
        
        return success[0] if isinstance(success, tuple) else success

    def test_get_courses(self):
        """Test getting courses for a school"""
        if not self.school_id:
            print("⚠️ Skipping courses test - no school ID available")
            return False
        
        success, response = self.run_test(
            "Get Courses for School",
            "GET",
            f"courses/school/{self.school_id}",
            200
        )
        
        if success and len(response) > 0:
            self.course_id = response[0]['id']
            print(f"Found course ID: {self.course_id}")
        
        return success[0] if isinstance(success, tuple) else success

    def test_get_instructors(self):
        """Test getting instructors for a school"""
        if not self.school_id:
            print("⚠️ Skipping instructors test - no school ID available")
            return False
        
        return self.run_test(
            "Get Instructors for School",
            "GET",
            f"instructors/school/{self.school_id}",
            200
        )[0]

    def test_create_enrollment(self):
        """Test creating an enrollment"""
        if not self.token or not self.school_id or not self.course_id:
            print("⚠️ Skipping enrollment test - missing required IDs")
            return False
        
        return self.run_test(
            "Create Enrollment",
            "POST",
            "enrollments",
            201,
            data={
                "courseId": self.course_id,
                "drivingSchoolId": self.school_id
            }
        )[0]

def main():
    # Setup
    tester = DrivingSchoolAPITester()
    
    # Test basic API endpoints
    tester.test_root_endpoint()
    tester.test_status_endpoint()
    tester.test_get_status_checks()
    
    # Test user authentication
    register_success = tester.test_register_user()
    if not register_success:
        print("⚠️ Registration failed, trying login with existing user...")
    
    login_success = tester.test_login()
    if not login_success:
        print("❌ Login failed, continuing with limited tests")
    else:
        tester.test_get_user_profile()
    
    # Test school-related endpoints
    tester.test_get_all_schools()
    tester.test_get_schools_by_region()
    tester.test_get_school_by_id()
    
    if login_success:
        tester.test_register_school()
    
    # Test courses and instructors
    tester.test_get_courses()
    tester.test_get_instructors()
    
    # Test enrollment (requires login)
    if login_success and tester.course_id:
        tester.test_create_enrollment()

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())