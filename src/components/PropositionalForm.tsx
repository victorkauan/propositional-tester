import { useState, FormEvent } from 'react';

export function PropositionalForm() {
  const [userProposition, setUserProposition] = useState('');

  const validations = {
    characters: (proposition: string) => {
      const validCharacters = /^[A-Z v\~\^\-\<\>\(\)]+$/;
      return validCharacters.test(proposition);
    },
    isAProposition: (proposition: string[], operatorIndex: number) => {
      const uppercaseLetters = /[A-Z]/;
      return {
        next: uppercaseLetters.test(proposition[operatorIndex + 1]),
        previous: uppercaseLetters.test(proposition[operatorIndex - 1]),
      };
    },
    not: (proposition: string[]) => {
      let notIndex = proposition.indexOf('~');
      if (notIndex === -1) return true;

      while (notIndex !== -1) {
        const { next } = validations.isAProposition(proposition, notIndex);
        if (!next) return false;

        proposition.splice(notIndex, 1);
        notIndex = proposition.indexOf('~');
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
      'v',
      '^',
      '->',
      '<->',
    ];

    // const propositionString = userProposition.replace(/ /g, '');
    // const propositionArray = propositionString.split('');

    testPropositions.forEach((test) => {
      const testString = test.replace(/ /g, '');
      const testArray = testString.split('');

      console.log(test);
      console.log(testString);
      console.log(testArray);

      console.log(`Valid characters: ${validations.characters(testString)}`);
      console.log(`Not operator: ${validations.not(testArray)}`);
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
