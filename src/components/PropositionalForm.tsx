import { useState, FormEvent } from 'react';

type Validations = {
  characters: (proposition: string) => boolean;
  joinOperatorCharacters: (proposition: string[]) => {
    propositionArray: string[];
    isValid: boolean;
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
    characters: (proposition) => {
      const validCharacters = /^[A-Z v\~\^\-\<\>\(\)]+$/;
      return validCharacters.test(proposition);
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
      return {
        previous:
          uppercaseLetters.test(proposition[operatorIndex - 1]) ||
          closeParentheses.test(proposition[operatorIndex - 1]),
        next:
          uppercaseLetters.test(proposition[operatorIndex + 1]) ||
          openParentheses.test(proposition[operatorIndex + 1]),
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
    const { propositionArray, isValid } = validations.joinOperatorCharacters(
      propositionString.split('')
    );

    if (!isValid) return false;

    console.log(userProposition);
    console.log(propositionString);
    console.log(propositionArray);

    const unaryOperators = ['~'];
    const areUnaryOperatorsValid = unaryOperators.every((operator) =>
      validations.unaryOperators(propositionArray, operator)
    );

    const binaryOperators = ['^', 'v', '->', '<->'];
    const areBinaryOperatorsValid = binaryOperators.every((operator) =>
      validations.binaryOperators(propositionArray, operator)
    );

    if (
      !validations.characters(propositionString) ||
      !areUnaryOperatorsValid ||
      !areBinaryOperatorsValid
    )
      return false;

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
