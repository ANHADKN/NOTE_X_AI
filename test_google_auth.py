import unittest
import json
from unittest.mock import patch
from app import create_app
from app.models.mongo import mongo_manager

class GoogleAuthTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        
        # Test Payload
        self.google_email = "test.google.user@notex.ai"
        self.google_name = "Google User"
        self.google_sub = "12345678901234567890"
        self.google_picture = "https://lh3.googleusercontent.com/a/mock_picture"
        
        # Mock Google Token Info Response
        self.mock_token_info = {
            "email": self.google_email,
            "name": self.google_name,
            "sub": self.google_sub,
            "picture": self.google_picture
        }

    @patch('app.auth.routes.requests.get')
    def test_google_login_flow(self, mock_get):
        # Mock successful Google token verification
        class MockResponse:
            status_code = 200
            def json(self):
                return self.mock_token_info
        
        mock_get.return_value = MockResponse()
        mock_get.return_value.json = lambda: self.mock_token_info

        # 1. First-time Login (Registration)
        res1 = self.client.post('/api/auth/google-login', json={"credential": "mock_valid_id_token"})
        self.assertEqual(res1.status_code, 200)
        data1 = json.loads(res1.data)
        self.assertTrue(data1['success'])
        
        user_info1 = data1['data']['user']
        self.assertEqual(user_info1['email'], self.google_email)
        self.assertEqual(user_info1['name'], self.google_name)
        self.assertEqual(user_info1['google_id'], self.google_sub)
        self.assertEqual(user_info1['login_provider'], "google")
        self.assertEqual(user_info1['profile_photo'], self.google_picture)
        self.assertTrue(user_info1['is_verified'])

        # 2. Subsequent Login (Existing User)
        res2 = self.client.post('/api/auth/google-login', json={"credential": "mock_valid_id_token"})
        self.assertEqual(res2.status_code, 200)
        data2 = json.loads(res2.data)
        self.assertTrue(data2['success'])
        
        user_info2 = data2['data']['user']
        self.assertEqual(user_info2['id'], user_info1['id'])  # Ensure it didn't create a new user

    @patch('app.auth.routes.requests.get')
    def test_google_login_invalid_token(self, mock_get):
        # Mock failed Google token verification
        class MockResponse:
            status_code = 401
        
        mock_get.return_value = MockResponse()

        res = self.client.post('/api/auth/google-login', json={"credential": "mock_invalid_id_token"})
        self.assertEqual(res.status_code, 401)
        data = json.loads(res.data)
        self.assertFalse(data['success'])
        self.assertIn("Invalid Google token", data['message'])

if __name__ == '__main__':
    unittest.main()
