type LogicalValueSelectorProps = {
  letter: string;
  logicalValue: boolean;
};

export function LogicalValueSelector(props: LogicalValueSelectorProps) {
  const inputName = `${props.letter}LogicValue`;

  return (
    <>
      <li className={props.letter}>
        {props.letter}:
        <input
          type='radio'
          className='trueRadio'
          name={inputName}
          value='1'
          defaultChecked
        />
        V
        <input type='radio' className='falseRadio' name={inputName} value='0' />
        F
      </li>
    </>
  );
}
