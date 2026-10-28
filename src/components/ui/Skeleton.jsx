const Skeleton = ({ width = '100%', height = 16, radius = 8, circle = false, className = '' }) => (
  <span
    className={`skeleton ${circle ? 'skeleton--circle' : ''} ${className}`.trim()}
    style={{
      width: circle ? height : width,
      height,
      borderRadius: circle ? '50%' : radius,
    }}
    aria-hidden="true"
  />
);

export const RestaurantCardSkeleton = () => (
  <div className="card-skeleton">
    <Skeleton height={168} radius={16} />
    <div className="card-skeleton__body">
      <Skeleton width="70%" height={18} />
      <Skeleton width="45%" height={13} />
      <Skeleton width="85%" height={13} />
      <Skeleton width="35%" height={13} />
    </div>
  </div>
);

export const ListRowSkeleton = () => (
  <div className="row-skeleton">
    <Skeleton width={84} height={84} radius={12} />
    <div className="row-skeleton__body">
      <Skeleton width="60%" height={16} />
      <Skeleton width="80%" height={12} />
      <Skeleton width="30%" height={12} />
    </div>
  </div>
);

export default Skeleton;
