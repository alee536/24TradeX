#!/usr/bin/env python
"""
Comprehensive Testing Script for 24TRADEX
Tests all critical workflows: auth, purchases, withdrawals, sponsors, admin flows
"""
import os
import sys
import django
from decimal import Decimal
from datetime import timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tradex.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.db import models
from apps.accounts.models import User
from apps.purchases.models import Purchase
from apps.withdrawals.models import Withdrawal
from apps.settings_app.models import SystemSettings
from apps.notifications.models import Notification

# Test Results
results = {"passed": 0, "failed": 0, "errors": []}

def test(name, condition, error_msg=""):
    """Helper to record test result"""
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
print("24TRADEX COMPREHENSIVE TEST SUITE")
print("=" * 70)

# ==== 1. SETUP: Create test users and data
print("\n[1] SETUP: Creating test users and data")
print("-" * 70)

# Delete previous test data
User.objects.filter(username__startswith="test_").delete()

# Get or create settings
settings = SystemSettings.get_settings()
settings.coin_rate = Decimal('0.50')
settings.stage1_hours = 1
settings.stage2_hours = 1
settings.stage3_hours = 1
settings.stage1_percent = Decimal('50')
settings.stage2_percent = Decimal('25')
settings.stage3_percent = Decimal('25')
settings.save()

test("Settings initialized", settings.coin_rate == Decimal('0.50'), f"coin_rate={settings.coin_rate}")

# Create test users
sponsor_user = User.objects.create_user(
    username="test_sponsor",
    email="sponsor@test.com",
    password="testpass123",
    full_name="Test Sponsor",
    wallet_address="0xsponsor123",
)
test("Sponsor user created", sponsor_user.id is not None)

user1 = User.objects.create_user(
    username="test_user1",
    email="user1@test.com",
    password="testpass123",
    full_name="Test User One",
    wallet_address="0xuser1addr",
    sponsored_by=sponsor_user,
)
test("User 1 created with sponsor", user1.sponsored_by == sponsor_user)

user2 = User.objects.create_user(
    username="test_user2",
    email="user2@test.com",
    password="testpass123",
    full_name="Test User Two",
    wallet_address="0xuser2addr",
    sponsored_by=sponsor_user,
)
test("User 2 created with same sponsor", user2.sponsored_by == sponsor_user)

# ==== 2. PURCHASE SYSTEM TESTING
print("\n[2] PURCHASE SYSTEM TESTING")
print("-" * 70)

# Create purchase request
purchase1 = Purchase.objects.create(
    user=user1,
    amount=Decimal('100.00'),
    wallet_address="0xuser1wallet",
    txid="tx123456",
    screenshot=None,
)
test("Purchase created", purchase1.id is not None and purchase1.status == 'pending')
test("Purchase transaction ID auto-generated", purchase1.transaction_id.startswith("TX24X"))

# Approve purchase
purchase1.status = 'approved'
purchase1.approved_at = timezone.now()
purchase1.coin_rate_at_approval = settings.coin_rate
purchase1.approved_coin_amount = Decimal(purchase1.amount) / Decimal(settings.coin_rate)
purchase1.save()

expected_coins = Decimal('100.00') / Decimal('0.50')
test("Purchase approved", purchase1.status == 'approved')
test("Coin calculation correct", purchase1.approved_coin_amount == expected_coins, f"expected={expected_coins}, got={purchase1.approved_coin_amount}")

# Assign coins
purchase1.is_coins_assigned = True
purchase1.coins_assigned_at = timezone.now()
purchase1.save()

test("Coins assigned", purchase1.is_coins_assigned == True)

# Create second purchase
purchase2 = Purchase.objects.create(
    user=user1,
    amount=Decimal('50.00'),
    wallet_address="0xuser1wallet2",
    txid="tx654321",
)
purchase2.status = 'approved'
purchase2.approved_at = timezone.now() - timedelta(hours=3)
purchase2.coin_rate_at_approval = settings.coin_rate
purchase2.approved_coin_amount = Decimal('50.00') / Decimal('0.50')
purchase2.is_coins_assigned = True
purchase2.coins_assigned_at = timezone.now() - timedelta(hours=2)
purchase2.save()

test("Second purchase created and assigned", purchase2.is_coins_assigned == True)

# ==== 3. COIN LOGIC VERIFICATION
print("\n[3] COIN LOGIC VERIFICATION")
print("-" * 70)

total_coins = purchase1.approved_coin_amount + purchase2.approved_coin_amount
test("Total coins calculated", total_coins == Decimal('300.00'), f"got={total_coins}")

# Check unlocked_amount property
unlocked1 = purchase1.unlocked_amount
test("Purchase 1 unlocked_amount calculated", unlocked1 >= 0)

unlocked2 = purchase2.unlocked_amount
# This one is 3 hours old, so should have more unlocked
test("Purchase 2 unlocked_amount >= Purchase 1", unlocked2 >= unlocked1, f"p2={unlocked2}, p1={unlocked1}")

total_unlocked = unlocked1 + unlocked2
test("Total unlocked amount computed", total_unlocked >= 0, f"total={total_unlocked}")

# ==== 4. WITHDRAWAL SYSTEM TESTING
print("\n[4] WITHDRAWAL SYSTEM TESTING")
print("-" * 70)

# Create withdrawal
withdrawal1 = Withdrawal.objects.create(
    user=user1,
    amount=Decimal('100.00'),
    wallet_address="0xwithdraw1",
)
test("Withdrawal created", withdrawal1.id is not None and withdrawal1.status == 'pending')

# Approve withdrawal
withdrawal1.status = 'approved'
withdrawal1.approved_at = timezone.now()
withdrawal1.manual_tx_hash = 'manualtx123'
withdrawal1.save()
test("Withdrawal approved", withdrawal1.status == 'approved')

# Check stage properties
stage1, stage2, stage3 = withdrawal1.stage_amounts
test("Stage amounts calculated", stage1 + stage2 + stage3 == withdrawal1.amount, f"got {stage1 + stage2 + stage3}")
test("Stage 1 is 50%", stage1 == withdrawal1.amount * Decimal('0.50'))

# ==== 5. SPONSOR SYSTEM TESTING
print("\n[5] SPONSOR SYSTEM TESTING")
print("-" * 70)

# Check sponsor relationships
test("Sponsor has children", user1.sponsored_by == sponsor_user)
test("Child count correct", sponsor_user.sponsored_users.count() == 2, f"got {sponsor_user.sponsored_users.count()}")

# Test sponsor earnings calculation
sponsor_earnings = Decimal('0')
for p in Purchase.objects.filter(user__sponsored_by=sponsor_user, status='approved'):
    coin_amount = p.approved_coin_amount
    earnings = coin_amount * Decimal(settings.sponsor_percentage) / Decimal('100')
    sponsor_earnings += earnings

test("Sponsor earnings calculated", sponsor_earnings > 0, f"got {sponsor_earnings}")

# ==== 6. REJECTION FLOW TESTING
print("\n[6] REJECTION FLOW TESTING")
print("-" * 70)

purchase3 = Purchase.objects.create(
    user=user2,
    amount=Decimal('25.00'),
    wallet_address="0xuser2wallet",
    txid="txreject123",
)
purchase3.status = 'rejected'
purchase3.rejection_reason = 'Suspicious activity detected'
purchase3.rejection_reason_type = 'suspicious_activity'
purchase3.rejection_date = timezone.now()
purchase3.save()

test("Purchase rejected", purchase3.status == 'rejected')
test("Rejection reason stored", purchase3.rejection_reason == 'Suspicious activity detected')

# ==== 7. ADMIN API RESPONSE VERIFICATION
print("\n[7] ADMIN API RESPONSE VERIFICATION")
print("-" * 70)

# Test serializer output
from apps.purchases.serializers import PurchaseSerializer
from apps.withdrawals.serializers import WithdrawalSerializer

purchase_ser = PurchaseSerializer(purchase1)
test("Purchase serializer includes usdt_equivalent", 'usdt_equivalent' in purchase_ser.data)

withdrawal_ser = WithdrawalSerializer(withdrawal1)
test("Withdrawal serializer includes usdt_equivalent", 'usdt_equivalent' in withdrawal_ser.data)
test("Withdrawal usdt_equivalent value correct", 
     withdrawal_ser.data['usdt_equivalent'] == float(withdrawal1.amount * settings.coin_rate))

# ==== 8. NOTIFICATION SYSTEM TESTING
print("\n[8] NOTIFICATION SYSTEM TESTING")
print("-" * 70)

from apps.notifications.utils import create_notification

create_notification(user1, 'test_type', 'Test notification message')
notif_count = Notification.objects.filter(user=user1).count()
test("Notification created", notif_count > 0, f"count={notif_count}")

unread = Notification.objects.filter(user=user1, is_read=False).count()
test("Notification marked unread by default", unread > 0)

# ==== 9. DATABASE INTEGRITY CHECKS
print("\n[9] DATABASE INTEGRITY CHECKS")
print("-" * 70)

# Check for orphaned records
orphaned_purchases = Purchase.objects.filter(user__isnull=True).count()
test("No orphaned purchases", orphaned_purchases == 0, f"found {orphaned_purchases}")

orphaned_withdrawals = Withdrawal.objects.filter(user__isnull=True).count()
test("No orphaned withdrawals", orphaned_withdrawals == 0, f"found {orphaned_withdrawals}")

# Check for duplicate transactions
dup_txids = Purchase.objects.values('transaction_id').annotate(count=models.Count('id')).filter(count__gt=1).count()
test("No duplicate transaction IDs", dup_txids == 0, f"found {dup_txids}")

# ==== 10. MODEL PROPERTY TESTS
print("\n[10] MODEL PROPERTY TESTS")
print("-" * 70)

# Test withdrawal paid/remaining amounts
withdrawal1.stage1_paid_at = timezone.now()
test("Paid amount calculates with stage1", withdrawal1.paid_amount > 0)
test("Remaining amount calculates", withdrawal1.remaining_amount > 0)
test("Paid + Remaining = Total", withdrawal1.paid_amount + withdrawal1.remaining_amount == withdrawal1.amount)

# Test next_payout_stage
next_stage = withdrawal1.next_payout_stage
test("Next payout stage calculated", next_stage in [1, 2, 3, None], f"got {next_stage}")

# ==== FINAL REPORT
print("\n" + "=" * 70)
print("TEST SUMMARY")
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

if success_rate == 100:
    print("\n✓ ALL TESTS PASSED!")
    sys.exit(0)
else:
    print(f"\n✗ {results['failed']} test(s) failed")
    sys.exit(1)
