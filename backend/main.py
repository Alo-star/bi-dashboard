from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import pandas as pd
import sqlite3, json, traceback

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

df = pd.read_csv("amazon_sales.csv")
conn = sqlite3.connect("sales.db", check_same_thread=False)
df.to_sql("sales", conn, if_exists="replace", index=False)

client = genai.Client(api_key="AIzaSyAV6CMqJlxp0dstDiTDRPKRqidks6IACA8")

columns = list(df.columns)
print("✅ Columns loaded:", columns)

class Query(BaseModel):
    question: str

@app.post("/ask")
async def ask(query: Query):
    try:
        print("📨 Question received:", query.question)

        prompt = f"""
        You are a SQL expert. The database has one table called 'sales' with these columns: {columns}.
        The user asked: "{query.question}"
        Write a SQLite SQL query to answer this. Return ONLY a JSON object like this:
        {{"sql": "SELECT ...", "chart_type": "bar|line|pie", "x_axis": "column_name", "y_axis": "column_name", "title": "Chart title"}}
        Nothing else. No explanation. Only JSON.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        raw = response.text.strip().replace("```json","").replace("```","").strip()
        print("🤖 Gemini response:", raw)

        plan = json.loads(raw)
        print("✅ SQL plan:", plan)

        result = pd.read_sql_query(plan["sql"], conn)
        result = result.fillna(0)
        print("✅ Data rows:", len(result))

        return {
            "chart_type": plan.get("chart_type", "bar"),
            "title": plan.get("title", "Result"),
            "x_axis": plan.get("x_axis"),
            "y_axis": plan.get("y_axis"),
            "data": result.head(20).to_dict(orient="records")
        }
    except Exception as e:
        print("❌ ERROR:", str(e))
        print(traceback.format_exc())
        return {"error": str(e)}