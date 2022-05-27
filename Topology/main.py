
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

#set the headers
attributes=['No', 'Time', 'Source', 'Destination', 'Protocol','Length', 'Info']

#assigns the csvs to objects
df=pd.read_csv('./task4part1.csv',names=attributes)
df2=pd.read_csv('./task4part2.csv',names=attributes)

#Shows only lines with tcp protocols
df=df.loc[(df['Protocol']=='TCP')]

#isolates for thw Win= number
df['Info']= df['Info'].str.split('Len').str[-2]
df['Info']= df['Info'].str.split('Win=').str[1]
df['Info']= df['Info'].astype(int) #sets it to int
df['No']= df['No'].astype(int)     #sets it to int
df.plot(x="Time",y=["Info"]) #plots it

#Shows only lines with tcp protocols
df2=df2.loc[(df2['Protocol']=='TCP')]

#isolates for the Win= number
df2['Info']= df2['Info'].str.split('Len').str[-2]
df2['Info']= df2['Info'].str.split('Win=').str[1]
df2['Info']= df2['Info'].astype(int) #sets it to int
df2['No']= df2['No'].astype(int)     #sets it to int
df2.plot(x="Time",y=["Info"])


#displays the plots
plt.show()   #figure 1 is df and figure 2 is df2

