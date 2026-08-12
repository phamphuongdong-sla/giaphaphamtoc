export const Legend = () => {
  const items = [
    { gen: 1, color: '#c94035', label: 'Đời 1' },
    { gen: 2, color: '#d4943a', label: 'Đời 2' },
    { gen: 3, color: '#3da870', label: 'Đời 3' },
    { gen: 4, color: '#3a7fc4', label: 'Đời 4' },
    { gen: 5, color: '#9060b8', label: 'Đời 5+' },
  ];

  return (
    <div className="legend">
      {items.map(({ gen, color, label }) => (
        <span key={gen} className="legend-item">
          <span className="legend-color" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
};