from firebase_admin import firestore, initialize_app, credentials
from platform import machine

def check_machine():
  print('hello world')
  print(machine()) # should return x86_64 for Intel chip (emulator), arm64 for Mac chip

def set_env_var():
  from os import environ
  environ['FIRESTORE_EMULATOR_HOST']='localhost:8080'
  environ['GOOGLE_APPLICATION_CREDENTIALS']='./serviceAccountKey.json'

def test_firestore():
  set_env_var()
  cred = credentials.ApplicationDefault()
  initialize_app(cred)
  db = firestore.client()

  users_ref = db.collection(u'users')
  docs = users_ref.stream()

  for doc in docs:
      print(f'{doc.id} => {doc.to_dict()}')

if __name__ == __name__:
  check_machine()
  test_firestore()
