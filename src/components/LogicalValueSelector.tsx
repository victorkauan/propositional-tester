type LogicalValueSelectorProps = {
  letter: string;
  logicalValue: boolean;
};

export function LogicalValueSelector(props: LogicalValueSelectorProps) {
  return (
    <li className={props.letter}>
      {props.letter}:
      <select>
        <option className='trueOption' value='1'>
          V
        </option>
        <option className='falseOption' value='0'>
          F
        </option>
      </select>
    </li>
  );
}
