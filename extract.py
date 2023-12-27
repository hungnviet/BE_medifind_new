from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import ahocorasick
import json, pprint, time, re
from fuzzywuzzy import process
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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

# daytime = ["sáng", "trưa", "chiều", "tối"]

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

def extract_dosages(section):
    lines = section.strip().split("\n")
    dosage_info = ' '.join(lines[0:])
    
    times = ["sáng", "trưa", "chiều", "tối"]
    pattern = r"(\w+)\s*(\d+)\s*(\w+),?\s*([^,]*)"
    matches = re.findall(pattern, dosage_info, re.IGNORECASE)
    
    dosage_dict = {}
    for time, dosage, unit, extra_info in matches:
        closest_match, score = process.extractOne(time, times)
        if score >= 80:  # Adjust the score threshold as needed
            dosage_dict[closest_match] = {'dosage': dosage, 'unit': unit, 'extra_info': extra_info.strip()}
    
    return dosage_dict

def list(collection):
    names = load(collection)
    trie = build_trie(names)

    input = "doc.txt"
    with open(input, "r", encoding="utf-8") as file:
        docText = file.read()
        # docText = docText.lower()
    dosages = {}
    medNames = extract(docText, trie)
    sections = re.split(r"\d+\.", docText)[1:]  # Skip the first section as it does not contain medication info
    for section in sections:
        dosage_info = extract_dosages(section)
        dosages.update(dosage_info)
        
    return medNames, dosages

if __name__ == "__main__":
    pred_names, dosages = list(collection)
    
    # for medicine in pred_names:
    #printInfo(medicine, collection)
    
    with open("output.txt", "w", encoding="utf-8") as output_file:
        output_file.write(str(dosages))
