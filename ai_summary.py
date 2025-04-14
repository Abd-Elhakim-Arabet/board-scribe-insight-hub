from flask import Flask, request, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os
from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

# Load Gemini Vision model
llm = ChatGoogleGenerativeAI(
    model="gemini-pro-vision",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

@app.route('/api/summarize', methods=['POST'])
def summarize_image():
    data = request.get_json()
    image_url = data.get('imageUrl')

    if not image_url:
        return jsonify({'error': 'Missing imageUrl'}), 400

    try:
        prompt = (
            "Can you summarize what's written on the whiteboard, "
            "start your sentence with 'The whiteboard shows a:' "
            "and make the response no bigger than 50 words."
        )

        message = HumanMessage(content=[
            {"type": "text", "text": prompt},
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url
                }
            },
        ])

        response = llm.invoke([message])
        return jsonify({'summary': response.content})

    except Exception as e:
        print("Error:", e)
        return jsonify({'summary': 'Unable to generate summary'}), 500

if __name__ == '__main__':
    app.run(debug=True)