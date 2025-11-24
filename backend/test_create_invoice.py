import json
import urllib.request
import urllib.error

def main():
    # 1. Login to get token
    login_url = "http://localhost:8000/api/auth/login"
    login_payload = {
        "tenant_code": "dealer-001",
        "email": "dealer@example.com",
        "password": "password"
    }
    
    req = urllib.request.Request(
        login_url, 
        data=json.dumps(login_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            token = data["access_token"]
            print("Login successful. Token obtained.")
    except urllib.error.HTTPError as e:
        print(f"Login failed: {e.code}")
        print(e.read().decode('utf-8'))
        return

    # 2. Create Invoice
    invoice_url = "http://localhost:8000/api/invoices"
    invoice_payload = {
        "customer_name": "Test Customer",
        "mobile": "9999999999",
        "email": "test@example.com",
        "vehicle_no": "AP-39-TEST",
        "items": [
            {
                "name": "Test Item",
                "qty": 1,
                "rate": 100.0,
                "tax_rate": 18.0
            }
        ],
        "status": "PAID"
    }
    
    req = urllib.request.Request(
        invoice_url,
        data=json.dumps(invoice_payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print("Invoice created successfully!")
            data = json.loads(response.read().decode('utf-8'))
            print(json.dumps(data, indent=2))
    except urllib.error.HTTPError as e:
        print(f"Invoice creation failed: {e.code}")
        print(e.read().decode('utf-8'))

if __name__ == "__main__":
    main()
