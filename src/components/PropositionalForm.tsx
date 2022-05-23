import { useState, FormEvent } from 'react';

export function PropositionalForm() {
  const [userProposition, setUserProposition] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    testProposition();
    event.preventDefault();
  }

  const validations = {
    validCharacters: (formula: string) => {
      const validCharacters = /^[A-Z v\~\^\-\<\>\(\)]+$/;
      return validCharacters.test(formula);
    },
    not: (formula: string) => {
      let formulaArray = formula.split('');

      let notIndex = formulaArray.indexOf('~');
      if (notIndex === -1) return true;

      const uppercaseLetters = /[A-Z]/;
      while (notIndex !== -1) {
        const nextIsALetter = uppercaseLetters.test(formulaArray[notIndex + 1]);
        if (!nextIsALetter) return false;

        formulaArray.splice(notIndex, 1);
        notIndex = formulaArray.indexOf('~');
      }

      return true;
    },
  };

  function testProposition() {
    const formulaString = userProposition.replace(/ /g, '');

    if (
      validations.validCharacters(formulaString) &&
      validations.not(formulaString)
    )
      return true;

    return false;
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
