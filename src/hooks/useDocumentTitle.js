import { useEffect } from 'react';

const SUFFIX = 'MyFood';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} - Order food online`;
  }, [title]);
};

export default useDocumentTitle;
