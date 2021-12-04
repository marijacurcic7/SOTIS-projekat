import pandas as pd
from learning_spaces.kst import iita, simu

def basic_test():
    data_frame = pd.DataFrame({'a': [1, 0, 1], 'b': [0, 1, 0], 'c': [0, 1, 1]})
    response = iita(data_frame, v=1)
    print(response)

def test_sim():
    implications = [(1,3), (2,4), (3,5), (4,5)]
    num_of_questions = 5
    num_of_students = 10
    response = simu(items=num_of_questions, size=num_of_students, ce=0, lg=0, delta=0, imp=implications)
    
    print(response['dataset'])
    # print('-------------')
    # print(response['states'])
    # print('-------------')
    # print(response['implications'])
    pass

if __name__ == '__main__':
    test_sim()