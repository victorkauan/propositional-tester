import { useState, FormEvent } from 'react';

export function PropositionalForm() {
  const [userProposition, setUserProposition] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    testProposition();
    event.preventDefault();
  }

  function onlyValidCharacters(proposition: string) {
    const validCharacters = /^[A-Z v\~\^\-\<\>\(\)]+$/;
    return validCharacters.test(proposition);
  }

  function testProposition() {
    const propositionString = userProposition.replace(/ /g, '');
    if (!onlyValidCharacters(propositionString)) return false;
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
