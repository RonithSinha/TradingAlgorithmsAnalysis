# ---
# jupyter:
#   jupytext_format_version: '1.2'
#   kernelspec:
#     display_name: Python 3
#     language: python
#     name: python3
#   language_info:
#     codemirror_mode:
#       name: ipython
#       version: 3
#     file_extension: .py
#     mimetype: text/x-python
#     name: python
#     nbconvert_exporter: python
#     pygments_lexer: ipython3
#     version: 3.6.7
# ---

from bs4 import BeautifulSoup
import requests

import pandas as pd
import numpy as np

import math
from datetime import datetime
import time
import json

def return_stockPrice(symbol):
    stockURL='https://www.nseindia.com/live_market/dynaContent/live_watch/get_quote/GetQuote.jsp?symbol='+symbol
    page=requests.get(stockURL)
    soup=BeautifulSoup(page.content,'html.parser')
    responseDiv=soup.find('div',{'id':'responseDiv'})
    required_price=json.loads(responseDiv.contents[0].replace("\r\n",""))['data'][0]['lastPrice'] #get the lastPrice of the symbol
    return float(required_price)

return_stockPrice('HINDZINC')

def return_Nifty50_stock_price_data():
    stocks_data=[]
    for i in nifty50list:
        try:
            stockPrice=return_stockPrice(i)
            #print(i,': ',stockPrice)
            stocks_data.append(stockPrice)
        except:
            #print('Could not print: '+i)
            stocks_data.append(np.nan)
    return stocks_data

def update_Data():
    nifty50_stock_prices=return_Nifty50_stock_price_data()
    current_time=get_current_time()
    Nifty50stocks[current_time]=pd.Series(nifty50_stock_prices)
    Nifty50stocks.to_csv('Nifty50stocks.csv', index=False)

def get_current_time():
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    return current_time


current_time=get_current_time()
while not(current_time[:2]>='15' and current_time[3:5]>='31'):
    print(current_time)
    update_Data()
    time.sleep(60)       

