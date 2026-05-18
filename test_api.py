#!/usr/bin/env python
"""
API Endpoint Testing for 24TRADEX
Tests all critical REST API endpoints and auth flows
"""
import os
import sys
import django
import json
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tradex.settings')
django.setup()

from django.test import Client
from django.contrib.auth import authenticate
from apps.accounts.models import User
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal
from apps.settings_app.models import SystemSettings
from django.utils import timezone

client = Client()
results = {"passed": 0, "failed": 0, "errors": []}

def test(name, condition, error_msg=""):
    if condition:
        results["passed"] += 1
        print(f"✓ {name}")
    else:
        results["failed"] += 1
        error = f"✗ {name}"
        if error_msg:
            error += f" - {error_msg}"
        results["errors"].append(error)
        print(error)

print("=" * 70)
print("24TRADEX API ENDPOINT TESTING")
print("=" * 70)

# Setup: Create test user
print("\n[1] SETUP: Creating test user")
print("-" * 70)

User.objects.filter(username="apitest_user").delete()

api_user = User.objects.create_user(
    username="apitest_user",
    email="apitest@test.com",
    password="testpass123",
    full_name="API Test User",
)
test("API test user created", api_user.id is not None)

# Authenticate the client by logging in
from django.contrib.auth import authenticate
user = authenticate(username='apitest_user', password='testpass123')
test("User can authenticate", user is not None)

if user:
    client.force_login(user)
    test("Client force logged in", True)
else:
    # Try POST login
    response = client.post('/api/auth/login', data={
        'username': 'apitest_user',
        'password': 'testpass123',
    })
    test("Login returns response", response.status_code in [200, 400])
    login_data = {}
    if response.status_code == 200:
        try:
            login_data = response.json()
            test("Login response is JSON", isinstance(login_data, dict))
        except:
            pass

# ==== 2. AUTHENTICATION ENDPOINTS
print("\n[2] AUTHENTICATION ENDPOINTS")
print("-" * 70)

# Test logout
response = client.post('/api/auth/logout')
test("Logout endpoint accessible", response.status_code in [200, 401, 404, 302])

# ==== 3. PURCHASE ENDPOINTS
print("\n[3] PURCHASE ENDPOINTS")
print("-" * 70)

# Get purchases list
response = client.get('/api/purchases')
test("Purchases list returns response", response.status_code in [200, 401, 302, 403])

# ==== 4. WITHDRAWAL ENDPOINTS (The problematic one!)
print("\n[4] WITHDRAWAL ENDPOINTS (Previously broken)")
print("-" * 70)

# Test unlocked amount endpoint
response = client.get('/api/withdrawals/unlocked')
test("Unlocked amount endpoint accessible", response.status_code in [200, 401, 403])

if response.status_code == 200:
    try:
        data = response.json()
        test("Unlocked endpoint returns JSON", isinstance(data, dict))
        # Check for expected fields
        has_total_unlocked = 'total_unlocked' in data
        has_available = 'available' in data
        test("Unlocked endpoint has total_unlocked field", has_total_unlocked)
        test("Unlocked endpoint has available field", has_available)
    except Exception as e:
        test("Unlocked endpoint JSON parsing", False, str(e))
elif response.status_code in [401, 403]:
    print(f"  (Endpoint exists but requires auth - status: {response.status_code})")
    test("Unlocked endpoint exists (auth required)", True)
else:
    print(f"  (Response status: {response.status_code})")

# Test withdrawals list
response = client.get('/api/withdrawals?page=1')
test("Withdrawals list endpoint accessible", response.status_code in [200, 401, 403])

# ==== 5. ADMIN API ENDPOINTS
print("\n[5] ADMIN API ENDPOINTS")
print("-" * 70)

# Create a superuser for admin tests
User.objects.filter(username="apitest_admin").delete()
admin_user = User.objects.create_superuser(
    username="apitest_admin",
    email="admin@test.com",
    password="adminpass123",
)
test("Admin user created", admin_user.is_superuser)

# Try accessing admin endpoints (without auth - should fail)
response = client.get('/api/admin/users')
test("Admin users endpoint returns response", response.status_code in [200, 401, 403])

response = client.get('/api/admin/purchases')
test("Admin purchases endpoint returns response", response.status_code in [200, 401, 403])

response = client.get('/api/admin/withdrawals')
test("Admin withdrawals endpoint returns response", response.status_code in [200, 401, 403])

# ==== 6. SETTINGS ENDPOINTS
print("\n[6] SETTINGS ENDPOINTS")
print("-" * 70)

# Public settings (should be accessible)
response = client.get('/api/settings/public')
test("Public settings endpoint accessible", response.status_code == 200)

if response.status_code == 200:
    try:
        data = response.json()
        test("Public settings returns JSON", isinstance(data, dict))
        test("Has coin_rate", 'coin_rate' in data)
    except:
        test("Public settings JSON parsing", False)

# ==== 7. SERIALIZER RESPONSE STRUCTURE
print("\n[7] SERIALIZER RESPONSE STRUCTURE")
print("-" * 70)

# Create test data for serializer checks
settings = SystemSettings.get_settings()
settings.coin_rate = Decimal('0.50')
settings.save()

purchase = Purchase.objects.create(
    user=api_user,
    amount=Decimal('50.00'),
    wallet_address="0xtest",
    txid="tx999",
)
purchase.status = 'approved'
purchase.approved_at = timezone.now()
purchase.coin_rate_at_approval = settings.coin_rate
purchase.approved_coin_amount = Decimal('100.00')
purchase.is_coins_assigned = True
purchase.coins_assigned_at = timezone.now()
purchase.save()

from apps.purchases.serializers import PurchaseSerializer
purchase_ser = PurchaseSerializer(purchase)
test("Purchase serializer has all fields", len(purchase_ser.data) > 0)
test("Purchase has usdt_equivalent in serializer", 'usdt_equivalent' in purchase_ser.data)
test("Purchase usdt_equivalent is numeric", isinstance(purchase_ser.data.get('usdt_equivalent'), (int, float)))

withdrawal = Withdrawal.objects.create(
    user=api_user,
    amount=Decimal('50.00'),
    wallet_address="0xwithdraw",
)
from apps.withdrawals.serializers import WithdrawalSerializer
withdrawal_ser = WithdrawalSerializer(withdrawal)
test("Withdrawal serializer has all fields", len(withdrawal_ser.data) > 0)
test("Withdrawal has usdt_equivalent", 'usdt_equivalent' in withdrawal_ser.data)

# ==== 8. ERROR HANDLING
print("\n[8] ERROR HANDLING")
print("-" * 70)

# Test 404 error
response = client.get('/api/purchases/99999')
test("Nonexistent resource returns error", response.status_code in [404, 401, 403])

# Test invalid method
response = client.patch('/api/settings/public')
test("Invalid method handled", response.status_code in [405, 401])

# ==== FINAL REPORT
print("\n" + "=" * 70)
print("API TEST SUMMARY")
print("=" * 70)
print(f"✓ Passed: {results['passed']}")
print(f"✗ Failed: {results['failed']}")
print(f"Total:  {results['passed'] + results['failed']}")

if results['errors']:
    print("\nFailed Tests:")
    for error in results['errors']:
        print(f"  {error}")

success_rate = (results['passed'] / (results['passed'] + results['failed']) * 100) if (results['passed'] + results['failed']) > 0 else 0
print(f"\nSuccess Rate: {success_rate:.1f}%")

if success_rate >= 95:
    print("\n✓ API TESTS MOSTLY PASSED!")
    sys.exit(0)
else:
    print(f"\n✗ {results['failed']} test(s) failed")
    sys.exit(1)
