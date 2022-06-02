type LogicValueSelectorProps = {
  letter: string;
  logicValue: boolean;
};

export function LogicValueSelector(props: LogicValueSelectorProps) {
  const inputName = `${props.letter.toLocaleLowerCase()}LogicValue`;

  return (
    <>
      <li>
        {props.letter}:
        <input type='radio' name={inputName} value='1' />V
        <input type='radio' name={inputName} value='0' />F
      </li>
    </>
  );
}
