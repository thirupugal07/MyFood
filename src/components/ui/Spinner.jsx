const Spinner = ({ size = 20, label = 'Loading' }) => (
  <span className="spinner" style={{ width: size, height: size }} role="status" aria-label={label}>
    <span className="sr-only">{label}</span>
  </span>
);

export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="page-loader">
    <Spinner size={28} />
    <p>{label}</p>
  </div>
);

export default Spinner;
