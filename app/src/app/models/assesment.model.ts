import { Test } from "./test.model";

export class AssessmentItem {
  identifier: string; // Question.id
  title: string; // Question.domainProblemName
  adaptive: boolean; // false
  timeDependent: boolean; // false
  responseDeclaration: {
    identifier: string; // RESPONSE
    cardinality: string; // multiple / single
    baseType: string; // identifier
    correctResponse: string[]; // Answer.correctAnswers[n]
  };
  outcomeDeclaration: {
    identifier: string; // MAXSCORE (multiple cardinality) / SCORE (single cardinality)
    cardinality: string; // multiple / single
    baseType: string; // float
    defaultValue: {
      value: number; // Question.maxPoints
    }
  };
  itemBody: {
    choiceInteraction: {
      responseIdentifier: string; // RESPONSE
      maxChoices: string; // ako ima 1 tacan odgovor onda 1, ako ima vise onda je jednako broju ponudjenih odgovora
      prompt: string; // Question.text
      simpleChoice: {
        identifier: string; // Question.possibleAnswers[n]
        value: string; // kod nas je isti kao identifier
      }[]
    }
  };
  responseProcessing: {
    template: string; // match_correct?
  };
}

export class AssessmentItem2 {
  '@': {
    'identifier': string; // Question.id
    'title': string;
    'adaptive': false;
    'xmlns': string;
    'xmlns:xsi': string;
    'xsi:schemaLocation': string;
    'time-dependent': false;
  };

  'qti-response-declaration': {
    '@': {
      'identifier': 'RESPONSE';
      'cardinality': 'multiple';
      'base-type': 'identifier';
    }
    'qti-correct-response': string[], 
  };

  'qti-outcome-declaration': {
    '@': {
      'base-type': 'float',
      'cardinality': 'single',
      'identifier': 'SCORE'
    };
    'qti-default-value': {
      'qti-value': number; // koliko bodova nosi pitanja
    }
  };

  'qti-item-body' : {
    'qti-choice-interaction' : {
      '@': {
        'max-choices': 0,
        'response-identifier': 'RESPONSE'
      },
      'qti-simple-choice' : {
        '@': {
          'identifier': string // povezano sa correct answer
        },
        '#' : string
      }
    }
  };

  'qti-response-processing': {
    '@': {
      'template': "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"; // 
    }
  }

  constructor() {
    // TODO: proslediti u konstruktor neophodne objekte i pozvati privatne metode
  }

  private initRoot(questionId: string, domainProblemName: string) {
    this["@"] = {
      'identifier': questionId,
      'title': domainProblemName,
      // set default values
      'xmlns': 'http://www.imsglobal.org/xsd/imsqti_v2p2',
      "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqti_v2p0 imsqti_v2p0.xsd',
      'adaptive': false,
      'time-dependent': false
    }
  }

  private initCorrectAnswers() {
    this["qti-response-declaration"] = {
      '@': {
        'identifier': 'RESPONSE',
        'cardinality': 'multiple',
        'base-type': 'identifier',
      },
      // TODO: ovo se treba popuniti
      'qti-correct-response': [], 
    }
  }

  // TODO: napraviti ostale funkcije
}


export class AssessmentTest {
    '@': {
      'identifier': string; // Test.id
      'title': string;      // Test.name
      'xmlns': string;
      'xmlns:xsi': string;
      'xsi:schemaLocation': string;
    };
  
    'qti-test-part': {
      '@': {
        'identifier': 'testPart-1';
        'navigation-mode': string;
        'submission-mode': string;
      };
      'qti-assessment-section': {
          '@': {
              'identifier': 'assessmentSection-1';
              'title': 'Section 1';
              'visible': true;
          };
          'qti-assessment-item-ref': {
              '@': {
                  'identifier': string;
                  'href': string;
              };
          }[];
      };
    };

  
    constructor() {
      // TODO: proslediti u konstruktor neophodne objekte i pozvati privatne metode
    }
  
    private initRoot(testId: string, testName: string) {
      this["@"] = {
        'identifier': testId,
        'title': testName,
        // set default values
        'xmlns': 'http://www.imsglobal.org/xsd/imsqti_v2p2',
        "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqti_v2p0 imsqti_v2p0.xsd',
      }
    }
  
    private initTestPart() {
      this["qti-test-part"] = {
        '@': {
          'identifier': 'testPart-1',
          'navigation-mode': 'nonlinear',
          'submission-mode': 'individual',
        },
        'qti-assessment-section': {
            '@': {
                'identifier': 'assessmentSection-1',
                'title': 'Section 1',
                'visible': true,
            },
            'qti-assessment-item-ref': []
        },
      }
    }

}