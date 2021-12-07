import numpy
import pandas as pd
from learning_spaces.kst import iita, simu

def basic_test():
    data_frame = pd.DataFrame({'a': [1, 0, 1], 'b': [0, 1, 0], 'c': [0, 1, 1]})
    response = iita(data_frame, v=1)
    print(response)

def test_sim():
    implications = [(1,3), (2,4), (3,5), (4,5)]
    num_of_questions = 5
    num_of_students = 3
    response = simu(items=num_of_questions, size=num_of_students, ce=0, lg=0, delta=0, imp=implications)
    
    print(response['dataset'], type(response['dataset']))
    print(iita(response['dataset'], v=1))
    # print('-------------')
    # print(response['states'])
    # print('-------------')
    # print(response['implications'])
    pass

def test_iita():
    data1 = pd.DataFrame({'a': [0, 1, 0, 0, 0], 'b': [1, 1, 1 ,1, 1], 'c': [1, 0, 1 ,0, 0]}).to_numpy().T
    print(data1)
    res1 = iita(data1, v=1)
    print(res1)

    # data2 = numpy.array([
    #     [1,0,1],
    #     [0,1,0],
    #     [0,1,1]
    # ]).T
    # res2 = iita(data2, v=1)
    # print(res2)
    # print((data1==data2).all(), end='\n-------\n')
    pass

if __name__ == '__main__':
    # test_sim()
    test_iita()