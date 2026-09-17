"""Backend API tests for Malabar Stores payment endpoints"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://source-inspector-11.preview.emergentagent.com').rstrip('/')


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health / root ---
class TestHealth:
    def test_api_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert r.json().get("message") == "Hello World"


# --- Payments: create-order (expected to fail with 502 due to placeholder keys) ---
class TestCreateOrder:
    def test_create_order_placeholder_keys_returns_502(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/payments/create-order", json={"amount": 130})
        # Expected: 502 because placeholder Razorpay keys cannot auth against real API
        # NOTE: Ingress rewrites 5xx body to an HTML error page (backend itself returns JSON detail).
        assert r.status_code == 502, f"Expected 502, got {r.status_code}: {r.text[:200]}"

    def test_create_order_zero_amount_returns_400(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/payments/create-order", json={"amount": 0})
        assert r.status_code == 400

    def test_create_order_negative_amount_returns_400(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/payments/create-order", json={"amount": -10})
        assert r.status_code == 400

    def test_create_order_missing_amount_returns_422(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/payments/create-order", json={})
        assert r.status_code == 422


# --- Payments: verify (local HMAC, should work without real keys) ---
class TestVerifyPayment:
    def test_verify_invalid_signature_returns_200_false(self, api_client):
        payload = {
            "razorpay_order_id": "order_FAKE123",
            "razorpay_payment_id": "pay_FAKE123",
            "razorpay_signature": "invalidsignature",
        }
        r = api_client.post(f"{BASE_URL}/api/payments/verify", json=payload)
        assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
        data = r.json()
        assert data == {"verified": False}

    def test_verify_missing_fields_returns_422(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/payments/verify", json={"razorpay_order_id": "x"})
        assert r.status_code == 422
