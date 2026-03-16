import pandas as pd


def load_transactions():

    df = pd.read_csv("data/transactions.csv")

    # convert date column safely
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    return df


# optional alias so other files don't break
def load_data():
    return load_transactions()