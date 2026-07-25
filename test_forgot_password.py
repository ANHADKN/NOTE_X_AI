import unittest
import json
import random
from app import create_app
from app.models.mongo import mongo_manager

class ForgotPasswordTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.test_email = f"test_student_{random.randint(1000, 9999)}@notex.ai"
        self.test_password = "Password123"

        # Register a test student account
        reg_res = self.client.post('/api/auth/register', json={
            "name": "Test Student",
            "email": self.test_email,
            "password": self.test_password,
            "student_class": "Class 10"
        })
        self.assertEqual(reg_res.status_code, 201)

    def test_forgot_password_and_reset_flow(self):
        # 1. Request Password Reset OTP
        res = self.client.post('/api/auth/forgot-password', json={"email": self.test_email})
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        otp_code = data['data']['otp_preview']
        self.assertEqual(len(otp_code), 6)

        # 2. Verify Invalid OTP
        bad_verify = self.client.post('/api/auth/verify-otp', json={
            "email": self.test_email,
            "otp_code": "000000",
            "purpose": "forgot_password"
        })
        self.assertEqual(bad_verify.status_code, 400)

        # 3. Verify Valid OTP
        verify_res = self.client.post('/api/auth/verify-otp', json={
            "email": self.test_email,
            "otp_code": otp_code,
            "purpose": "forgot_password"
        })
        self.assertEqual(verify_res.status_code, 200)

        # 4. Reset Password
        new_password = "NewSecurePassword456"
        reset_res = self.client.post('/api/auth/reset-password', json={
            "email": self.test_email,
            "otp_code": otp_code,
            "new_password": new_password
        })
        self.assertEqual(reset_res.status_code, 200)

        # 5. Verify Old Password Login Fails
        old_login = self.client.post('/api/auth/login', json={
            "email": self.test_email,
            "password": self.test_password
        })
        self.assertEqual(old_login.status_code, 401)

        # 6. Verify New Password Login Succeeds
        new_login = self.client.post('/api/auth/login', json={
            "email": self.test_email,
            "password": new_password
        })
        self.assertEqual(new_login.status_code, 200)

if __name__ == '__main__':
    unittest.main()
