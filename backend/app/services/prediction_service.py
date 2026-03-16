import pandas as pd
from sklearn.linear_model import LinearRegression

def predict_sales(df):

    daily_sales = df.groupby("date")["amount"].sum().reset_index()

    daily_sales["day_index"] = range(len(daily_sales))

    X = daily_sales[["day_index"]]
    y = daily_sales["amount"]

    model = LinearRegression()
    model.fit(X, y)

    next_day = [[len(daily_sales)]]

    prediction = model.predict(next_day)

    return float(prediction[0])