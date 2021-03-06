import { useState, FormEvent } from 'react';
import { LogicalValueSelector } from './LogicalValueSelector';

import '../styles/global.scss';

type Validations = {
  hasValidCharacters: (proposition: string) => boolean;
  joinOperatorCharacters: (proposition: string[]) => {
    propositionArray: string[];
    isValid: boolean;
  };
  hasConsecutiveLetters: (proposition: string[]) => boolean;
  parentheses: {
    openClose: (proposition: string) => boolean;
    empty: (proposition: string[]) => boolean;
    validOperationsWith: (proposition: string[]) => boolean;
  };
  isAProposition: (
    proposition: string[],
    operatorIndex: number
  ) => { next: boolean; previous: boolean };
  unaryOperators: (proposition: string[], operatorSymbol: string) => boolean;
  binaryOperators: (proposition: string[], operatorSymbol: string) => boolean;
};

type PropositionList = { letter: string; logicalValue: boolean }[];

type PropositionArray = (proposition: string[]) => string[];

type BooleanCalculations = {
  not: PropositionArray;
  and: PropositionArray;
  or: PropositionArray;
  conditional: PropositionArray;
  biconditional: PropositionArray;
};

export function PropositionalForm() {
  const [propositionInput, setPropositionInput] = useState('');
  const [propositionList, setPropositionList] = useState<PropositionList>([]);
  const [userProposition, setUserProposition] = useState('');
  const [logicalValueResult, setLogicalValueResult] = useState('');

  const validations: Validations = {
    hasValidCharacters: (proposition) => {
      const validCharacters = /^[A-Z v\~\^\-\<\>\(\)]+$/;
      return validCharacters.test(proposition);
    },
    hasConsecutiveLetters: (proposition) => {
      const uppercaseLetters = /[A-Z]/;

      for (let i = 0; i < proposition.length - 1; i++) {
        if (
          uppercaseLetters.test(proposition[i]) &&
          uppercaseLetters.test(proposition[i + 1])
        )
          return true;
      }

      return false;
    },
    parentheses: {
      empty: (proposition) => {
        for (let i = 0; i < proposition.length; i++) {
          if (proposition[i] === '(' && proposition[i + 1] === ')') return true;
        }

        return false;
      },
      openClose: (proposition) => {
        const notParentheses = /[^\(\)]/;
        let propositionArray = proposition.replace(notParentheses, '');

        let openIndex = propositionArray.indexOf('(');
        let closeIndex = propositionArray.indexOf(')');

        if (openIndex === -1 && closeIndex === -1) return true;

        let openCloseCounter = 0;

        for (let i = 0; i < propositionArray.length; i++) {
          if (propositionArray[i] === '(') openCloseCounter += 1;
          else if (propositionArray[i] === ')') openCloseCounter -= 1;

          if (openCloseCounter < 0) return false;
        }

        return openCloseCounter === 0;
      },
      validOperationsWith: (proposition) => {
        const openCharacters = /([v\^\(\~]|->|<->)/;
        const closeCharacters = /([v\^\)]|->|<->)/;

        for (let i = 0; i < proposition.length; i++) {
          if (
            i !== 0 &&
            proposition[i] === '(' &&
            !openCharacters.test(proposition[i - 1])
          )
            return false;

          if (
            i !== proposition.length - 1 &&
            proposition[i] === ')' &&
            !closeCharacters.test(proposition[i + 1])
          )
            return false;
        }

        return true;
      },
    },
    joinOperatorCharacters: (proposition) => {
      let barIndex = proposition.indexOf('-');
      if (barIndex === -1)
        return { propositionArray: proposition, isValid: true };

      while (barIndex !== -1) {
        const previous = barIndex - 1,
          next = barIndex + 1;

        if (proposition[next] === '>') {
          proposition.splice(next, 1);

          if (proposition[previous] === '<') {
            proposition[barIndex] = '<->';
            proposition.splice(previous, 1);
          } else {
            proposition[barIndex] = '->';
          }
        } else {
          return { propositionArray: [''], isValid: false };
        }

        barIndex = proposition.indexOf('-');
      }

      return { propositionArray: proposition, isValid: true };
    },
    isAProposition: (proposition, operatorIndex) => {
      const uppercaseLetters = /[A-Z]/;
      const openParentheses = /\(/;
      const closeParentheses = /\)/;
      const notOperator = /~/;
      return {
        previous:
          uppercaseLetters.test(proposition[operatorIndex - 1]) ||
          closeParentheses.test(proposition[operatorIndex - 1]),
        next:
          uppercaseLetters.test(proposition[operatorIndex + 1]) ||
          openParentheses.test(proposition[operatorIndex + 1]) ||
          notOperator.test(proposition[operatorIndex + 1]),
      };
    },
    unaryOperators: (proposition, operatorSymbol) => {
      let notIndex = proposition.indexOf(operatorSymbol);
      if (notIndex === -1) return true;

      while (notIndex !== -1) {
        const { previous, next } = validations.isAProposition(
          proposition,
          notIndex
        );
        if (previous || !next) return false;

        proposition = proposition.filter((_, index) => index !== notIndex);
        notIndex = proposition.indexOf(operatorSymbol);
      }

      return true;
    },
    binaryOperators: (proposition, operatorSymbol) => {
      let operatorIndex = proposition.indexOf(operatorSymbol);
      if (operatorIndex === -1) return true;

      while (operatorIndex !== -1) {
        const { previous, next } = validations.isAProposition(
          proposition,
          operatorIndex
        );
        if (!previous || !next) return false;

        proposition = proposition.filter((_, index) => index !== operatorIndex);
        operatorIndex = proposition.indexOf(operatorSymbol);
      }

      return true;
    },
  };

  function validateProposition() {
    const propositionString = propositionInput.replace(/ /g, '');

    const { propositionArray, isValid } = validations.joinOperatorCharacters(
      propositionString.split('')
    );

    if (
      !validations.hasValidCharacters(propositionString) ||
      validations.hasConsecutiveLetters(propositionArray) ||
      !isValid ||
      !validations.parentheses.openClose(propositionString) ||
      validations.parentheses.empty(propositionArray) ||
      !validations.parentheses.validOperationsWith(propositionArray)
    )
      return { proposition: propositionString, isValid: false };

    const unaryOperators = ['~'];
    const areUnaryOperatorsValid = unaryOperators.every((operator) =>
      validations.unaryOperators(propositionArray, operator)
    );

    const binaryOperators = ['^', 'v', '->', '<->'];
    const areBinaryOperatorsValid = binaryOperators.every((operator) =>
      validations.binaryOperators(propositionArray, operator)
    );

    if (!areUnaryOperatorsValid || !areBinaryOperatorsValid)
      return { proposition: propositionString, isValid: false };

    return { proposition: propositionString, isValid: true };
  }

  const operatorCalculations: BooleanCalculations = {
    not: (proposition) => {
      let notIndex = proposition.indexOf('~');
      if (notIndex === -1) proposition;

      while (notIndex !== -1) {
        if (proposition[notIndex + 1] === '0') proposition[notIndex + 1] = '1';
        else proposition[notIndex + 1] = '0';

        proposition = proposition.filter((_, index) => index !== notIndex);
        notIndex = proposition.indexOf('~');
      }

      return proposition;
    },
    and: (proposition) => {
      let andIndex = proposition.indexOf('^');
      if (andIndex === -1) return proposition;

      while (andIndex !== -1) {
        if (
          (proposition[andIndex - 1] === '0' &&
            proposition[andIndex + 1] === '0') ||
          (proposition[andIndex - 1] === '0' &&
            proposition[andIndex + 1] === '1') ||
          (proposition[andIndex - 1] === '1' &&
            proposition[andIndex + 1] === '0')
        )
          proposition[andIndex + 1] = '0';
        else proposition[andIndex + 1] = '1';

        proposition = proposition.filter(
          (_, index) => index !== andIndex - 1 && index !== andIndex
        );
        andIndex = proposition.indexOf('^');
      }

      return proposition;
    },
    or: (proposition) => {
      let orIndex = proposition.indexOf('v');
      if (orIndex === -1) return proposition;

      while (orIndex !== -1) {
        if (
          (proposition[orIndex - 1] === '0' &&
            proposition[orIndex + 1] === '1') ||
          (proposition[orIndex - 1] === '1' &&
            proposition[orIndex + 1] === '0') ||
          (proposition[orIndex - 1] === '1' && proposition[orIndex + 1] === '1')
        )
          proposition[orIndex + 1] = '1';
        else proposition[orIndex + 1] = '0';

        proposition = proposition.filter(
          (_, index) => index !== orIndex - 1 && index !== orIndex
        );
        orIndex = proposition.indexOf('v');
      }

      return proposition;
    },
    conditional: (proposition) => {
      let conditionalIndex = proposition.indexOf('->');
      if (conditionalIndex === -1) return proposition;

      while (conditionalIndex !== -1) {
        if (
          proposition[conditionalIndex - 1] === '1' &&
          proposition[conditionalIndex + 1] === '0'
        )
          proposition[conditionalIndex + 1] = '0';
        else proposition[conditionalIndex + 1] = '1';

        proposition = proposition.filter(
          (_, index) =>
            index !== conditionalIndex - 1 && index !== conditionalIndex
        );
        conditionalIndex = proposition.indexOf('->');
      }

      return proposition;
    },
    biconditional: (proposition) => {
      let biconditionalIndex = proposition.indexOf('<->');
      if (biconditionalIndex === -1) return proposition;

      while (biconditionalIndex !== -1) {
        if (
          (proposition[biconditionalIndex - 1] === '1' &&
            proposition[biconditionalIndex + 1] === '0') ||
          (proposition[biconditionalIndex - 1] === '0' &&
            proposition[biconditionalIndex + 1] === '1')
        )
          proposition[biconditionalIndex + 1] = '0';
        else proposition[biconditionalIndex + 1] = '1';

        proposition = proposition.filter(
          (_, index) =>
            index !== biconditionalIndex - 1 && index !== biconditionalIndex
        );
        biconditionalIndex = proposition.indexOf('<->');
      }

      return proposition;
    },
  };

  function createPropositionList(proposition: string) {
    const propositionString = proposition.replace(/[^A-Z]/g, '');
    const propositionArray = propositionString.split('');

    let propositions: PropositionList = [];
    let letters: string[] = [];

    propositionArray.forEach((proposition) => {
      if (!letters.includes(proposition)) {
        propositions.push({ letter: proposition, logicalValue: false });
        letters.push(proposition);
      }
    });

    setPropositionList(propositions);
  }

  function updatePropositionListValues() {
    let propositions = document.querySelectorAll('li');

    let newPropositionList: PropositionList = [];

    propositions.forEach((proposition) => {
      const select: any = proposition.querySelector('select');

      newPropositionList.push({
        letter: proposition.className,
        logicalValue: select.options.selectedIndex === 0 ? true : false,
      });
    });

    setPropositionList(newPropositionList);
    return newPropositionList;
  }

  function calculateOperations(proposition: string[]): string[] {
    let key: keyof typeof operatorCalculations;
    for (key in operatorCalculations)
      proposition = operatorCalculations[key](proposition);

    return proposition;
  }

  function calculateProposition() {
    const propositionListValues = updatePropositionListValues();

    let propositionString = userProposition;
    propositionListValues.map((proposition) => {
      const { letter, logicalValue } = proposition;
      const letterRegExp = new RegExp(letter, 'g');

      propositionString = propositionString.replace(
        letterRegExp,
        logicalValue ? '1' : '0'
      );
    });

    let { propositionArray } = validations.joinOperatorCharacters(
      propositionString.split('')
    );

    while (propositionArray.includes('(')) {
      let openIndex: any;
      let closeIndex: any;

      for (let i = 0; i < propositionArray.length; i++) {
        if (propositionArray[i] === '(') openIndex = i;
        else if (propositionArray[i] === ')') {
          closeIndex = i;
          break;
        }
      }

      propositionArray[openIndex] = calculateOperations(
        propositionArray.slice(openIndex, closeIndex + 1)
      )[1];

      propositionArray = propositionArray.filter(
        (_, index) => index <= openIndex || index > closeIndex
      );
    }

    propositionArray = calculateOperations(propositionArray);

    setLogicalValueResult(propositionArray[0] === '1' ? 'Verdadeira' : 'Falsa');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const { proposition, isValid } = validateProposition();
    if (isValid) {
      setUserProposition(proposition);
      createPropositionList(proposition);
    } else alert('Proposi????o inv??lida!');

    event.preventDefault();
  }

  return (
    <>
      <div className='propositionInput'>
        <h1>Provador Proposicional</h1>
        <form className='propositionalForm' onSubmit={handleSubmit}>
          <label>
            <h2>Express??o Booleana:</h2>
            <input
              type='text'
              name='proposition'
              value={propositionInput}
              onChange={(event) => setPropositionInput(event.target.value)}
            />
          </label>
          <input type='submit' value='TESTAR PROPOSI????O' />
        </form>

        {propositionList.length > 0 && (
          <div className='calculateProposition'>
            <h2>Proposi????es de {userProposition}:</h2>
            <ul className='propositionList'>
              {propositionList.map((proposition) => (
                <LogicalValueSelector
                  key={proposition.letter}
                  letter={proposition.letter}
                  logicalValue={proposition.logicalValue}
                />
              ))}
            </ul>

            <button onClick={calculateProposition}>
              CALCULAR VALOR L??GICO
            </button>
          </div>
        )}

        {logicalValueResult && (
          <div className='propositionResult'>
            <p className='logicalValueResult'>
              Valor l??gico: <strong>{logicalValueResult}</strong>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
