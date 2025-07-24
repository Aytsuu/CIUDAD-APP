from rest_framework import generics
from .models import *
from .serializers import *
from django.apps import apps
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import base64
import json
import logging
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse


Personal = apps.get_model('profiling', 'Personal')

class DonationView(generics.ListCreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    lookup_field = 'don_num'

class PersonalListView(generics.ListAPIView):
    queryset = Personal.objects.only('per_id', 'per_fname', 'per_lname')
    serializer_class = PersonalSerializer

logger = logging.getLogger(__name__)

# class CreateDonationPayment(APIView):
#     def post(self, request):
#         try:
#             amount = int(float(request.data.get('amount', 100)))  # Get amount from request
#             currency = request.data.get('currency', 'PHP')
            
#             # Validate minimum amount (100 PHP)
#             if amount < 100:
#                 return Response({'error': 'Amount must be at least ₱100'}, status=400)
#             # Get user account if authenticated
#             account = request.user if request.user.is_authenticated else None
            
#             # Create PayMongo checkout session
#             payload = {
#                 "data": {
#                     "attributes": {
#                         "line_items": [{
#                             "currency": currency,
#                             "amount": 10000,  # Minimum 100 PHP (10000 cents)
#                             "name": "Community Donation",
#                             "quantity": 1
#                         }],
#                         "payment_method_types": ["gcash", "card"],
#                         "cancel_url": "https://checkout.paymongo.com/mobile/return",
#                         "success_url": "https://checkout.paymongo.com/mobile/return",
#                         "description": "Community Donation",
#                         "metadata": {
#                             "user_id": str(account.id) if account else None,
#                             "purpose": "community_donation"
#                         }
#                     }
#                 }
#             }

#             # Create PayMongo session
#             resp = requests.post(
#                 'https://api.paymongo.com/v1/checkout_sessions',
#                 json=payload,
#                 headers={
#                     "Authorization": f"Basic {base64.b64encode(f'{settings.PAYMONGO_SECRET_KEY}:'.encode()).decode()}"
#                 }
#             )
#             resp.raise_for_status()
#             response_data = resp.json()

#             # Store initial transaction record
#             transaction = OnlineDonation.objects.create(
#                 od_transaction_id=response_data['data']['attributes']['payment_intent']['id'],
#                 od_amount=100.00,  # Default amount
#                 od_payment_channel="pending",
#                 account=account,
#                 od_payment_details=response_data
#             )

#             return Response({
#                 'checkout_url': response_data['data']['attributes']['checkout_url'],
#                 'payment_intent_id': response_data['data']['attributes']['payment_intent']['id']
#             })

#         except Exception as e:
#             logger.error(f"Payment Error: {str(e)}")
#             return Response({'error': str(e)}, status=400)

class CreateDonationPayment(APIView):
    def post(self, request):
        try:
            # Get and validate amount
            amount = float(request.data.get('amount', 100))
            if amount <= 0:
                return Response({'error': 'Amount must be positive'}, status=400)
            
            # Convert to cents (PayMongo requirement)
            amount_cents = int(amount * 100)
            
            # PayMongo's minimum amounts in cents
            min_amounts = {
                'gcash': 100,      # ₱1
                'card': 10000,     # ₱100
            }
            
            # Create payload
            payload = {
                "data": {
                    "attributes": {
                        "line_items": [{
                            "currency": "PHP",
                            "amount": max(amount_cents, min_amounts['gcash']),  # Use GCash minimum as fallback
                            "name": "Community Donation",
                            "quantity": 1
                        }],
                        "payment_method_types": ["gcash", "card"],
                        "cancel_url": "https://checkout.paymongo.com/mobile/return",
                        "success_url": "https://checkout.paymongo.com/mobile/return",
                        "description": f"Donation ₱{amount:.2f}"
                    }
                }
            }
            
            # Debug log
            logger.info(f"PayMongo payload: {payload}")
            
            # Create session
            auth = base64.b64encode(f"{settings.PAYMONGO_SECRET_KEY}:".encode()).decode()
            headers = {
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/json"
            }
            
            resp = requests.post(
                "https://api.paymongo.com/v1/checkout_sessions",
                json=payload,
                headers=headers,
                timeout=10
            )
            resp.raise_for_status()
            
            data = resp.json()
            return Response({
                'checkout_url': data['data']['attributes']['checkout_url'],
                'payment_intent_id': data['data']['attributes']['payment_intent']['id']
            })
            
        except Exception as e:
            logger.error(f"Payment error: {str(e)}")
            return Response({'error': str(e)}, status=400)
        
@csrf_exempt
def payment_webhook(request):
    if request.method == 'POST':
        try:
            event = json.loads(request.body)
            
            if event['type'] == 'payment.paid':
                payment = event['data']['attributes']
                amount = payment['amount'] / 100  # Convert to PHP
                
                # Update transaction record
                transaction = OnlineDonation.objects.get(
                    od_transaction_id=payment['payment_intent_id']
                )
                transaction.od_amount = amount
                transaction.od_payment_channel = payment['source']['type']
                transaction.od_payment_details = payment
                transaction.save()
                
                # Create donation record
                Donation.objects.create(
                    od_transaction=transaction,
                    don_item_name="Monetary Donation",
                    don_qty=1,
                    don_description=f"Online {transaction.od_payment_channel} donation",
                    don_category="Cash",
                    per_id=transaction.account.rp.per if transaction.account else None,
                    staff=None  # Can be set if admin processed
                )
                
                return HttpResponse(status=200)
                
        except Exception as e:
            logger.error(f"Webhook error: {str(e)}")
            return HttpResponse(status=400)

class OnlineDonationListView(generics.ListAPIView):
    queryset = OnlineDonation.objects.all()
    serializer_class = OnlineDonationSerializer

# class PaymentStatus(APIView):
#    def get(self, request, payment_intent_id):
#         try:
#             # Check with PayMongo API
#             resp = requests.get(
#                 f'https://api.paymongo.com/v1/payment_intents/{payment_intent_id}',
#                 headers={
#                     "Authorization": f"Basic {base64.b64encode(f'{settings.PAYMONGO_SECRET_KEY}:'.encode()).decode()}"
#                 }
#             )
#             resp.raise_for_status()
#             data = resp.json()
            
#             status = data['data']['attributes']['status']
#             payment_method = data['data']['attributes'].get('payment_method', {}).get('type', 'unknown')
#             amount = data['data']['attributes']['amount'] / 100
            
#             # Update database if payment succeeded
#             if status == 'succeeded':
#                 transaction = OnlineDonation.objects.get(od_transaction_id=payment_intent_id)
#                 if transaction.od_payment_channel == 'pending':
#                     transaction.od_amount = amount
#                     transaction.od_payment_channel = payment_method
#                     transaction.od_payment_details = data
#                     transaction.save()
                    
#                     # Create donation record
#                     Donation.objects.create(
#                         od_transaction=transaction,
#                         don_item_name="Monetary Donation",
#                         don_qty=1,
#                         don_description=f"Online {payment_method} donation",
#                         don_category="Cash",
#                         per_id=transaction.account.rp.per if transaction.account else None
#                     )
            
#             return Response({
#                 'status': status,
#                 'paid': status == 'succeeded',
#                 'amount': amount,
#                 'payment_method': payment_method
#             })
            
#         except Exception as e:
#             return Response({'error': str(e)}, status=400)

class PaymentStatus(APIView):
    def get(self, request, payment_intent_id):
        try:
            # 1. Check with PayMongo first
            resp = requests.get(
                f"https://api.paymongo.com/v1/payment_intents/{payment_intent_id}",
                headers={
                    "Authorization": f"Basic {base64.b64encode(f'{settings.PAYMONGO_SECRET_KEY}:'.encode()).decode()}"
                }
            )
            resp.raise_for_status()
            data = resp.json()
            status = data['data']['attributes']['status']
            
            # 2. Only process succeeded payments
            if status == 'succeeded':
                payment_data = data['data']['attributes']
                
                # Create OnlineDonation if not exists
                donation, created = OnlineDonation.objects.get_or_create(
                    od_transaction_id=payment_intent_id,
                    defaults={
                        'od_amount': payment_data['amount'] / 100,
                        'od_payment_channel': payment_data.get('payment_method', {}).get('type', 'unknown'),
                        'od_payment_details': payment_data,
                        'account': request.user if request.user.is_authenticated else None
                    }
                )
                
                # Create Donation record if not exists
                Donation.objects.get_or_create(
                    od_transaction=donation,
                    defaults={
                        'don_item_name': "E-money",
                        'don_qty': donation.od_amount,
                        'don_description': "Sent thru an online payment channel",
                        'don_category': "Monetary Donation",
                        'per_id': donation.account.rp.per if donation.account else None
                    }
                )
                
                return Response({
                    'paid': True,
                    'status': status,
                    'amount': donation.od_amount,
                    'payment_method': donation.od_payment_channel
                })
            
            return Response({
                'paid': False,
                'status': status
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)