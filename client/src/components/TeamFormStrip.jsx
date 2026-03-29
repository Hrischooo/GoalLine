function getFormClass(result) {
  if (result === 'W') {
    return 'team-form-strip__item team-form-strip__item--win';
  }

  if (result === 'D') {
    return 'team-form-strip__item team-form-strip__item--draw';
  }

  if (result === 'L') {
    return 'team-form-strip__item team-form-strip__item--loss';
  }

  return 'team-form-strip__item';
}

export default function TeamFormStrip({ form = [], label = 'Form' }) {
  const values = form.length ? form : ['N/A'];

  return (
    <div className="team-form-strip" aria-label={label}>
      {values.map((result, index) => (
        <span className={getFormClass(result)} key={`${result}-${index}`}>
          {result}
        </span>
      ))}
    </div>
  );
}
