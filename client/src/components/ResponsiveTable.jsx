// Horizontal overflow stays inside the wrapper; the region is focusable so keyboard users can scroll it.
export default function ResponsiveTable({ caption, columns, children }) {
  return (
    <div className="table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => {
              const { label, className } = typeof col === 'string' ? { label: col } : col;
              return <th scope="col" key={label} className={className}>{label}</th>;
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
