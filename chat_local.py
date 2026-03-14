"""
chat_local.py — runs the original PyTorch model locally.
NOT used by the web app or Vercel. Run with: python chat_local.py

Requires: pip install torch nltk
"""
import random, json, torch
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as f:
    intents = json.load(f)

data        = torch.load("data.pth")
model       = NeuralNet(data["input_size"], data["hidden_size"], data["output_size"]).to(device)
model.load_state_dict(data["model_state"])
model.eval()

all_words, tags = data['all_words'], data['tags']

def get_local_response(msg):
    X = torch.from_numpy(
        bag_of_words(tokenize(msg), all_words).reshape(1, -1)
    ).to(device)
    probs = torch.softmax(model(X), dim=1)
    prob, predicted = torch.max(probs, dim=1)

    if prob.item() >= 0.75:
        tag = tags[predicted.item()]
        for group in intents['intents']:
            for intent in group['tag']:
                if intent['name'] == tag:
                    return random.choice(intent['responses'])

    return "I'm sorry, I couldn't comprehend your query."

if __name__ == "__main__":
    print("Local PyTorch model — type 'quit' to exit\n")
    while True:
        msg = input("You: ").strip()
        if msg == "quit": break
        print(f"DYChat: {get_local_response(msg)}\n")
