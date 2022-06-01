import { useState, FormEvent } from 'react';

type Validations = {
  characters: (proposition: string) => boolean;
  joinOperatorCharacters: (proposition: string[]) => {
    proposition: string[];
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
      if (barIndex === -1) return { proposition, isValid: true };

      while (barIndex !== -1) {
        const previous = barIndex - 1,
          next = barIndex + 1;

        if (proposition[next] === '>') {
          if (proposition[previous] === '<') {
            proposition[barIndex] = '<->';
            proposition.splice(next, 1);
            proposition.splice(previous, 1);
          } else {
            proposition[barIndex] = '->';
            proposition.splice(next, 1);
          }
        } else return { proposition: [''], isValid: false };

        barIndex = proposition.indexOf('-');
      }

      return { proposition, isValid: true };
    },
    isAProposition: (proposition, operatorIndex) => {
      const uppercaseLetters = /[A-Z]/;
      return {
        previous: uppercaseLetters.test(proposition[operatorIndex - 1]),
        next: uppercaseLetters.test(proposition[operatorIndex + 1]),
      };
    },
    unaryOperators: (proposition, operatorSymbol) => {
      let notIndex = proposition.indexOf(operatorSymbol);
      if (notIndex === -1) return true;

      while (notIndex !== -1) {
        const { next } = validations.isAProposition(proposition, notIndex);
        if (!next) return false;

        proposition.splice(notIndex, 1);
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

        proposition.splice(operatorIndex, 1);
        operatorIndex = proposition.indexOf(operatorSymbol);
      }

      return true;
    },
  };

  function testProposition() {
    const testPropositions = [
      '~A',
      'A v B',
      'A ^ B',
      'A -> B',
      'A <-> B',
      '~',
      '^',
      'v',
      '->',
      '<->',
    ];

    // const propositionString = userProposition.replace(/ /g, '');
    // const propositionArray = propositionString.split('');

    testPropositions.forEach((test) => {
      const testString = test.replace(/ /g, '');
      const { proposition, isValid } = validations.joinOperatorCharacters(
        testString.split('')
      );

      if (!isValid) return;

      const testArray = proposition;

      console.log(test);
      console.log(testString);
      console.log(testArray);

      console.log(`Valid characters: ${validations.characters(testString)}`);
      console.log(
        `Not operator: ${validations.unaryOperators(testArray, '~')}`
      );
      console.log(
        `And operator: ${validations.binaryOperators(testArray, '^')}`
      );
      console.log(
        `Or operator: ${validations.binaryOperators(testArray, 'v')}`
      );
      console.log(
        `Conditional operator: ${validations.binaryOperators(testArray, '->')}`
      );
      console.log(
        `Equivalence operator: ${validations.binaryOperators(testArray, '<->')}`
      );
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    testProposition();
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
