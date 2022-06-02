import { useState, FormEvent } from 'react';
import { LogicalValueSelector } from './LogicalValueSelector';

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

type BooleanCalculations = {
  not: (proposition: string[]) => string[];
};

export function PropositionalForm() {
  const [propositionInput, setPropositionInput] = useState('');
  const [propositionList, setPropositionList] = useState<PropositionList>([]);
  const [userProposition, setUserProposition] = useState('');

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

  const booleanCalculations: BooleanCalculations = {
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
      const trueRadio: any = proposition.querySelector('.trueRadio');

      newPropositionList.push({
        letter: proposition.className,
        logicalValue: trueRadio.checked,
      });
    });

    setPropositionList(newPropositionList);
    return newPropositionList;
  }

  function calculateProposition() {
    const propositionList = updatePropositionListValues();

    let propositionString = userProposition;
    propositionList.map((proposition) => {
      const { letter, logicalValue } = proposition;
      propositionString = propositionString.replace(
        letter,
        logicalValue ? '1' : '0'
      );
    });

    let { propositionArray } = validations.joinOperatorCharacters(
      propositionString.split('')
    );

    propositionArray = booleanCalculations.not(propositionArray);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const { proposition, isValid } = validateProposition();
    if (isValid) {
      setUserProposition(proposition);
      createPropositionList(proposition);
    } else console.log(false);
    event.preventDefault();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Formula:
          <input
            type='text'
            name='proposition'
            value={propositionInput}
            onChange={(event) => setPropositionInput(event.target.value)}
          />
        </label>
        <input type='submit' value='Test' />
      </form>

      <ul>
        {propositionList.map((proposition) => (
          <LogicalValueSelector
            key={proposition.letter}
            letter={proposition.letter}
            logicalValue={proposition.logicalValue}
          />
        ))}
      </ul>

      <button onClick={calculateProposition}>Calculate</button>
    </>
  );
}
