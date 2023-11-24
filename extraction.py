from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import ahocorasick
import json, pprint, time, re

uri = "mongodb+srv://medifind:medifind@medifind.uezyqvq.mongodb.net/?retryWrites=true&w=majority"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    # print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client["MediFind"]
collection = db["Drug"]

def load(collection):
    data = collection.find({})
    names = [item["tenThuoc"] for item in data]
    return names

def build_trie(names):
    trie = ahocorasick.Automaton()
    # print("---------")
    for index, drugName in enumerate(names):
        trie.add_word(drugName, (index, drugName))
    # print("---------")
    trie.make_automaton()
    return trie

def extract(text, trie):
    medName = set()
    for _, (_, drugName) in trie.iter(text):
        medName.add(drugName)
    return medName

def printInfo(name, collection):
    data = collection.find_one({"tenThuoc": name})
    pprint.pprint(data)

def extDosage(text):
    pattern = r"\b(sáng|trưa|chiều|tối)\s*(\d+)\s*viên"
    matches = re.findall(pattern, text, re.IGNORECASE)
    return {time: quantity for time, quantity in matches}


def list(collection):
    names = load(collection)
    trie = build_trie(names)

    input = "doc.txt"
    with open(input, "r") as file:
        docText = file.read()
        # docText = docText.lower()

    medNames = extract(docText, trie)
    dosages = extDosage(docText)
    return medNames, dosages

if __name__ == "__main__":
    pred_names, dosages = list(collection)
    
    # for medicine in pred_names:
    #     printInfo(medicine, collection)
    
    for time, (quantity, unit) in dosages.items():
        print(f"Dosage in the {time}: {quantity} {unit}")