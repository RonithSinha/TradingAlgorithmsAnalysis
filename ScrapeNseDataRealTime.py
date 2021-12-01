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
    required_price=json.loads(responseDiv.contents[0].replace("\r\n",""))['data'][0]['lastPrice'] 
    #print(symbol,float(required_price.replace(',','')))
    return float(required_price.replace(',',''))

def return_Nifty50_stock_price_data(nifty50list):
    stocks_data=[]
    for i in nifty50list:		
        try:
            stockPrice=return_stockPrice(i)
            print(i,': ',stockPrice)
            stocks_data.append(stockPrice)
        except Exception as Error:
            print('Could not print: '+i+'; '+Error)
            stocks_data.append(np.nan)
    return stocks_data

def update_Data(Nifty50stocks,nifty50list):
    nifty50_stock_prices=return_Nifty50_stock_price_data(nifty50list)
    current_time=get_current_time()
    Nifty50stocks[current_time]=pd.Series(nifty50_stock_prices)
    print(current_time)
    Nifty50stocks.to_csv('Nifty50stocks.csv', index=False)

def get_current_time():
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    return current_time

def prepare_data():    
    Nifty50stocks=pd.read_csv('Nifty50stocks.csv')
    nifty50list=list(Nifty50stocks['Symbol'])

    Nifty50stocks=Nifty50stocks.loc[:, Nifty50stocks.columns.intersection(['Symbol'])]
    Nifty50stocks.to_csv('Nifty50stocks.csv', index=False)

    current_time=get_current_time()
    while not(current_time[:2]>='16' and current_time[3:5]>='49'):
        update_Data(Nifty50stocks,nifty50list)
        time.sleep(60)       

if __name__=='__main__':
    prepare_data()