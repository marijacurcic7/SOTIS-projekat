import { Answer } from "../answer.model";
import { parse } from 'js2xmlparser'
import { Question } from "../question.model";

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
    'qti-correct-response': {
      'qti-value': {
        '#': string;
      }[];
    }
  };

  'qti-outcome-declaration': {
    '@': {
      'base-type': 'float';
      'cardinality': 'single';
      'identifier': 'SCORE';
    };
    'qti-default-value': {
      'qti-value': number; // koliko bodova nosi pitanja
    }
  };

  'qti-item-body': {
    'qti-prompt': {
      '#': string;
    };
    'qti-choice-interaction': {
      '@': {
        'max-choices': number;
        'response-identifier': 'RESPONSE';
      };
      'qti-simple-choice': {
        '@': {
          'identifier': string;
        },
        '#': string;
      }[];
    }
  };

  'qti-response-processing': {
    '@': {
      'template': "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"; // 
    }
  }

  constructor(question: Question, answer: Answer) {
    if(!question.id) return;
    if(!question.domainProblemName) return;
    this.initRoot(question.id, question.domainProblemName);
    this.initCorrectAnswers(answer);
    this.initOutcome(question);
    this.initBody(question, answer);
    this.initResponseProcessing();
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
    let qtivalues = []
    for(let ans in answer.correctAnswers) {
      let qtivalue = {
          '#': ans,
      }
      qtivalues.push(qtivalue);
    }

    this["qti-response-declaration"] = {
      '@': {
        'identifier': 'RESPONSE',
        'cardinality': 'multiple',
        'base-type': 'identifier',
      },
      'qti-correct-response': {
        'qti-value': qtivalues,
      }
      
    }
  }

  private initOutcome(question: Question) {
    this['qti-outcome-declaration'] = {
      '@': {
        'base-type': 'float',
        'cardinality': 'single',
        'identifier': 'SCORE'
      },
      'qti-default-value': {
        'qti-value': question.maxPoints,
      }
    }
  }


  private initBody(question: Question, answer: Answer) {
    let maxchoices = 1;
    if(answer.correctAnswers.length > 1){
      maxchoices = question.possibleAnswers.length;
    }

    let simpleChoices = [];
    for(let ans of question.possibleAnswers){
      let simpleChoice = this.initSimpleChoice(ans);
      simpleChoices.push(simpleChoice);
    }

    this['qti-item-body'] = {
      'qti-prompt': {
        '#': question.text,
      },
      'qti-choice-interaction': {
        '@': {
          'max-choices': maxchoices,
          'response-identifier': 'RESPONSE',
        },
        'qti-simple-choice': simpleChoices,
      }
    }
  }

  private initSimpleChoice(possibleAnswer: string) {
    let simpleChoice = {
      // 'qti-simple-choice': {
        '@': {
          'identifier': possibleAnswer,
        },
        '#': possibleAnswer,
      // }
    }
    return simpleChoice;
  }

  private initResponseProcessing() {
    this['qti-response-processing'] = {
      '@': {
        'template': "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct", 
      }
    }
  }

  public getXml() {
    return parse('qti-assessment-item', this)
  }
}
