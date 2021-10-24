# Python microservice with Firebase

### Setup
`python3 -m venv .venv`

`source .venv/bin/activate`

`pip install firebase-admin`

`python3 test_connection.py`


***Note for Apple Silicon.*** 

Some libraries do not support Apple chip, and cannot be run. Must use it as Intel chip, hence python3-intel64 command when creating virtual env.

`python3-intel64 -m venv .venv`

`source .venv/bin/activate`

`pip install firebase-admin`

`python3 test_connection.py`