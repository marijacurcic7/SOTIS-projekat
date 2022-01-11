// import { Question } from "../question.model";
import { Answer } from "../answer.model";
import { parse } from 'js2xmlparser'

export class AssessmentItem {
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

  'qti-item-body': {
    'qti-choice-interaction': {
      '@': {
        'max-choices': 0,
        'response-identifier': 'RESPONSE'
      },
      'qti-simple-choice': {
        '@': {
          'identifier': string // povezano sa correct answer
        },
        '#': string
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
    this.initRoot('12345', 'bilo sta')
    this.initCorrectAnswers({ correctAnswers: ['true', 'false'], id: '12345' })
  }

  private initRoot(questionId: string, domainProblemName: string) {
    this["@"] = {
      'identifier': questionId,
      'title': domainProblemName,
      // set default values
      'xmlns': 'http://www.imsglobal.org/xsd/qti/imsqtiasi_v3p0',
      "xmlns:xsi": 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://www.imsglobal.org/xsd/qti/qtiv3p0/imsqti_itemv3p0_v1p0.xsd',
      'adaptive': false,
      'time-dependent': false
    }
  }

  private initCorrectAnswers(answer: Answer) {

    this["qti-response-declaration"] = {
      '@': {
        'identifier': 'RESPONSE',
        'cardinality': 'multiple',
        'base-type': 'identifier',
      },
      'qti-correct-response': answer.correctAnswers,
    }
  }

  // private initOutcome(question: Question) {
  //   this['qti-outcome-declaration'] = {
  //     '@': {
  //       'base-type': 'float',
  //       'cardinality': 'single',
  //       'identifier': 'SCORE'
  //     },
  //     'qti-default-value': {
  //       'qti-value': question.maxPoints,
  //     }
  //   }
  // }


  // private initBody(question: Question) {

  // }

  public getXml() {
    return parse('assessmentItem', this)
  }
}
