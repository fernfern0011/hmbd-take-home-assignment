from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import OrderedDict
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.get("/all-spider-data")
def fetch_all_data():
    try:
        df = pd.read_csv("data/spiderplot_(002).csv")
        result = df.to_dict(orient="records")
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/spider")
def spider():
    try:
        # Load data source
        df = pd.read_csv("data/spiderplot_(002).csv")

        # Parse query params
        arms = request.args.get("arms")
        doses = request.args.get("doses")
        tumor_types = request.args.get("tumor_types")

        if arms:
            arms = arms.split(",")
            df = df[df["arm"].isin(arms)]
        if doses:
            doses = [float(d) for d in doses.split(",")]
            df = df[df["dose"].isin(doses)]
        if tumor_types:
            tumor_types = tumor_types.split(",")
            df = df[df["tumor_type"].isin(tumor_types)]

        # Only keep required columns
        cols = ["subject_id", "arm", "dose", "tumor_type", "change", "days"]
        df = df[cols]

        # Convert to records
        result = [
            OrderedDict([
                ("subject_id", row["subject_id"]),
                ("arm", row["arm"]),
                ("dose", row["dose"]),
                ("tumor_type", row["tumor_type"]),
                ("change", row["change"]),
                ("days", row["days"]),
            ])
            for _, row in df.iterrows()
        ]

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/filter")
def filter_options():
    try:
        df = pd.read_csv("data/spiderplot_(002).csv")
        arms = sorted(df["arm"].dropna().unique().tolist())
        doses = sorted(df["dose"].dropna().unique().tolist())
        tumor_types = sorted(df["tumor_type"].dropna().unique().tolist())
        return jsonify({
            "treatmentArms": arms,
            "doseLevels": doses,
            "tumorTypes": tumor_types
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @app.post("/api/summary")
# def summary():
#     try:
#         if "file" in request.files:
#             f = request.files["file"]
#             df = pd.read_csv(f)
#         elif request.is_json:
#             data = request.get_json()
#             if not isinstance(data, list):
#                 return jsonify({"error": "JSON body must be an array of records"}), 400
#             df = pd.DataFrame(data)
#         else:
#             return jsonify({"error": "Provide a CSV file under 'file' or a JSON array body"}), 400

#         result = {
#             "rows": int(len(df)),
#             "columns": list(df.columns),
#         }

#         # If certain numeric columns exist, compute a couple of stats as examples
#         numeric_cols = [
#             c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
#         if numeric_cols:
#             describe = df[numeric_cols].agg(["sum", "mean"]).to_dict()
#             # Flatten the describe dict for a friendlier JSON shape
#             for col, stats in describe.items():
#                 for stat_name, value in stats.items():
#                     result[f"{stat_name}_{col}"] = float(value)

#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # For local dev
    app.run(host="127.0.0.1", port=5000, debug=True)
