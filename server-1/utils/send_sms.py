import os
import sys
import requests
import urllib.parse

apikey = os.getenv('SEPHAMORE_API_KEY')
sender_name = os.getenv('SENDER_NAME', "SEMAPHORE")

def send_message(message, number):
    print("Sending message:", message, "to number:", number)
    params = {
        "apikey": apikey,
        "sendername": sender_name,
        "message": message, 
        "number": number
    }  
    
    path = "https://api.semaphore.co/api/v4/messages" + urllib.parse.urlencode(params)
    response = requests.post(patch)
    print("Message sent, response:", response.text)
    

if __name__ == "__main__":
    message = sys.argv[1]
    number = sys.argv[2]
    send_message(message, number)
    