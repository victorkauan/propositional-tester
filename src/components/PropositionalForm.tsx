import { useState, FormEvent } from 'react';

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

export function PropositionalForm() {
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
        const { next } = validations.isAProposition(proposition, notIndex);
        if (!next) return false;

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

  function testProposition() {
    const propositionString = userProposition.replace(/ /g, '');
    if (!validations.hasValidCharacters(propositionString)) return false;

    const { propositionArray, isValid } = validations.joinOperatorCharacters(
      propositionString.split('')
    );
    if (!isValid) return false;

    console.log(userProposition);
    console.log(propositionString);
    console.log(propositionArray);

    if (!validations.parentheses.openClose(propositionString)) return false;

    if (validations.parentheses.empty(propositionArray)) return false;

    if (!validations.parentheses.validOperationsWith(propositionArray))
      return false;

    if (validations.hasConsecutiveLetters(propositionArray)) return false;

    const unaryOperators = ['~'];
    const areUnaryOperatorsValid = unaryOperators.every((operator) =>
      validations.unaryOperators(propositionArray, operator)
    );

    const binaryOperators = ['^', 'v', '->', '<->'];
    const areBinaryOperatorsValid = binaryOperators.every((operator) =>
      validations.binaryOperators(propositionArray, operator)
    );

    if (!areUnaryOperatorsValid || !areBinaryOperatorsValid) return false;

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    console.log(testProposition());
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Formula:
        <input
          type='text'
          name='proposition'
          value={userProposition}
          onChange={(event) => setUserProposition(event.target.value)}
        />
      </label>
      <input type='submit' value='Test' />
    </form>
  );
}
