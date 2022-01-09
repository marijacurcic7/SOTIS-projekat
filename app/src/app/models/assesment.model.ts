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